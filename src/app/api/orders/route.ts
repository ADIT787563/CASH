import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET /api/orders - List orders for seller
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch Orders
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, session.user.id),
      orderBy: [desc(orders.createdAt)],
      with: {
        // Assuming relations are set up. If not, we might not get items directly here easily 
        // without defined relations in schema.ts (which we saw earlier but might be incomplete)
        // Let's rely on manual aggregation or simple fetch for P0 speed if relation fails.
      }
    });

    // If relations are missing in `db.query`, we can do a second query for items or just count them.
    // For P0 display, let's just fetch items count separately or use a join if possible.
    // Drizzle `with` requires defined relations.

    // MVP: Fetch orders, then mapped for display
    // We really want items count.

    const enrichedOrders = await Promise.all(userOrders.map(async (order) => {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      return {
        ...order,
        itemsCount: items.length
      };
    }));

    return NextResponse.json(enrichedOrders);

  } catch (error) {
    console.error('Fetch Orders Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}