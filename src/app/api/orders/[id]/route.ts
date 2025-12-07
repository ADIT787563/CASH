import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, payments } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const orderId = parseInt(id);

        if (isNaN(orderId)) {
            return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
        }

        // Fetch Order
        const order = await db
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1);

        if (!order.length) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Fetch Items
        const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, orderId));

        // Fetch Payment Details
        const payment = await db
            .select()
            .from(payments)
            .where(eq(payments.orderId, orderId))
            .limit(1);

        return NextResponse.json({
            ...order[0],
            items,
            payment: payment[0] || null,
        });

    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
