import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatbotSettings, messages, leads, customers, orders, orderItems, sellerPaymentMethods, payments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import { WhatsAppClient } from '@/lib/whatsapp';
import { parseOrderDetails, OrderDetails } from '@/lib/openai';

/**
 * WhatsApp Incoming Messages Webhook
 * URL: https://yourdomain.com/api/webhooks/whatsapp/messages
 * Handles incoming WhatsApp messages and auto-replies with chatbot.
 */

// Verify webhook signature from Meta
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
    if (!signature) return false;

    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (!appSecret) {
        console.error('WHATSAPP_APP_SECRET not configured');
        return false;
    }

    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', appSecret)
        .update(payload)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

// GET: Webhook verification (required by Meta)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token';

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('✅ Webhook verified');
        return new NextResponse(challenge, { status: 200 });
    }

    console.error('❌ Webhook verification failed');
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// Helper: Detect purchase intent based on keywords
function detectPurchaseIntent(message: string): boolean {
    const intentKeywords = [
        'i want to buy',
        'order now',
        'i want this',
        'book this',
        'place order',
        'i want to purchase',
        'buy',
        'order',
        'purchase'
    ];
    const lower = message.toLowerCase();
    return intentKeywords.some(k => lower.includes(k));
}

// POST: Handle incoming messages
export async function POST(request: NextRequest) {
    try {
        // 1. Get raw body for signature verification
        const rawBody = await request.text();
        const signature = request.headers.get('x-hub-signature-256');

        // 2. Verify signature (CRITICAL for security)
        if (!verifyWebhookSignature(rawBody, signature)) {
            console.error('❌ Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 3. Parse payload
        const payload = JSON.parse(rawBody);
        console.log('📨 Incoming webhook:', JSON.stringify(payload, null, 2));

        // 4. Extract message data
        const entry = payload.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messageData = value?.messages?.[0];

        if (!messageData) {
            console.log('⚠️ No message data in webhook');
            return NextResponse.json({ ok: true });
        }

        const from = messageData.from; // Sender's phone number
        const messageId = messageData.id;
        const messageType = messageData.type;
        const timestamp = messageData.timestamp;

        let messageText = '';
        if (messageType === 'text') {
            messageText = messageData.text?.body || '';
        } else {
            messageText = `[${messageType} message]`;
        }

        // Get business phone number ID from webhook
        const phoneNumberId = value?.metadata?.phone_number_id;
        if (!phoneNumberId) {
            console.error('❌ No phone_number_id in webhook');
            return NextResponse.json({ ok: true });
        }

        // CHECK FOR SYSTEM ONBOARDING FLOW
        if (process.env.WAVEGROWW_PHONE_ID && phoneNumberId === process.env.WAVEGROWW_PHONE_ID) {
            console.log('🤖 Handling System Onboarding Message from:', from);
            await handleOnboardingMessage(from, messageText);
            return NextResponse.json({ ok: true });
        }

        // 5. Find WhatsApp settings for this business (simplified: first record)
        const whatsappSettings = await db
            .select()
            .from(chatbotSettings)
            .limit(1);

        if (whatsappSettings.length === 0) {
            console.log('⚠️ No WhatsApp settings found');
            return NextResponse.json({ ok: true });
        }

        const userId = whatsappSettings[0].userId;

        // 6. Check if chatbot is enabled
        const botSettings = await db
            .select()
            .from(chatbotSettings)
            .where(eq(chatbotSettings.userId, userId))
            .limit(1);

        if (botSettings.length === 0 || !botSettings[0].enabled || !botSettings[0].autoReply) {
            console.log('⚠️ Chatbot disabled or auto-reply off');
            await saveIncomingMessage(userId, from, messageText, messageId, timestamp);
            return NextResponse.json({ ok: true });
        }

        const settings = botSettings[0];

        // 7. Save incoming message
        await saveIncomingMessage(userId, from, messageText, messageId, timestamp);

        // 8. Create or update customer record (now also tracks conversation state)
        await createOrUpdateCustomer(userId, from);

        // Load the fresh customer record to inspect conversation state
        const customerRows = await db
            .select()
            .from(customers)
            .where(eq(customers.phone, from))
            .limit(1);
        const customer = customerRows[0];

        // 9. Order flow handling
        if (customer.conversationState === 'collecting_order_details') {
            // Parse details using OpenAI helper
            const parsed: OrderDetails | null = await parseOrderDetails(messageText);
            if (parsed && parsed.name && parsed.phone && parsed.email && parsed.address) {
                // Fetch seller's payment preferences
                const sellerPayment = await db
                    .select()
                    .from(sellerPaymentMethods)
                    .where(eq(sellerPaymentMethods.sellerId, userId))
                    .limit(1);

                const paymentPreference = sellerPayment[0]?.paymentPreference || 'both';
                const razorpayLink = sellerPayment[0]?.razorpayLink;
                const upiId = sellerPayment[0]?.upiId;
                const qrImageUrl = sellerPayment[0]?.qrImageUrl;
                const codNotes = sellerPayment[0]?.codNotes;

                // Create order record
                const orderNumber = `INV-${Date.now()}`;
                const subtotal = 1000; // placeholder – in real code calculate based on product selection
                const tax = Math.round(subtotal * 0.18);
                const total = subtotal + tax;

                // Determine initial payment status based on preference
                const initialPaymentStatus = paymentPreference === 'cod' ? 'pending_cod' : 'unpaid';

                const orderInsert = await db.insert(orders).values({
                    userId,
                    leadId: null,
                    customerName: parsed.name,
                    customerPhone: parsed.phone,
                    customerEmail: parsed.email,
                    shippingAddress: parsed.address,
                    subtotal,
                    taxAmount: tax,
                    totalAmount: total,
                    status: 'pending',
                    paymentStatus: initialPaymentStatus,
                    paymentMethod: null,
                    invoiceNumber: orderNumber,
                    invoiceUrl: '', // Will update after ID generation
                    orderDate: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }).returning();

                const orderId = orderInsert[0].id;
                const finalInvoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.wavegroww.online'}/invoices/${orderId}`;

                // Update with correct URL
                await db.update(orders)
                    .set({ invoiceUrl: finalInvoiceUrl })
                    .where(eq(orders.id, orderId));

                // Insert a single line‑item (placeholder)
                await db.insert(orderItems).values({
                    orderId,
                    productId: 1,
                    productName: 'Sample Product',
                    quantity: 1,
                    unitPrice: subtotal,
                    totalPrice: subtotal,
                    createdAt: new Date().toISOString(),
                });

                // Create payment record
                await db.insert(payments).values({
                    orderId,
                    sellerId: userId,
                    method: 'PENDING',
                    amount: total,
                    currency: 'INR',
                    status: 'PENDING',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });

                // Reset conversation state
                await db.update(customers)
                    .set({
                        conversationState: 'browsing',
                        conversationContext: null,
                        updatedAt: new Date().toISOString(),
                    })
                    .where(eq(customers.id, customer.id));

                // Build payment options message based on seller preferences
                let paymentMessage = `✅ *Order Created Successfully!*\n\n`;
                paymentMessage += `Order ID: ${orderId}\n`;
                paymentMessage += `Total: ₹${(total / 100).toFixed(2)}\n\n`;
                paymentMessage += `*Payment Options:*\n`;

                const hasOnline = paymentPreference === 'online' || paymentPreference === 'both';
                const hasCod = paymentPreference === 'cod' || paymentPreference === 'both';

                if (hasOnline) {
                    if (razorpayLink) {
                        paymentMessage += `\n💳 *Pay Online (Razorpay)*\n`;
                        paymentMessage += `Click to pay securely: ${razorpayLink}\n`;
                        paymentMessage += `✓ Automatic confirmation\n`;
                    }

                    if (upiId) {
                        const upiDeepLink = `upi://pay?pa=${upiId}&pn=Order${orderId}&am=${(total / 100).toFixed(2)}&cu=INR`;
                        paymentMessage += `\n📱 *Pay via UPI*\n`;
                        paymentMessage += `UPI ID: ${upiId}\n`;
                        paymentMessage += `Pay Link: ${upiDeepLink}\n`;
                        if (qrImageUrl) {
                            paymentMessage += `QR Code: ${qrImageUrl}\n`;
                        }
                        paymentMessage += `⚠️ After payment, reply "I have paid" with screenshot\n`;
                    }
                }

                if (hasCod) {
                    paymentMessage += `\n💵 *Cash on Delivery*\n`;
                    paymentMessage += codNotes || 'Pay when you receive your order\n';
                    paymentMessage += `Reply "COD" to confirm cash on delivery\n`;
                }

                paymentMessage += `\n📄 Invoice: ${finalInvoiceUrl}`;

                // Send payment options via WhatsApp
                const systemClient = WhatsAppClient.getSystemClient();
                await systemClient.sendTextMessage(from, paymentMessage);

                console.log('Order created with payment options sent');
                return NextResponse.json({ ok: true });
            } else {
                // Missing fields – ask user to resend full details
                const systemClient = WhatsAppClient.getSystemClient();
                await systemClient.sendTextMessage(
                    from,
                    'Please provide all details in the requested format (Name, Phone, Email, Address).'
                );
                return NextResponse.json({ ok: true });
            }
        }

        if (detectPurchaseIntent(messageText) && customer.conversationState !== 'collecting_order_details') {
            // Switch to order‑detail collection state
            await db.update(customers)
                .set({
                    conversationState: 'collecting_order_details',
                    conversationContext: null,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(customers.id, customer.id));

            const systemClient = WhatsAppClient.getSystemClient();
            await systemClient.sendOrderDetailsTemplate(from);
            return NextResponse.json({ ok: true });
        }

        // 10. Normal chatbot auto‑reply flow
        const response = await generateChatbotResponse(messageText, settings);
        const client = await WhatsAppClient.getClient(userId);
        if (client) {
            if (settings.typingDelay && settings.typingDelay > 0) {
                await new Promise(resolve => setTimeout(resolve, settings.typingDelay));
            }
            await client.sendTextMessage(from, response);
            await saveOutgoingMessage(userId, from, response);
            console.log(`✅ Auto-reply sent to ${from}`);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper: Save incoming message
async function saveIncomingMessage(
    userId: string,
    from: string,
    content: string,
    whatsappMessageId: string,
    timestamp: string
) {
    try {
        const isoTimestamp = new Date(parseInt(timestamp) * 1000).toISOString();
        await db.insert(messages).values({
            userId,
            direction: 'inbound',
            phoneNumber: from,
            fromNumber: from,
            toNumber: 'BUSINESS',
            messageType: 'text',
            content,
            status: 'received',
            whatsappMessageId,
            timestamp: isoTimestamp,
            createdAt: isoTimestamp,
        });
    } catch (error) {
        console.error('Error saving incoming message:', error);
    }
}

// Helper: Save outgoing message
async function saveOutgoingMessage(
    userId: string,
    to: string,
    content: string
) {
    try {
        const now = new Date().toISOString();
        await db.insert(messages).values({
            userId,
            direction: 'outbound',
            phoneNumber: to,
            fromNumber: 'BUSINESS',
            toNumber: to,
            messageType: 'text',
            content,
            status: 'sent',
            timestamp: now,
            createdAt: now,
        });
    } catch (error) {
        console.error('Error saving outgoing message:', error);
    }
}

// Helper: Create or update customer (now also tracks conversation state)
async function createOrUpdateCustomer(userId: string, phoneNumber: string) {
    try {
        const existing = await db
            .select()
            .from(customers)
            .where(and(eq(customers.userId, userId), eq(customers.phone, phoneNumber)))
            .limit(1);

        if (existing.length === 0) {
            await db.insert(customers).values({
                userId,
                phone: phoneNumber,
                name: phoneNumber,
                status: 'active',
                conversationState: 'browsing',
                conversationContext: null,
                lastMessageTime: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            await db.insert(leads).values({
                userId,
                name: phoneNumber,
                phone: phoneNumber,
                source: 'whatsapp',
                status: 'new',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        } else {
            await db
                .update(customers)
                .set({
                    lastMessageTime: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(customers.id, existing[0].id));
        }
    } catch (error) {
        console.error('Error creating/updating customer:', error);
    }
}

// Helper: Generate chatbot response (unchanged)
async function generateChatbotResponse(message: string, settings: any): Promise<string> {
    const lowerMessage = message.toLowerCase();

    if (settings.keywordTriggers && Array.isArray(settings.keywordTriggers)) {
        for (const trigger of settings.keywordTriggers) {
            if (trigger.keyword && lowerMessage.includes(trigger.keyword.toLowerCase())) {
                return trigger.response;
            }
        }
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
        en: "Hello!",
        hi: "नमस्ते!",
        es: "¡Hola!",
        fr: "Bonjour!",
        de: "Hallo!",
    };

    const tone = settings.tone || 'friendly';
    const language = settings.language || 'en';

    const baseResponse = toneResponses[tone] || toneResponses['friendly'];
    const greeting = languageGreetings[language] || languageGreetings['en'];

    return `${greeting} ${baseResponse}`;
}

// Helper: Handle System Onboarding Messages (unchanged)
async function handleOnboardingMessage(from: string, messageText: string) {
    console.log(`📝 Received onboarding response from ${from}:`, messageText);
    try {
        const client = WhatsAppClient.getSystemClient();
        await client.sendTextMessage(from, "Thanks! We've received your details. Our system is processing them.");
    } catch (error) {
        console.error('Error sending onboarding ack:', error);
    }
}
