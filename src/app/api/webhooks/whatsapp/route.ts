import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
    chatbotSettings, messages, leads, customers, orders, orderItems, sellerPaymentMethods, payments,
    messageQueue, campaigns, webhookLogs, whatsappSettings
} from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { WhatsAppClient } from '@/lib/whatsapp';
import { parseOrderDetails, OrderDetails } from '@/lib/openai';
import { isDuplicateWebhook, markWebhookProcessed } from '@/lib/webhook-deduplication';
import { withWebhookRateLimit } from '@/middleware/rate-limit-middleware';

/**
 * WhatsApp Unified Webhook
 * URL: https://yourdomain.com/api/webhooks/whatsapp
 * Handles both incoming messages and status updates (delivered, read, etc).
 */

// --- SHARED HELPERS ---

// Verify webhook signature from Meta
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
    if (!signature) return false;

    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (!appSecret) {
        console.error('WHATSAPP_APP_SECRET not configured');
        return false;
    }

    // Handle both raw signature and "sha256=" prefixed signature
    const signatureHash = signature.replace('sha256=', '');

    const expectedHash = crypto
        .createHmac('sha256', appSecret)
        .update(payload)
        .digest('hex');

    try {
        return crypto.timingSafeEqual(
            Buffer.from(signatureHash, 'hex'),
            Buffer.from(expectedHash, 'hex')
        );
    } catch {
        return false;
    }
}

// --- MESSAGE HANDLER LOGIC ---

// Detect purchase intent based on keywords
function detectPurchaseIntent(message: string): boolean {
    const intentKeywords = [
        'i want to buy', 'order now', 'i want this', 'book this', 'place order',
        'i want to purchase', 'buy', 'order', 'purchase'
    ];
    const lower = message.toLowerCase();
    return intentKeywords.some(k => lower.includes(k));
}

// Generate chatbot response
async function generateChatbotResponse(message: string, settings: any, paymentSettings?: any): Promise<string> {
    const lowerMessage = message.toLowerCase();

    // 1. Check for specific keywords defined in settings
    if (settings.keywordTriggers && Array.isArray(settings.keywordTriggers)) {
        for (const trigger of settings.keywordTriggers) {
            if (trigger.keyword && lowerMessage.includes(trigger.keyword.toLowerCase())) {
                return trigger.response;
            }
        }
    }

    // 2. Payment Inquiries
    if (paymentSettings && (lowerMessage.includes('pay') || lowerMessage.includes('cod') || lowerMessage.includes('cash') || lowerMessage.includes('upi') || lowerMessage.includes('card'))) {
        const pref = paymentSettings.paymentPreference || 'both';
        let response = "";

        if (pref === 'cod') {
            response = "We accept Cash on Delivery (COD). You can pay when the order arrives.";
            if (paymentSettings.codNotes) response += ` Note: ${paymentSettings.codNotes}`;
        } else if (pref === 'online') {
            response = "We accept online payments via UPI, Credit/Debit Card, and Netbanking. We do not support COD at this time.";
        } else {
            response = "We accept both Online Payments (UPI/Cards) and Cash on Delivery (COD). Choose your preferred method at checkout.";
        }
        return response;
    }

    if (settings.welcomeMessage) {
        return settings.welcomeMessage;
    }

    const toneResponses: Record<string, string> = {
        friendly: "Thanks for your message! I'm here to help you with a friendly and warm approach. How can I assist you today?",
        professional: "Thank you for contacting us. We appreciate your inquiry and are ready to assist you with your needs in a professional manner.",
        casual: "Hey there! Got your message. What can I do for you?",
        formal: "We acknowledge receipt of your message. We shall attend to your inquiry with due diligence and professionalism.",
    };

    const languageGreetings: Record<string, string> = {
        en: "Hello!", hi: "नमस्ते!", es: "¡Hola!", fr: "Bonjour!", de: "Hallo!",
    };

    const tone = settings.tone || 'friendly';
    const language = settings.language || 'en';

    const baseResponse = toneResponses[tone] || toneResponses['friendly'];
    const greeting = languageGreetings[language] || languageGreetings['en'];

    return `${greeting} ${baseResponse}`;
}

async function saveIncomingMessage(userId: string, from: string, content: string, whatsappMessageId: string, timestamp: string) {
    try {
        const isoTimestamp = new Date(parseInt(timestamp) * 1000).toISOString();
        await db.insert(messages).values({
            userId, direction: 'inbound', phoneNumber: from, fromNumber: from, toNumber: 'BUSINESS',
            messageType: 'text', content, status: 'received', whatsappMessageId, timestamp: isoTimestamp, createdAt: isoTimestamp,
        });
    } catch (error) {
        console.error('Error saving incoming message:', error);
    }
}

