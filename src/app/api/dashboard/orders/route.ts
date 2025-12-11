
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { desc, eq, ne, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const recentOrders = await db.query.orders.findMany({
            where: (orders, { and, eq, ne }) => and(
                eq(orders.userId, userId),
                // Exclude self/subscription orders if any
                ne(orders.customerEmail, session.user.email)
            ),
            orderBy: [desc(orders.createdAt)],
            limit: 10,
        });

        const mappedOrders = recentOrders.map(order => ({
            id: order.id,
            reference: order.reference,
            customerName: order.customerName,
            shippingAddress: order.shippingAddress || 'N/A',
            totalAmount: order.totalAmount, // In cents, frontend divides by 100
            status: order.status,
            currency: order.currency === 'INR' ? '₹' : '$', // Simple mapping
            date: order.createdAt
        }));

        return NextResponse.json(mappedOrders);

    } catch (error) {
        console.error('Error fetching dashboard orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
