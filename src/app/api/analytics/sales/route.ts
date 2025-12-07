import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

// Helper to get userId from headers (for testing/demo)
function getUserId(request: NextRequest): string {
  return request.headers.get('x-user-id') || 'demo-user-1';
}

async function getCurrentUser(request: NextRequest) {
  // For demo/testing purposes, using x-user-id header
  const userId = getUserId(request);
  return { id: userId };
}

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const now = new Date();
    const last30DaysStart = new Date(now);
    last30DaysStart.setDate(now.getDate() - 30);
    const previous30DaysStart = new Date(now);
    previous30DaysStart.setDate(now.getDate() - 60);
    const previous30DaysEnd = new Date(last30DaysStart);
    previous30DaysEnd.setDate(previous30DaysEnd.getDate() - 1);
    const last7DaysStart = new Date(now);
    last7DaysStart.setDate(now.getDate() - 6);

    // Format dates to YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // 1. Total Revenue (completed orders only)
    const totalRevenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`
      })
      .from(orders)
      .where(and(
        eq(orders.userId, user.id),
        eq(orders.status, 'completed')
      ));

    const totalRevenue = Number(totalRevenueResult[0]?.total || 0);

    // 2. Total Orders (all statuses)
    const totalOrdersResult = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(orders)
      .where(eq(orders.userId, user.id));

    const totalOrders = Number(totalOrdersResult[0]?.count || 0);

    // 3. Average Order Value (completed orders only)
    const completedOrdersResult = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(orders)
      .where(and(
        eq(orders.userId, user.id),
        eq(orders.status, 'completed')
      ));

    const completedOrdersCount = Number(completedOrdersResult[0]?.count || 0);
    const averageOrderValue = completedOrdersCount > 0
      ? Number((totalRevenue / completedOrdersCount).toFixed(2))
      : 0;

    // 4. Revenue Growth (last 30 days vs previous 30 days)
    const currentPeriodRevenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`
      })
      .from(orders)
      .where(and(
        eq(orders.userId, user.id),
        eq(orders.status, 'completed'),
        gte(orders.orderDate, last30DaysStart.toISOString())
      ));

    const currentPeriodRevenue = Number(currentPeriodRevenueResult[0]?.total || 0);

    const previousPeriodRevenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`
      })
      .from(orders)
      .where(and(
        eq(orders.userId, user.id),
        eq(orders.status, 'completed'),
        gte(orders.orderDate, previous30DaysStart.toISOString()),
        lte(orders.orderDate, previous30DaysEnd.toISOString())
      ));

    const previousPeriodRevenue = Number(previousPeriodRevenueResult[0]?.total || 0);

    const revenueGrowth = previousPeriodRevenue > 0
      ? Number((((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100).toFixed(2))
      : currentPeriodRevenue > 0 ? 100 : 0;

    // 5. Daily Sales (last 7 days)
    const dailySalesData = await db
      .select({
        date: sql<string>`DATE(${orders.orderDate})`,
        revenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.status} = 'completed' THEN ${orders.totalAmount} ELSE 0 END), 0)`,
        ordersCount: sql<number>`COUNT(*)`
      })
      .from(orders)
      .where(and(
        eq(orders.userId, user.id),
        gte(orders.orderDate, last7DaysStart.toISOString())
      ))
      .groupBy(sql`DATE(${orders.orderDate})`);

    // Create map for existing data
    const salesMap = new Map(
      dailySalesData.map(row => [
        row.date,
        {
          date: row.date,
          revenue: Number(row.revenue),
          ordersCount: Number(row.ordersCount)
        }
      ])
    );

    // Generate last 7 days array with all dates
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = formatDate(date);
      dailySales.push(salesMap.get(dateStr) || {
        date: dateStr,
        revenue: 0,
        ordersCount: 0
      });
    }

    // 6. Top Products (top 5 by quantity sold)
    // Note: Need to join with orderItems since productName and quantity are in line items, not order header
    const topProductsData = await db
      .select({
        productName: sql<string>`${orderItems.productName}`,
        quantitySold: sql<number>`SUM(${orderItems.quantity})`,
        revenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.status} = 'completed' THEN ${orderItems.totalPrice} ELSE 0 END), 0)`
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(eq(orders.userId, user.id))
      .groupBy(orderItems.productName)
      .orderBy(desc(sql`SUM(${orderItems.quantity})`))
      .limit(5);

    const topProducts = topProductsData.map(product => ({
      productName: product.productName,
      quantitySold: Number(product.quantitySold),
      revenue: Number(product.revenue)
    }));

    // 7. Sales by Status
    const salesByStatusData = await db
      .select({
        status: orders.status,
        count: sql<number>`COUNT(*)`,
        amount: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`
      })
      .from(orders)
      .where(eq(orders.userId, user.id))
      .groupBy(orders.status);

    const statusMap = new Map(
      salesByStatusData.map(row => [
        row.status,
        {
          count: Number(row.count),
          amount: Number(row.amount)
        }
      ])
    );

    const salesByStatus = {
      pending: statusMap.get('pending') || { count: 0, amount: 0 },
      completed: statusMap.get('completed') || { count: 0, amount: 0 },
      cancelled: statusMap.get('cancelled') || { count: 0, amount: 0 },
      refunded: statusMap.get('refunded') || { count: 0, amount: 0 }
    };

    // Build response
    const response = {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      averageOrderValue,
      revenueGrowth,
      dailySales,
      topProducts,
      salesByStatus
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET analytics error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}