import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// POST - Buyer submits payment proof for UPI
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            orderId,
            transactionId,
            screenshotUrl, // Optional - URL to uploaded screenshot
            notes,
        } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
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
            notesInternal: `UPI Payment Proof: ${transactionId || 'N/A'} | Screenshot: ${screenshotUrl || 'Not uploaded'} | Notes: ${notes || 'None'}`,
            updatedAt: new Date().toISOString(),
        }).where(eq(orders.id, orderId));

        // Update payment record
        await db.update(payments).set({
            status: 'PENDING_VERIFICATION',
            upiReference: transactionId || null,
            updatedAt: new Date().toISOString(),
        }).where(eq(payments.orderId, orderId));

        return NextResponse.json({
            success: true,
            message: 'Payment proof submitted. Waiting for seller confirmation.',
            order_id: orderId,
            status: 'pending_verification',
        });

    } catch (error) {
        console.error('Error submitting payment proof:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
