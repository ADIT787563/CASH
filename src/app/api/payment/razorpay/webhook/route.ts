import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, orders, paymentSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        const body = JSON.parse(bodyText);
        const { event, payload } = body;

        if (event === 'payment.captured') {
            const paymentEntity = payload.payment.entity;
            const razorpayOrderId = paymentEntity.order_id;
            const razorpayPaymentId = paymentEntity.id;

            // 1. Find Payment Record
            const paymentRecord = await db
                .select()
                .from(payments)
                .where(eq(payments.gatewayOrderId, razorpayOrderId))
                .limit(1);

            if (!paymentRecord.length) {
                return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
            }

            const payment = paymentRecord[0];

            // 2. Fetch Seller Settings for Secret
            const settings = await db
                .select()
                .from(paymentSettings)
                .where(eq(paymentSettings.userId, payment.sellerId))
                .limit(1);

            if (!settings.length || !settings[0].razorpayWebhookSecretEncrypted) {
                console.error('Razorpay secret not found for seller:', payment.sellerId);
                return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
            }

            // TODO: Decrypt secret
            const webhookSecret = settings[0].razorpayWebhookSecretEncrypted;

            // 3. Verify Signature
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(bodyText)
                .digest('hex');

            if (expectedSignature !== signature) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
            }

            // 4. Update Payment Status
            await db
                .update(payments)
                .set({
                    status: 'SUCCESS',
                    gatewayPaymentId: razorpayPaymentId,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(payments.id, payment.id));

            // 5. Update Order Status
            await db
                .update(orders)
                .set({
                    paymentStatus: 'paid',
                    status: 'confirmed',
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(orders.id, payment.orderId));

            return NextResponse.json({ status: 'ok' });
        } else if (event === 'payment.failed') {
            // Handle failure
            const paymentEntity = payload.payment.entity;
            const razorpayOrderId = paymentEntity.order_id;

            await db
                .update(payments)
                .set({
                    status: 'FAILED',
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(payments.gatewayOrderId, razorpayOrderId));

            return NextResponse.json({ status: 'ok' });
        }

        return NextResponse.json({ status: 'ignored' });

    } catch (error) {
        console.error('Error processing Razorpay webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
