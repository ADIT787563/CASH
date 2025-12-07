import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Build where conditions
    const conditions = [
      eq(orders.userId, userId),
      eq(orders.status, 'completed')
    ];

    if (fromDate) {
      conditions.push(gte(orders.orderDate, fromDate));
    }

    if (toDate) {
      conditions.push(lte(orders.orderDate, toDate));
    }

    const whereClause = and(...conditions);

    // Query for series data grouped by date
    const seriesData = await db
      .select({
        date: orders.orderDate,
        revenue: sql<number>`CAST(SUM(${orders.totalAmount}) AS INTEGER)`,
        orders: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(orders)
      .where(whereClause)
      .groupBy(orders.orderDate)
      .orderBy(orders.orderDate);

    // Query for totals
    const totalsData = await db
      .select({
        revenue: sql<number>`CAST(SUM(${orders.totalAmount}) AS INTEGER)`,
        orders: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(orders)
      .where(whereClause);

    // Format response
    const response = {
      series: seriesData.map(item => ({
        date: item.date,
        revenue: item.revenue || 0,
        orders: item.orders || 0
      })),
      totals: {
        revenue: totalsData[0]?.revenue || 0,
        orders: totalsData[0]?.orders || 0
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET /api/analytics/revenue error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}