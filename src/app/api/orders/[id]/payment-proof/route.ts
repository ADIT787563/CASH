import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, payments } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST - Buyer submits payment proof for UPI
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const {
            transactionId,
            screenshotUrl, // Optional - URL to uploaded screenshot
            notes,
        } = body;

        const orderId = parseInt(id);
        if (isNaN(orderId)) {
            return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
        }

        // Verify order exists
        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.paymentStatus === 'paid') {
            return NextResponse.json({ error: 'Order is already paid' }, { status: 400 });
        }

        // Update order with payment proof
        await db.update(orders).set({
            paymentStatus: 'pending_verification',
            paymentProofUrl: screenshotUrl || null,
            utrNumber: transactionId || null,
            updatedAt: new Date().toISOString(),
        }).where(eq(orders.id, orderId));

        // Update payment record (assuming the table name is 'payments')
        // We'll also check if we need to update a generic payments table or just stick to orders
        try {
            await db.update(payments).set({
                status: 'PENDING_VERIFICATION',
                upiReference: transactionId || null,
                updatedAt: new Date().toISOString(),
            }).where(eq(payments.orderId, orderId));
        } catch (e) {
            console.log("Payments table update skipped or failed, continuing with order update only.");
        }

        return NextResponse.json({
            success: true,
            message: 'Waiting for seller to confirm your payment.',
            order_id: orderId,
            status: 'pending_verification',
        });

    } catch (error) {
        console.error('Error submitting payment proof:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
