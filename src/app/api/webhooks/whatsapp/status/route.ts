import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messageQueue, campaigns, webhookLogs } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { isDuplicateWebhook, markWebhookProcessed } from '@/lib/webhook-deduplication';
import { withWebhookRateLimit } from '@/middleware/rate-limit-middleware';

/**
 * WhatsApp Status Webhook Handler
 * URL: https://yourdomain.com/api/webhooks/whatsapp/status
 * 
 * Handles: sent, delivered, read, failed events
 * Features: Signature verification, idempotency, atomic updates
 */

// GET: Webhook verification (Meta requires this)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully');
        return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST: Handle status updates
const handleWebhookPost = async (request: NextRequest) => {
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

        // 4. Extract event ID for idempotency
        const eventId = extractEventId(payload);
        const messageId = extractMessageId(payload);

        // 5. Check for duplicate using new deduplication system
        if (await isDuplicateWebhook(eventId, messageId)) {
            console.log('✅ Duplicate webhook event ignored:', eventId);
            return NextResponse.json({ ok: true, note: 'duplicate event' });
        }

        // 6. Mark as processed in new system
        await markWebhookProcessed(eventId, messageId, 'whatsapp');

        // 7. Log webhook event (legacy system)
        const existingLog = await db
            .select()
            .from(webhookLogs)
            .where(eq(webhookLogs.eventId, eventId))
            .limit(1);

        if (existingLog.length === 0) {
            await db.insert(webhookLogs).values({
                id: crypto.randomUUID(),
                source: 'whatsapp',
                eventId: eventId,
                rawPayload: payload,
                processed: false,
                createdAt: new Date().toISOString(),
            });
        }

        // 8. Extract status updates
        const statuses = extractStatuses(payload);

        // 9. Process each status update
        for (const statusUpdate of statuses) {
            const { messageId, status, timestamp, error } = statusUpdate;

            try {
                await processStatusUpdate(messageId, status, timestamp, error);
            } catch (err) {
                console.error('Error processing status update:', err);
                // Continue processing other updates
            }
        }

        // 10. Mark webhook as processed (legacy)
        if (existingLog.length > 0) {
            await db
                .update(webhookLogs)
                .set({
                    processed: true,
                    processedAt: new Date().toISOString(),
                })
                .where(eq(webhookLogs.eventId, eventId));
        }

        console.log('✅ Webhook processed successfully:', eventId);
        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
};

// Apply rate limiting middleware
export const POST = withWebhookRateLimit()(handleWebhookPost);

/**
 * Verify WhatsApp webhook signature using HMAC SHA256
 */
function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    if (!signature) {
        console.error('No signature provided');
        return false;
    }

    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (!appSecret) {
        console.error('WHATSAPP_APP_SECRET not configured');
        return false;
    }

    // Remove 'sha256=' prefix
    const signatureHash = signature.replace('sha256=', '');

    // Calculate expected signature
    const expectedHash = crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex');

    // Timing-safe comparison
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signatureHash, 'hex'),
            Buffer.from(expectedHash, 'hex')
        );
    } catch {
        return false;
    }
}

/**
 * Extract unique event ID for idempotency
 */
function extractEventId(payload: any): string {
    const firstStatus = payload?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];
    return firstStatus?.id || `event-${Date.now()}-${Math.random()}`;
}

/**
 * Extract message ID from webhook payload
 */
function extractMessageId(payload: any): string | undefined {
    const firstStatus = payload?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];
    return firstStatus?.id;
}

/**
 * Extract all status updates from webhook payload
 */
function extractStatuses(payload: any): Array<{
    messageId: string;
    status: string;
    timestamp: string;
    error: any;
}> {
    const statuses: any[] = [];

    const entries = payload?.entry || [];
    for (const entry of entries) {
        const changes = entry?.changes || [];
        for (const change of changes) {
            const statusUpdates = change?.value?.statuses || [];
            for (const st of statusUpdates) {
                statuses.push({
                    messageId: st.id,
                    status: st.status,
                    timestamp: st.timestamp,
                    error: st.errors?.[0] || null,
                });
            }
        }
    }

    return statuses;
}

/**
 * Process a single status update
 */
async function processStatusUpdate(
    messageId: string,
    status: string,
    timestamp: string,
    error: any
) {
    // 1. Find message in queue
    const messages = await db
        .select()
        .from(messageQueue)
        .where(eq(messageQueue.whatsappMessageId, messageId))
        .limit(1);

    if (messages.length === 0) {
        console.warn(`⚠️ Message not found for WhatsApp ID: ${messageId}`);
        return;
    }

    const message = messages[0];
    const timestampDate = new Date(parseInt(timestamp) * 1000).toISOString();

    // 2. Prepare update data
    const updateData: any = {
        deliveryStatus: status,
        updatedAt: new Date().toISOString(),
    };

    // 3. Update based on status type
    switch (status) {
        case 'sent':
            updateData.sentAt = timestampDate;
            break;

        case 'delivered':
            updateData.deliveredAt = timestampDate;
            // Atomic increment for campaign
            if (message.campaignId) {
                await db.run(sql`
          UPDATE campaigns 
          SET delivered_count = delivered_count + 1,
              updated_at = ${new Date().toISOString()}
          WHERE id = ${message.campaignId}
        `);
            }
            break;

        case 'read':
            updateData.readAt = timestampDate;
            // Atomic increment for campaign
            if (message.campaignId) {
                await db.run(sql`
          UPDATE campaigns 
          SET read_count = read_count + 1,
              updated_at = ${new Date().toISOString()}
          WHERE id = ${message.campaignId}
        `);
            }
            break;

        case 'failed':
            updateData.status = 'failed';
            updateData.failedAt = timestampDate;

            if (error) {
                updateData.errorCode = error.code || 'UNKNOWN';
                updateData.errorMessage = error.title || error.message || 'Failed';
            }

            // Atomic increment for campaign
            if (message.campaignId) {
                await db.run(sql`
          UPDATE campaigns 
          SET failed_count = failed_count + 1,
              updated_at = ${new Date().toISOString()}
          WHERE id = ${message.campaignId}
        `);
            }
            break;
    }

    // 4. Update message queue
    await db
        .update(messageQueue)
        .set(updateData)
        .where(eq(messageQueue.id, message.id));

    console.log(`✅ Updated message ${message.id}: ${status}`);
}
