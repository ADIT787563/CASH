
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, trafficSources } from '@/db/schema';
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

        // 1. Fetch Monthly Earnings (Last 6-12 months)
        // SQLite specific date formatting
        const earningsDataRaw = await db.select({
            monthStr: sql<string>`strftime('%Y-%m', ${orders.createdAt})`,
            earnings: sql<number>`sum(${orders.totalAmount})`,
            sales: sql<number>`count(*)`
        })
            .from(orders)
            .where(
                and(
                    eq(orders.userId, userId),
                    or(eq(orders.status, 'paid'), eq(orders.status, 'delivered'))
                )
            )
            .groupBy(sql`strftime('%Y-%m', ${orders.createdAt})`)
            .orderBy(sql`strftime('%Y-%m', ${orders.createdAt})`)
            .limit(12);

        // Map to Chart format { name: "Jan", earnings: 100, sales: 5 }
        const earningsData = earningsDataRaw.map(item => {
            const date = new Date(item.monthStr + "-01");
            return {
                name: date.toLocaleString('default', { month: 'short' }),
                earnings: (item.earnings || 0) / 100, // Convert cents
                sales: item.sales || 0
            };
        });

        // Fill in if empty (mock data for demo if no real data exists yet)
        const finalEarningsData = earningsData.length > 0 ? earningsData : [
            { name: "Jan", earnings: 0, sales: 0 },
            { name: "Feb", earnings: 0, sales: 0 },
            { name: "Mar", earnings: 0, sales: 0 },
        ];


        // 2. Fetch Traffic Data
        const trafficStats = await db.select({
            name: trafficSources.source,
            value: sql<number>`sum(${trafficSources.visits})`
        })
            .from(trafficSources)
            .where(eq(trafficSources.userId, userId))
            .groupBy(trafficSources.source)
            .limit(5);

        const colors = ["#e91e63", "#673ab7", "#ffc107", "#2196f3", "#00bcd4"];

        let trafficData = trafficStats.map((item, index) => ({
            name: item.name,
            value: item.value || 0,
            color: colors[index % colors.length]
        }));

        if (trafficData.length === 0) {
            trafficData = [
                { name: "Direct", value: 100, color: "#e91e63" },
            ];
        }

        // Calculate totals for quick headers
        const totalEarnings = finalEarningsData.reduce((acc, curr) => acc + curr.earnings, 0);
        const totalSales = finalEarningsData.reduce((acc, curr) => acc + curr.sales, 0);

        return NextResponse.json({
            earningsData: finalEarningsData,
            trafficData,
            totalEarnings,
            totalSales
        });

    } catch (error) {
        console.error('Error fetching dashboard charts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
