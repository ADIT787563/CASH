
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, messages, leads, products } from '@/db/schema';
import { eq, sql, and, or } from 'drizzle-orm';
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

        // Parallelize simple count queries
        const [
            messagesCountRes,
            leadsCountRes,
            productsCountRes,
            revenueRes
        ] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(messages).where(eq(messages.userId, userId)),
            db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.userId, userId)),
            db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.userId, userId)),
            db.select({ total: sql<number>`sum(${orders.totalAmount})` })
                .from(orders)
                .where(
                    and(
                        eq(orders.userId, userId),
                        or(eq(orders.status, 'paid'), eq(orders.status, 'delivered'))
                    )
                )
        ]);

        const totalMessages = messagesCountRes[0]?.count || 0;
        const totalLeads = leadsCountRes[0]?.count || 0;
        const totalProducts = productsCountRes[0]?.count || 0;
        const totalRevenueCents = revenueRes[0]?.total || 0;

        const conversionRate = totalMessages > 0 ? ((totalLeads / totalMessages) * 100) : 0;
        const totalRevenue = totalRevenueCents / 100; // Convert cents to main currency

        return NextResponse.json({
            totalMessages,
            totalLeads,
            totalProducts,
            conversionRate,
            totalRevenue,
            // Mock change percentages for now, or implement historical comparison later
            revenueChange: 12.5,
            messagesChange: 5.2,
            leadsChange: 8.1,
            productsChange: 2.3
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
