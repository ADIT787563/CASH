import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { payments, webhookLogs, webhookEvents, user } from '@/db/schema';
import { sendPaymentReceiptEmail } from '@/lib/email';
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
        if (event.event === "payment.captured") {
            const paymentData = event.payload.payment.entity;
            const orderId = paymentData.order_id;

            await db.update(payments)
                .set({
                    status: "captured",
                    gatewayPaymentId: paymentData.id,
                    // updatedAt: new Date() // paymentRecords table might not have updatedAt
                })
                .where(eq(payments.gatewayOrderId, orderId));


            // Trigger subscription activation
            // Fetch payment record to identify user
            const paymentRecord = await db.query.payments.findFirst({
                where: eq(payments.gatewayOrderId, orderId),
            });

            if (paymentRecord && paymentRecord.sellerId) {
                // Extract Plan Details from Payment Notes (passed during creation)
                const planId = paymentData.notes?.planId || 'pro'; // Default to Pro if missing

                // Update User Subscription
                await db.update(user)
                    .set({
                        plan: planId,
                        subscriptionStatus: 'active',
                        updatedAt: new Date()
                    })
                    .where(eq(user.id, paymentRecord.sellerId));

                console.log(`✅ Activated plan ${planId} for user ${paymentRecord.sellerId}`);
            }

            // Send Receipt Email
            try {
                if (paymentRecord?.sellerId) {
                    const userRec = await db.select().from(user).where(eq(user.id, paymentRecord.sellerId)).limit(1);
                    if (userRec.length > 0) {
                        await sendPaymentReceiptEmail(userRec[0].email, {
                            amount: (paymentData.amount / 100),
                            planName: paymentData.notes?.planId || "Plan Subscription",
                            date: new Date().toLocaleDateString(),
                            invoiceId: paymentData.id
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to send receipt email", e);
            }

        } else if (event.event === "payment.failed") {
            const paymentData = event.payload.payment.entity;
            const orderId = paymentData.order_id;

            await db.update(payments)
                .set({
                    status: "failed",
                    gatewayPaymentId: paymentData.id,
                    // updatedAt: new Date()
                })
                .where(eq(payments.gatewayOrderId, orderId));
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