async function saveOutgoingMessage(userId: string, to: string, content: string) {
    try {
        const now = new Date().toISOString();
        await db.insert(messages).values({
            userId, direction: 'outbound', phoneNumber: to, fromNumber: 'BUSINESS', toNumber: to,
            messageType: 'text', content, status: 'sent', timestamp: now, createdAt: now,
        });
    } catch (error) {
        console.error('Error saving outgoing message:', error);
    }
}

async function createOrUpdateCustomer(userId: string, phoneNumber: string) {
    try {
        const existing = await db.select().from(customers).where(and(eq(customers.userId, userId), eq(customers.phone, phoneNumber))).limit(1);

        if (existing.length === 0) {
            await db.insert(customers).values({
                userId, phone: phoneNumber, name: phoneNumber, status: 'active',
                conversationState: 'browsing', conversationContext: null,
                lastMessageTime: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            });

            await db.insert(leads).values({
                userId, name: phoneNumber, phone: phoneNumber, source: 'whatsapp', status: 'new',
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            });
        } else {
            await db.update(customers).set({
                lastMessageTime: new Date().toISOString(), updatedAt: new Date().toISOString(),
            }).where(eq(customers.id, existing[0].id));
        }
    } catch (error) {
        console.error('Error creating/updating customer:', error);
    }
}

async function handleOnboardingMessage(from: string, messageText: string) {
    console.log(`📝 Received onboarding response from ${from}:`, messageText);
    try {
        const client = WhatsAppClient.getSystemClient();
        await client.sendTextMessage(from, "Thanks! We've received your details. Our system is processing them.");
    } catch (error) {
        console.error('Error sending onboarding ack:', error);
    }
}

