import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderTimeline } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const orderId = parseInt(id);
        const body = await req.json();
        const { action } = body; // 'confirmed', 'shipped', 'delivered', 'cancelled'

        if (isNaN(orderId)) {
            return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
        }

        // Verify order exists and ownership
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update Order Status
        await db.update(orders)
            .set({
                status: action,
                updatedAt: new Date().toISOString()
            })
            .where(eq(orders.id, orderId));

        // Add Timeline Entry
        await db.insert(orderTimeline).values({
            orderId: orderId,
            status: action,
            note: `Order marked as ${action} by seller`,
            createdBy: session.user.id,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
