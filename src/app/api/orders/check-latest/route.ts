import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const phone = searchParams.get('customer_phone');

        if (!phone) {
            return NextResponse.json({ error: 'Missing customer_phone' }, { status: 400 });
        }

        // Find latest order by phone
        const latestOrder = await db
            .select()
            .from(orders)
            .where(eq(orders.customerPhone, phone))
            .orderBy(desc(orders.createdAt))
            .limit(1);

        if (!latestOrder.length) {
            return NextResponse.json({ error: 'No orders found' }, { status: 404 });
        }

        return NextResponse.json({
            order_id: latestOrder[0].id,
            payment_status: latestOrder[0].paymentStatus,
            status: latestOrder[0].status,
        });

    } catch (error) {
        console.error('Error checking latest order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
