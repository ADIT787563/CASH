import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { payments, webhookLogs, webhookEvents, user, orders } from '@/db/schema';
import { sendPaymentReceiptEmail } from '@/lib/email';
import { generateInvoice } from '@/lib/invoice';
import { eq } from "drizzle-orm";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!WEBHOOK_SECRET || !signature) {
            return NextResponse.json({ error: "Configuration or signature missing" }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac("sha256", WEBHOOK_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);
        const eventId = event.payload?.payment?.entity?.id || event.payload?.order?.entity?.id || `evt_${Date.now()}`;

        // Idempotency check
        const existingEvent = await db.query.webhookEvents.findFirst({
            where: eq(webhookEvents.eventId, eventId)
        });

        if (existingEvent) {
            return NextResponse.json({ message: "Event already processed" });
        }

        // Process Event
        // Process Event
        if (event.event === "payment.captured") {
            const paymentData = event.payload.payment.entity;
            const razorpayOrderId = paymentData.order_id;
            const notes = paymentData.notes || {};

            // Update Payments Table (Common for both)
            await db.update(payments)
                .set({
                    status: "captured",
                    razorpayPaymentId: paymentData.id,
                    rawPayload: JSON.stringify(paymentData),
                    updatedAt: new Date().toISOString()
                })
                .where(eq(payments.razorpayOrderId, razorpayOrderId)); // Use new column name

            // Context: Order vs Subscription
            if (notes.wavegroww_order_id) {
                // CASE 1: E-commerce Order Payment
                const orderId = parseInt(notes.wavegroww_order_id);
                // Update Order Status
                await db.update(orders)
                    .set({
                        status: 'paid',
                        paymentStatus: 'paid',
                        paymentMethod: 'razorpay',
                        updatedAt: new Date().toISOString()
                    })
                    .where(eq(orders.id, orderId));

                // Trigger Invoice Generation Job
                await generateInvoice(orderId);
                console.log(`✅ Order #${orderId} marked as PAID.`);

            } else {
                // CASE 2: Subscription Payment (Legacy/Platform)
                // Fetch payment record to identify user (Seller)
                const paymentRecord = await db.query.payments.findFirst({
                    where: eq(payments.razorpayOrderId, razorpayOrderId),
                });

                if (paymentRecord && paymentRecord.sellerId) {
                    const planId = notes.planId || 'pro';
                    await db.update(user)
                        .set({
                            plan: planId,
                            subscriptionStatus: 'active',
                            updatedAt: new Date()
                        })
                        .where(eq(user.id, paymentRecord.sellerId));

                    console.log(`✅ Activated plan ${planId} for user ${paymentRecord.sellerId}`);

                    // Send Receipt Email (Only for subscriptions for now)
                    try {
                        const userRec = await db.select().from(user).where(eq(user.id, paymentRecord.sellerId)).limit(1);
                        if (userRec.length > 0) {
                            await sendPaymentReceiptEmail(userRec[0].email, {
                                amount: (paymentData.amount / 100),
                                planName: planId,
                                date: new Date().toLocaleDateString(),
                                invoiceId: paymentData.id
                            });
                        }
                    } catch (e) {
                        console.error("Failed to send receipt email", e);
                    }
                }
            }

        } else if (event.event === "payment.failed") {
            const paymentData = event.payload.payment.entity;
            const razorpayOrderId = paymentData.order_id;

            await db.update(payments)
                .set({
                    status: "failed",
                    razorpayPaymentId: paymentData.id,
                    rawPayload: JSON.stringify(paymentData),
                    updatedAt: new Date().toISOString()
                })
                .where(eq(payments.razorpayOrderId, razorpayOrderId));

            // Optional: Mark order as failed?
            // Usually we keep it pending until success or manual cancellation.
        }

        // Log event
        await db.insert(webhookEvents).values({
            eventId: eventId,
            source: "razorpay",
            messageId: event.payload?.payment?.entity?.id,
            processed: true,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ status: "ok" });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
