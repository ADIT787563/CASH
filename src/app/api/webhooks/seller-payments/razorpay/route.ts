import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sellerPaymentMethods, orders, webhookLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { WhatsAppClient } from '@/lib/whatsapp';

// POST - Handle Razorpay webhooks for seller payments
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // Parse the body
        let event;
        try {
            event = JSON.parse(body);
        } catch (parseError) {
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
        }

        const { entity, event: eventType } = event;

        // Extract payment link ID or order ID to find seller
        // Assuming payment link contains seller info in notes or reference_id
        const notes = entity?.notes || {};
        const referenceId = entity?.reference_id;
        // Prioritize wavegroww_order_id from notes, then order_id, then reference_id
        const orderId = notes.wavegroww_order_id || notes.order_id || referenceId;

        if (!orderId) {
            console.error('No order ID found in webhook payload');
            return NextResponse.json({ error: 'No order ID in payload' }, { status: 400 });
        }

        // Find the order to get seller ID
        const orderRecords = await db
            .select()
            .from(orders)
            .where(eq(orders.id, parseInt(orderId)))
            .limit(1);

        if (orderRecords.length === 0) {
            console.error(`Order not found: ${orderId}`);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderRecords[0];
        const sellerId = order.userId;

        // Fetch seller's webhook secret
        const sellerMethods = await db
            .select()
            .from(sellerPaymentMethods)
            .where(eq(sellerPaymentMethods.sellerId, sellerId))
            .limit(1);

        if (sellerMethods.length === 0 || !sellerMethods[0].webhookSecretHash) {
            console.error('No webhook secret found for seller');
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });
        }

        // Verify signature
        const webhookSecret = sellerMethods[0].webhookSecretHash;
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error('Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Check for duplicate (idempotency)
        const eventId = event.event_id || event.id || `${eventType}_${Date.now()}`;
        const existingEvent = await db
            .select()
            .from(webhookLogs)
            .where(eq(webhookLogs.eventId, eventId))
            .limit(1);

        if (existingEvent.length > 0) {
            console.log('Duplicate webhook event, ignoring:', eventId);
            return NextResponse.json({ success: true, message: 'Event already processed' });
        }

        // Log the webhook
        await db.insert(webhookLogs).values({
            id: crypto.randomUUID(),
            source: 'razorpay_seller',
            eventId,
            rawPayload: event,
            processed: false,
            createdAt: new Date().toISOString(),
        });

        // Process the event
        if (eventType === 'payment.link.paid' || eventType === 'payment.captured') {
            // Update order payment status
            await db
                .update(orders)
                .set({
                    paymentStatus: 'paid',
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(orders.id, parseInt(orderId)));

            // Mark webhook as processed
            await db
                .update(webhookLogs)
                .set({
                    processed: true,
                    processedAt: new Date().toISOString(),
                })
                .where(eq(webhookLogs.eventId, eventId));

            console.log(`Order ${orderId} marked as paid`);

            // Send WhatsApp Notification
            try {
                const client = await WhatsAppClient.getClient(sellerId);
                if (client && order.customerPhone) {
                    await client.sendOrderConfirmation(order.customerPhone, {
                        id: order.reference || orderId.toString(),
                        amount: order.totalAmount / 100,
                    });
                }
            } catch (notifError) {
                console.error('Failed to send payment notification:', notifError);
            }
        } else if (eventType === 'payment.failed') {
            // Update order to failed
            await db
                .update(orders)
                .set({
                    paymentStatus: 'unpaid',
                    notesInternal: `Payment failed: ${entity?.error_description || 'Unknown error'}`,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(orders.id, parseInt(orderId)));

            await db
                .update(webhookLogs)
                .set({
                    processed: true,
                    processedAt: new Date().toISOString(),
                })
                .where(eq(webhookLogs.eventId, eventId));

            console.log(`Order ${orderId} payment failed`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
