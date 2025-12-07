import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth'; // Assuming auth helper exists
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { order_id, payment_reference } = body;

        if (!order_id) {
            return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
        }

        // Verify order belongs to seller
        const order = await db
            .select()
            .from(orders)
            .where(eq(orders.id, order_id))
            .limit(1);

        if (!order.length) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order[0].userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update Payments
        await db
            .update(payments)
            .set({
                status: 'SUCCESS',
                upiReference: payment_reference,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(payments.orderId, order_id));

        // Update Order
        await db
            .update(orders)
            .set({
                paymentStatus: 'paid',
                status: 'confirmed', // Auto-confirm on payment
                updatedAt: new Date().toISOString(),
            })
            .where(eq(orders.id, order_id));

        // TODO: Trigger notification (WhatsApp/Email)

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error marking order as paid:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
