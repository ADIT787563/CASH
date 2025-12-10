import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, payments } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET /api/billing/history
export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch Subscription Orders
        const subscriptionOrders = await db.query.orders.findMany({
            where: and(
                eq(orders.userId, session.user.id),
                eq(orders.source, 'subscription')
            ),
            orderBy: [desc(orders.createdAt)],
            with: {
                // Determine if we have a relation to payments. 
                // If not defined in relations.ts, we might need a separate query or manual join.
                // Assuming "payments" might not be relationally linked in drizzle query builder if not in schema relations
            }
        });

        // If relations aren't set up perfectly for 'with', we can iterate to get payment status
        // or just use the order's paymentStatus and totalAmount.
        // For billing history, we often want the "Payment" record details (invoice ID etc).

        // Let's rely on Order data for now, it has "totalAmount", "status", "paymentStatus", "invoiceUrl".
        // That is sufficient for a history table.

        return NextResponse.json(subscriptionOrders);

    } catch (error) {
        console.error('Fetch Billing History Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
