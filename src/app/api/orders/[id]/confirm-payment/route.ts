import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { sendOrderConfirmationEmail } from '@/lib/email';

// POST /api/orders/[id]/confirm-payment
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Next.js 15+ Params are Promises
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

        if (isNaN(orderId)) {
            return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 });
        }

        // 1. Verify Ownership & Existence
        const order = await db.query.orders.findFirst({
            where: and(
                eq(orders.id, orderId),
                eq(orders.userId, session.user.id)
            )
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // 2. Update Status
        await db.update(orders)
            .set({
                paymentStatus: 'paid',
                status: 'confirmed', // Auto-confirm on payment
                updatedAt: new Date().toISOString()
            })
            .where(eq(orders.id, orderId));

        // 3. Trigger Post-Action (Email)
        // We can re-trigger confirmation email strictly if it wasn't sent before, 
        // but typically "Order Confirmation" goes out pending payment too. 
        // Let's send a "Payment Received" notification if possible, or just rely on status update.

        return NextResponse.json({ success: true, message: 'Payment confirmed successfully' });

    } catch (error) {
        console.error('Confirm Payment Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