async function handleMessagePayload(value: any) {
    const messageData = value?.messages?.[0];
    if (!messageData) return;

    const from = messageData.from;
    const messageId = messageData.id;
    const messageType = messageData.type;
    const timestamp = messageData.timestamp;

    let messageText = '';
    if (messageType === 'text') {
        messageText = messageData.text?.body || '';
    } else {
        messageText = `[${messageType} message]`;
    }

    const phoneNumberId = value?.metadata?.phone_number_id;
    if (!phoneNumberId) return;

    // CHECK FOR SYSTEM ONBOARDING FLOW
    if (process.env.WAVEGROWW_PHONE_ID && phoneNumberId === process.env.WAVEGROWW_PHONE_ID) {
        console.log('🤖 Handling System Onboarding Message from:', from);
        await handleOnboardingMessage(from, messageText);
        return;
    }

    // 5. Identify the Seller (User) based on the Phone Number ID
    const waSettings = await db
        .select()
        .from(whatsappSettings)
        .where(eq(whatsappSettings.phoneNumberId, phoneNumberId))
        .limit(1);

    if (waSettings.length === 0) {
        console.log(`⚠️ No WhatsApp settings found for Phone ID: ${phoneNumberId}`);
        return NextResponse.json({ ok: true });
    }

    const userId = waSettings[0].userId;

    // 6. Check if chatbot is enabled for this user
    const botSettings = await db
        .select()
        .from(chatbotSettings)
        .where(eq(chatbotSettings.userId, userId))
        .limit(1);

    if (botSettings.length === 0 || !botSettings[0].enabled || !botSettings[0].autoReply) {
        // Even if chatbot is disabled, we might want to log the message for the seller's inbox
        await saveIncomingMessage(userId, from, messageText, messageId, timestamp);
        return NextResponse.json({ ok: true });
        // return; 
    }

    const settings = botSettings[0];
    await saveIncomingMessage(userId, from, messageText, messageId, timestamp);
    await createOrUpdateCustomer(userId, from);

    const customerRows = await db.select().from(customers).where(eq(customers.phone, from)).limit(1);
    const customer = customerRows[0];

    // Order flow handling
    if (customer.conversationState === 'collecting_order_details') {
        const parsed: OrderDetails | null = await parseOrderDetails(messageText);
        if (parsed && parsed.name && parsed.phone && parsed.email && parsed.address) {
            const sellerPayment = await db.select().from(sellerPaymentMethods).where(eq(sellerPaymentMethods.sellerId, userId)).limit(1);
            const paymentPreference = sellerPayment[0]?.paymentPreference || 'both';
            const razorpayLink = sellerPayment[0]?.razorpayLink;
            const upiId = sellerPayment[0]?.upiId;
            const qrImageUrl = sellerPayment[0]?.qrImageUrl;
            const codNotes = sellerPayment[0]?.codNotes;

            const orderNumber = `INV-${Date.now()}`;
            const subtotal = 1000;
            const tax = Math.round(subtotal * 0.18);
            const total = subtotal + tax;
            const initialPaymentStatus = paymentPreference === 'cod' ? 'pending_cod' : 'unpaid';

            const orderInsert = await db.insert(orders).values({
                userId, leadId: null, customerName: parsed.name, customerPhone: parsed.phone, customerEmail: parsed.email,
                shippingAddress: parsed.address, subtotal, taxAmount: tax, totalAmount: total, status: 'pending',
                paymentStatus: initialPaymentStatus, paymentMethod: null, invoiceNumber: orderNumber, invoiceUrl: '',
                orderDate: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            }).returning();

            const orderId = orderInsert[0].id;
            const finalInvoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.wavegroww.online'}/invoices/${orderId}`;
            await db.update(orders).set({ invoiceUrl: finalInvoiceUrl }).where(eq(orders.id, orderId));

            await db.insert(orderItems).values({
                orderId, productId: 1, productName: 'Sample Product', quantity: 1, unitPrice: subtotal, totalPrice: subtotal, createdAt: new Date().toISOString(),
            });

            await db.insert(payments).values({
                orderId, sellerId: userId, method: 'PENDING', amount: total, currency: 'INR', status: 'PENDING', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            });

            await db.update(customers).set({ conversationState: 'browsing', conversationContext: null, updatedAt: new Date().toISOString() }).where(eq(customers.id, customer.id));

            let paymentMessage = `✅ *Order Created Successfully!*\n\nOrder ID: ${orderId}\nTotal: ₹${(total / 100).toFixed(2)}\n\n*Payment Options:*\n`;
            const hasOnline = paymentPreference === 'online' || paymentPreference === 'both';
            const hasCod = paymentPreference === 'cod' || paymentPreference === 'both';

            if (hasOnline) {
                if (razorpayLink) paymentMessage += `\n💳 *Pay Online (Razorpay)*\nClick to pay securely: ${razorpayLink}\n✓ Automatic confirmation\n`;
                if (upiId) {
                    const upiDeepLink = `upi://pay?pa=${upiId}&pn=Order${orderId}&am=${(total / 100).toFixed(2)}&cu=INR`;
                    paymentMessage += `\n📱 *Pay via UPI*\nUPI ID: ${upiId}\nPay Link: ${upiDeepLink}\n`;
                    if (qrImageUrl) paymentMessage += `QR Code: ${qrImageUrl}\n`;
                    paymentMessage += `⚠️ After payment, reply "I have paid" with screenshot\n`;
                }
            }
            if (hasCod) {
                paymentMessage += `\n💵 *Cash on Delivery*\n${codNotes || 'Pay when you receive your order'}\nReply "COD" to confirm cash on delivery\n`;
            }
            paymentMessage += `\n📄 Invoice: ${finalInvoiceUrl}`;

            const systemClient = WhatsAppClient.getSystemClient();
            await systemClient.sendTextMessage(from, paymentMessage);
            return;
        } else {
            const systemClient = WhatsAppClient.getSystemClient();
            await systemClient.sendTextMessage(from, 'Please provide all details in the requested format (Name, Phone, Email, Address).');
            return;
        }
    }

    if (detectPurchaseIntent(messageText) && customer.conversationState !== 'collecting_order_details') {
        await db.update(customers).set({ conversationState: 'collecting_order_details', conversationContext: null, updatedAt: new Date().toISOString() }).where(eq(customers.id, customer.id));
        const systemClient = WhatsAppClient.getSystemClient();
        await systemClient.sendOrderDetailsTemplate(from);
        return;
    }

    const sellerPaymentList = await db.select().from(sellerPaymentMethods).where(eq(sellerPaymentMethods.sellerId, userId)).limit(1);
    const paymentSettings = sellerPaymentList[0] || null;
    const response = await generateChatbotResponse(messageText, settings, paymentSettings);
    const client = await WhatsAppClient.getClient(userId);
    if (client) {
        if (settings.typingDelay && settings.typingDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, settings.typingDelay));
        }
        await client.sendTextMessage(from, response);
        await saveOutgoingMessage(userId, from, response);
    }
}

// --- STATUS HANDLER LOGIC ---

function extractEventId(payload: any): string {
    const firstStatus = payload?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];
    return firstStatus?.id || `event-${Date.now()}-${Math.random()}`;
}

function extractMessageId(payload: any): string | undefined {
    const firstStatus = payload?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];
    return firstStatus?.id;
}

