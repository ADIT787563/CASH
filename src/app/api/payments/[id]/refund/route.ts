import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const refundSchema = z.object({
    amount_paise: z.number().int().positive("Amount must be positive"),
    reason: z.string().optional()
});

// POST /api/payments/[id]/refund
// Button 11b: Refund paid order
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const paymentId = id;
        const body = await request.json();
        const validation = refundSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Validation failed', details: validation.error.format() }, { status: 400 });
        }

        const { amount_paise, reason } = validation.data;

        const [payment] = await db
            .select()
            .from(payments)
            .where(eq(payments.id, paymentId))
            .limit(1);

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // Verify ownership (Seller or Admin)
        // Here we assume sellerId check or admin role check.
        // For simplicity, strict seller check:
        if (payment.sellerId !== session.user.id) {
            // TODO: Check if admin
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (payment.status !== 'SUCCESS') {
            return NextResponse.json({ error: 'Payment not successful, cannot refund' }, { status: 400 });
        }

        // Razorpay Refund
        if (payment.method === 'RAZORPAY' && payment.gatewayPaymentId) {
            try {
                const refund = await razorpay.payments.refund(payment.gatewayPaymentId, {
                    amount: amount_paise, // Optional unique partial amount
                    notes: {
                        reason: reason || 'Requested by seller'
                    }
                });

                // Update DB status (partial or full)
                // Assuming full refund for now or just marking status 'REFUNDED'
                await db.update(payments).set({
                    status: 'REFUNDED',
                    updatedAt: new Date().toISOString()
                }).where(eq(payments.id, paymentId));

                await db.update(orders).set({
                    paymentStatus: 'refunded',
                    updatedAt: new Date().toISOString()
                }).where(eq(orders.id, payment.orderId));

                return NextResponse.json({ success: true, refund_id: refund.id });

            } catch (rzErr: any) {
                console.error('Razorpay Refund Error:', rzErr);
                return NextResponse.json({ error: rzErr.message || 'Refund failed' }, { status: 500 });
            }
        }

        // Manual/COD Refund
        // Just update DB
        await db.update(payments).set({
            status: 'REFUNDED',
            updatedAt: new Date().toISOString()
        }).where(eq(payments.id, paymentId));

        await db.update(orders).set({
            paymentStatus: 'refunded',
            updatedAt: new Date().toISOString()
        }).where(eq(orders.id, payment.orderId));

        return NextResponse.json({ success: true, message: 'Manual refund recorded' });

    } catch (error) {
        console.error('Refund Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
