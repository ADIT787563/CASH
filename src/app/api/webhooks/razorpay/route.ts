
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import { orders, payments, subscriptions, invoices, paymentRecords, user, webhookLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendOrderConfirmationEmail, sendNewOrderNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
            console.error('RAZORPAY_WEBHOOK_SECRET is not set');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Verify signature
        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        if (generatedSignature !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const payload = JSON.parse(body);
        const event = payload.event;
        // Use a deterministic event ID to prevent duplicates
        const razorpayEventId = payload.payload?.payment?.entity?.id
            ? `${payload.payload.payment.entity.id}_${event}`
            : crypto.randomUUID();

        // Log webhook (Idempotency check)
        try {
            await db.insert(webhookLogs).values({
                id: crypto.randomUUID(),
                source: 'razorpay',
                eventId: razorpayEventId,
                rawPayload: payload,
                processed: false,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.log("Webhook event logged/duplicate:", event);
        }

        if (event === 'payment.captured') {
            const paymentEntity = payload.payload.payment.entity;
            const orderIdFromNotes = paymentEntity.notes?.wavegroww_order_id;
            const orderType = paymentEntity.notes?.type; // 'store_order' or undefined (subscription)
            const razorpayPaymentId = paymentEntity.id;
            const razorpayOrderId = paymentEntity.order_id;

            if (orderIdFromNotes) {
                // Find the order
                const orderRes = await db.select().from(orders).where(eq(orders.id, parseInt(orderIdFromNotes))).limit(1);
                if (orderRes.length > 0) {
                    const order = orderRes[0];

                    // Idempotency: If already paid, stop
                    if (order.paymentStatus === 'paid') {
                        return NextResponse.json({ status: 'already_processed' });
                    }

                    if (orderType === 'store_order') {
                        // --- Store Order Logic ---
                        await db.transaction(async (tx) => {
                            // 1. Update Order
                            await tx.update(orders)
                                .set({
                                    status: 'confirmed', // Or 'confirmed' depending on flow
                                    paymentStatus: 'paid',
                                    paymentMethod: 'razorpay',
                                    updatedAt: new Date().toISOString()
                                })
                                .where(eq(orders.id, order.id));

                            // 2. Update Payment Record
                            await tx.update(payments)
                                .set({
                                    status: 'captured',
                                    razorpayPaymentId: razorpayPaymentId,
                                    rawPayload: paymentEntity,
                                    updatedAt: new Date().toISOString()
                                })
                                .where(eq(payments.gatewayOrderId, razorpayOrderId));
                        });

                        // 3. Send Emails (Non-blocking)
                        // Get Seller Email
                        const sellerRes = await db.select().from(user).where(eq(user.id, order.userId)).limit(1);
                        if (sellerRes.length > 0) {
                            const seller = sellerRes[0];
                            // Notify Seller
                            await sendNewOrderNotification(seller.email, {
                                id: order.id.toString(),
                                amount: paymentEntity.amount / 100, // Convert to main unit
                                customerName: order.customerName,
                            });
                        }

                        // Notify Customer (if email exists)
                        if (order.customerEmail) {
                            await sendOrderConfirmationEmail(order.customerEmail, order.customerName, {
                                id: order.id.toString(),
                                amount: paymentEntity.amount / 100,
                                date: new Date().toLocaleDateString()
                            });
                        }

                    } else {
                        // --- Subscription Logic (Existing) ---
                        const { planId, billingCycle } = paymentEntity.notes;

                        await db.transaction(async (tx) => {
                            // 1. Update Order
                            await tx.update(orders)
                                .set({
                                    status: 'completed',
                                    paymentStatus: 'paid',
                                    updatedAt: new Date().toISOString()
                                })
                                .where(eq(orders.id, order.id));

                            // 2. Update Payments table
                            await tx.update(payments)
                                .set({
                                    status: 'captured',
                                    razorpayPaymentId: razorpayPaymentId,
                                    rawPayload: paymentEntity,
                                    updatedAt: new Date().toISOString()
                                })
                                .where(eq(payments.gatewayOrderId, razorpayOrderId));

                            // Calculate Dates
                            const startDate = new Date();
                            const endDate = new Date();
                            if (billingCycle === 'yearly') {
                                endDate.setFullYear(endDate.getFullYear() + 1);
                            } else {
                                endDate.setMonth(endDate.getMonth() + 1);
                            }

                            // 3. Create Subscription
                            const [sub] = await tx.insert(subscriptions).values({
                                userId: order.userId,
                                planId: planId || 'pro',
                                status: 'active',
                                provider: 'razorpay',
                                providerSubscriptionId: razorpayOrderId,
                                startDate: startDate.toISOString(),
                                currentPeriodStart: startDate.toISOString(),
                                currentPeriodEnd: endDate.toISOString(),
                            }).returning();

                            // 4. Update User Plan
                            await tx.update(user)
                                .set({
                                    plan: planId || 'pro',
                                    subscriptionStatus: 'active',
                                    updatedAt: new Date()
                                })
                                .where(eq(user.id, order.userId));

                            // 5. Create Invoice
                            const [inv] = await tx.insert(invoices).values({
                                userId: order.userId,
                                orderId: order.id,
                                subscriptionId: sub.id,
                                amount: paymentEntity.amount,
                                currency: paymentEntity.currency,
                                status: 'paid',
                                paidAt: new Date(),
                            }).returning();

                            // 6. Create Payment Record (for Invoicing)
                            await tx.insert(paymentRecords).values({
                                userId: order.userId,
                                invoiceId: inv.id,
                                amount: paymentEntity.amount,
                                currency: paymentEntity.currency,
                                status: 'success',
                                method: 'razorpay',
                                providerPaymentId: razorpayPaymentId,
                                metadata: paymentEntity
                            });
                        });
                    }

                    console.log(`Order ${order.id} processed via Webhook`);
                }
            } else {
                console.log("Payment captured without wavegroww_order_id, possibly legacy or direct.");
                // Try to match by razorpayOrderId in payments table just in case
                await db.update(payments)
                    .set({
                        status: 'captured',
                        razorpayPaymentId: razorpayPaymentId,
                        rawPayload: paymentEntity,
                        updatedAt: new Date().toISOString()
                    })
                    .where(eq(payments.gatewayOrderId, razorpayOrderId));
            }
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
