import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, payments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// POST - Seller confirms payment (for UPI or COD)
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

        const orderId = parseInt(id);
        const body = await request.json();
        const { action, notes } = body; // action: 'confirm' | 'reject'

        if (!action || !['confirm', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action. Use confirm or reject.' }, { status: 400 });
        }

        // Verify order exists and belongs to this seller
        const [order] = await db
            .select()
            .from(orders)
            .where(and(
                eq(orders.id, orderId),
                eq(orders.userId, session.user.id)
            ))
            .limit(1);

        if (!order) {
            return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
        }

        if (order.paymentStatus === 'paid') {
            return NextResponse.json({ error: 'Order is already confirmed as paid' }, { status: 400 });
        }

        const now = new Date().toISOString();

        if (action === 'confirm') {
            // Confirm payment
            await db.update(orders).set({
                paymentStatus: 'paid',
                status: 'confirmed',
                notesInternal: `${order.notesInternal || ''} | CONFIRMED by seller at ${now}${notes ? ': ' + notes : ''}`,
                updatedAt: now,
            }).where(eq(orders.id, orderId));

            await db.update(payments).set({
                status: 'SUCCESS',
                updatedAt: now,
            }).where(eq(payments.orderId, orderId));

            return NextResponse.json({
                success: true,
                message: 'Payment confirmed successfully',
                order_id: orderId,
                payment_status: 'paid',
                order_status: 'confirmed',
            });
        } else {
            // Reject payment
            await db.update(orders).set({
                paymentStatus: 'unpaid',
                notesInternal: `${order.notesInternal || ''} | REJECTED by seller at ${now}${notes ? ': ' + notes : ''}`,
                updatedAt: now,
            }).where(eq(orders.id, orderId));

            await db.update(payments).set({
                status: 'FAILED',
                updatedAt: now,
            }).where(eq(payments.orderId, orderId));

            return NextResponse.json({
                success: true,
                message: 'Payment rejected',
                order_id: orderId,
                payment_status: 'unpaid',
            });
        }

    } catch (error) {
        console.error('Error confirming payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
