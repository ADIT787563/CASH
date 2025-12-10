import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, payments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// POST - Mark COD order as delivered and payment collected
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
        const { collected_by, notes } = body; // collected_by: 'seller' | 'delivery_person'

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

        if (order.paymentMethod !== 'cod') {
            return NextResponse.json({ error: 'This order is not a COD order' }, { status: 400 });
        }

        if (order.paymentStatus === 'paid') {
            return NextResponse.json({ error: 'COD already collected' }, { status: 400 });
        }

        const now = new Date().toISOString();

        // Mark COD as collected
        await db.update(orders).set({
            paymentStatus: 'paid',
            status: 'delivered',
            notesInternal: `${order.notesInternal || ''} | COD collected by ${collected_by || 'seller'} at ${now}${notes ? ': ' + notes : ''}`,
            updatedAt: now,
        }).where(eq(orders.id, orderId));

        await db.update(payments).set({
            status: 'SUCCESS',
            updatedAt: now,
        }).where(eq(payments.orderId, orderId));

        return NextResponse.json({
            success: true,
            message: 'COD payment collected successfully',
            order_id: orderId,
            payment_status: 'paid',
            order_status: 'delivered',
        });

    } catch (error) {
        console.error('Error collecting COD payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
