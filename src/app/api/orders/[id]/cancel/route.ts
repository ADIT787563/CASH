import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// POST /api/orders/[id]/cancel
// Button 11a: Cancel unpaid order
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { reason } = body;
        const orderId = parseInt(params.id);

        const [order] = await db
            .select()
            .from(orders)
            .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id)))
            .limit(1);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Validation: Can only cancel if not shipped/delivered (or policy dependent)
        // Usually safe to cancel 'pending' or 'confirmed' if unpaid or refund needed.
        // Spec says: "Cancel unpaid order".

        if (order.paymentStatus === 'paid') {
            return NextResponse.json({ error: 'Order is paid. Use refund instead.' }, { status: 400 });
        }

        await db.update(orders).set({
            status: 'cancelled',
            notesInternal: `${order.notesInternal || ''} | Cancelled by seller: ${reason || 'No reason'}`,
            updatedAt: new Date().toISOString()
        }).where(eq(orders.id, orderId));

        return NextResponse.json({ success: true, status: 'cancelled' });

    } catch (error) {
        console.error('Cancel Order Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
