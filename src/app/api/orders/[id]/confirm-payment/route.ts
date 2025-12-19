import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { WhatsAppClient } from '@/lib/whatsapp';
import { OrderLogic } from '@/lib/order-logic';

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

        // 1. Confirm Payment via State Machine
        try {
            await OrderLogic.confirmPayment(orderId, session.user.id, 'manual_upi');
        } catch (error: any) {
            return NextResponse.json({ error: error.message || 'Payment confirmation failed' }, { status: 400 });
        }

        // 3. Trigger Post-Action (Notification)
        try {
            const client = await WhatsAppClient.getClient(session.user.id);
            if (client && order.customerPhone) {
                await client.sendOrderConfirmation(order.customerPhone, {
                    id: order.reference || orderId.toString(),
                    amount: order.totalAmount / 100,
                });
            }
        } catch (notifError) {
            console.error('Failed to send confirmation notification:', notifError);
        }

        return NextResponse.json({ success: true, message: 'Payment confirmed successfully' });

    } catch (error) {
        console.error('Confirm Payment Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