function extractStatuses(payload: any): Array<{ messageId: string; status: string; timestamp: string; error: any; }> {
    const statuses: any[] = [];
    const entries = payload?.entry || [];
    for (const entry of entries) {
        const changes = entry?.changes || [];
        for (const change of changes) {
            const statusUpdates = change?.value?.statuses || [];
            for (const st of statusUpdates) {
                statuses.push({
                    messageId: st.id, status: st.status, timestamp: st.timestamp, error: st.errors?.[0] || null,
                });
            }
        }
    }
    return statuses;
}

async function processStatusUpdate(messageId: string, status: string, timestamp: string, error: any) {
    const messages = await db.select().from(messageQueue).where(eq(messageQueue.whatsappMessageId, messageId)).limit(1);
    if (messages.length === 0) {
        console.warn(`⚠️ Message not found for WhatsApp ID: ${messageId}`);
        return;
    }
    const message = messages[0];
    const timestampDate = new Date(parseInt(timestamp) * 1000).toISOString();
    const updateData: any = { deliveryStatus: status, updatedAt: new Date().toISOString() };

    switch (status) {
        case 'sent': updateData.sentAt = timestampDate; break;
        case 'delivered':
            updateData.deliveredAt = timestampDate;
            if (message.campaignId) {
                await db.run(sql`UPDATE campaigns SET delivered_count = delivered_count + 1, updated_at = ${new Date().toISOString()} WHERE id = ${message.campaignId}`);
            }
            break;
        case 'read':
            updateData.readAt = timestampDate;
            if (message.campaignId) {
                await db.run(sql`UPDATE campaigns SET read_count = read_count + 1, updated_at = ${new Date().toISOString()} WHERE id = ${message.campaignId}`);
            }
            break;
        case 'failed':
            updateData.status = 'failed';
            updateData.failedAt = timestampDate;
            if (error) {
                updateData.errorCode = error.code || 'UNKNOWN';
                updateData.errorMessage = error.title || error.message || 'Failed';
            }
            if (message.campaignId) {
                await db.run(sql`UPDATE campaigns SET failed_count = failed_count + 1, updated_at = ${new Date().toISOString()} WHERE id = ${message.campaignId}`);
            }
            break;
    }
    await db.update(messageQueue).set(updateData).where(eq(messageQueue.id, message.id));
}

async function handleStatusPayload(payload: any) {
    const eventId = extractEventId(payload);
    const messageId = extractMessageId(payload);

    if (await isDuplicateWebhook(eventId, messageId)) {
        console.log('✅ Duplicate webhook event ignored:', eventId);
        return;
    }
    await markWebhookProcessed(eventId, messageId, 'whatsapp');

    const existingLog = await db.select().from(webhookLogs).where(eq(webhookLogs.eventId, eventId)).limit(1);
    if (existingLog.length === 0) {
        await db.insert(webhookLogs).values({
            id: crypto.randomUUID(), source: 'whatsapp', eventId: eventId, rawPayload: payload, processed: false, createdAt: new Date().toISOString(),
        });
    }

    const statuses = extractStatuses(payload);
    for (const statusUpdate of statuses) {
        try {
            await processStatusUpdate(statusUpdate.messageId, statusUpdate.status, statusUpdate.timestamp, statusUpdate.error);
        } catch (err) {
            console.error('Error processing status update:', err);
        }
    }

    if (existingLog.length > 0) {
        await db.update(webhookLogs).set({ processed: true, processedAt: new Date().toISOString() }).where(eq(webhookLogs.eventId, eventId));
    }
}

// --- MAIN HANDLERS ---

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const envToken = process.env.WHATSAPP_VERIFY_TOKEN;
    const hardcodedToken = 'wavegroww_whatsapp_verify_2025';

    // Allow either the environment variable (if set) OR the hardcoded token
    const isValidToken = (token === envToken) || (token === hardcodedToken);

    if (mode === 'subscribe' && isValidToken) {
        console.log('✅ Webhook verified');
        return new NextResponse(challenge, { status: 200 });
    }

    console.error('❌ Webhook verification failed');
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export const POST = withWebhookRateLimit()(async (request: NextRequest) => {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-hub-signature-256');

        if (!verifyWebhookSignature(rawBody, signature)) {
            console.error('❌ Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);

        // Log incoming for debug
        // console.log('📨 Incoming webhook:', JSON.stringify(payload, null, 2));

        const entry = payload.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (value?.messages) {
            await handleMessagePayload(value);
        } else if (value?.statuses) {
            await handleStatusPayload(payload);
        } else {
            console.log('⚠️ Unknown webhook event type', value);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
});
