import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analytics, messages, leads, orders } from '@/db/schema';
import { eq, and, desc, gte, lte, sql, isNotNull, ne } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// Helper to get userId from headers (for testing/demo)
function getUserId(request: NextRequest): string {
  return request.headers.get('x-user-id') || 'demo-user-1';
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode'); // 'dashboard' | 'list' | 'single'
    const id = searchParams.get('id');

    // --- DASHBOARD AGGREGATION MODE ---
    if (mode === 'dashboard') {
      const now = new Date();
      // Start of day in local time (naive approach, better to use user timezone if available)
      // For simplicity in this demo, we'll use UTC or server time start of day
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

      // 7 Days ago for analytics chart
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString();

      // Parallel Fetching for Dashboard Components
      const [
        messagesToday,
        leadsToday,
        ordersToday,
        revenueToday,
        totalOrders,
        totalOutboundMessages, // Was totalMessages
        totalRevenue,
        revenueLast7Days,
        uniqueConvertedLeadsCount // New metric for conversion rate
      ] = await Promise.all([
        // 1. Messages Today
        db.select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(and(
            eq(messages.userId, userId),
            gte(messages.createdAt, startOfDay)
          )),

        // 2. Leads Today
        db.select({ count: sql<number>`count(*)` })
          .from(leads)
          .where(and(
            eq(leads.userId, userId),
            gte(leads.createdAt, startOfDay)
          )),

        // 3. Orders Today (Exclude Subscription)
        db.select({ count: sql<number>`count(*)` })
          .from(orders)
          .where(and(
            eq(orders.userId, userId),
            gte(orders.createdAt, startOfDay),
            ne(orders.source, 'subscription')
          )),

        // 4. Revenue Today (Paid Only, Exclude Subscription)
        db.select({ total: sql<number>`sum(${orders.totalAmount})` })
          .from(orders)
          .where(and(
            eq(orders.userId, userId),
            gte(orders.createdAt, startOfDay),
            ne(orders.source, 'subscription')
          )),

        // 5. Total Orders (All Time, Exclude Subscription)
        db.select({ count: sql<number>`count(*)` })
          .from(orders)
          .where(and(
            eq(orders.userId, userId),
            ne(orders.source, 'subscription')
          )),

        // 6. Total Messages Automated (Outbound)
        db.select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(and(
            eq(messages.userId, userId),
            eq(messages.direction, 'outbound')
          )),

        // 7. Total Revenue (All Time, Paid Only, No Sub)
        db.select({ total: sql<number>`sum(${orders.totalAmount})` })
          .from(orders)
          .where(and(
            eq(orders.userId, userId),
            eq(orders.paymentStatus, 'paid'),
            ne(orders.source, 'subscription')
          )),

        // 8. Analytics Chart (Last 7 Days)
        db.select({
          date: sql<string>`substr(${orders.createdAt}, 1, 10)`,
          revenue: sql<number>`sum(${orders.totalAmount})`
        })
          .from(orders)
          .where(and(
            eq(orders.userId, userId),
            gte(orders.createdAt, sevenDaysAgoStr),
            eq(orders.paymentStatus, 'paid'),
            ne(orders.source, 'subscription')
          ))
          .groupBy(sql`substr(${orders.createdAt}, 1, 10)`)
          .orderBy(sql`substr(${orders.createdAt}, 1, 10)`),

        // 9. Unique Converted Leads
        db.select({ count: sql<number>`count(distinct ${orders.leadId})` })
          .from(orders)
          .where(and(
            eq(orders.userId, userId),
            ne(orders.source, 'subscription'),
            isNotNull(orders.leadId)
          ))
      ]);

      // Calculate conversion rate (Unique Leads with Orders / Total Leads * 100)
      const leadCount = (await db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.userId, userId)))[0]?.count || 0;
      const convertedCount = uniqueConvertedLeadsCount[0]?.count || 0;

      // Cap at 100% just in case of data anomalies, though logic should prevent it
      let conversionRateVal = leadCount > 0 ? (convertedCount / leadCount) * 100 : 0;
      if (conversionRateVal > 100) conversionRateVal = 100;

      return NextResponse.json({
        topStats: {
          messages: messagesToday[0]?.count || 0,
          leads: leadsToday[0]?.count || 0,
          orders: ordersToday[0]?.count || 0,
          revenue: (revenueToday[0]?.total || 0) / 100,
        },
        inboxStats: {
          totalOrders: totalOrders[0]?.count || 0,
          messagesAutomated: totalOutboundMessages[0]?.count || 0,
          paymentsReceived: (totalRevenue[0]?.total || 0) / 100,
          conversionRate: `${conversionRateVal.toFixed(1)}%`,
          revenueLast7Days: (revenueLast7Days.reduce((acc, curr) => acc + (curr.revenue || 0), 0) / 100).toFixed(0)
        },
        chartData: revenueLast7Days.map(item => ({
          date: item.date,
          value: (item.revenue || 0) / 100
        }))
      });
    }

    // --- SINGLE RECORD FETCH ---
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({
          error: "Valid ID is required",
          code: "INVALID_ID"
        }, { status: 400 });
      }

      const record = await db.select()
        .from(analytics)
        .where(and(
          eq(analytics.id, parseInt(id)),
          eq(analytics.userId, userId)
        ))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({
          error: 'Analytics record not found',
          code: 'NOT_FOUND'
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // --- LIST FETCH (Legacy/Standard) ---
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const conditions = [eq(analytics.userId, userId)];

    if (startDate) {
      conditions.push(gte(analytics.date, startDate));
    }

    if (endDate) {
      conditions.push(lte(analytics.date, endDate));
    }

    const results = await db.select()
      .from(analytics)
      .where(and(...conditions))
      .orderBy(desc(analytics.date))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED"
      }, { status: 400 });
    }

    const {
      date,
      totalMessages,
      inboundMessages,
      outboundMessages,
      newLeads,
      convertedLeads,
      productClicks,
      templateSends
    } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json({
        error: "Date is required",
        code: "MISSING_DATE"
      }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({
        error: "Date must be in YYYY-MM-DD format",
        code: "INVALID_DATE_FORMAT"
      }, { status: 400 });
    }

    // Validate date is a valid date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({
        error: "Invalid date value",
        code: "INVALID_DATE"
      }, { status: 400 });
    }

    // Prepare insert data with defaults
    const insertData = {
      userId: user.id,
      date: date.trim(),
      totalMessages: totalMessages ?? 0,
      inboundMessages: inboundMessages ?? 0,
      outboundMessages: outboundMessages ?? 0,
      newLeads: newLeads ?? 0,
      convertedLeads: convertedLeads ?? 0,
      productClicks: productClicks ?? 0,
      templateSends: templateSends ?? 0,
      createdAt: new Date().toISOString()
    };

    const newRecord = await db.insert(analytics)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED"
      }, { status: 400 });
    }

    // Check if record exists and belongs to user
    const existing = await db.select()
      .from(analytics)
      .where(and(
        eq(analytics.id, parseInt(id)),
        eq(analytics.userId, user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({
        error: 'Analytics record not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }

    // Prepare update data (only allowed fields)
    const updates: Record<string, number> = {};

    if (body.totalMessages !== undefined) updates.totalMessages = body.totalMessages;
    if (body.inboundMessages !== undefined) updates.inboundMessages = body.inboundMessages;
    if (body.outboundMessages !== undefined) updates.outboundMessages = body.outboundMessages;
    if (body.newLeads !== undefined) updates.newLeads = body.newLeads;
    if (body.convertedLeads !== undefined) updates.convertedLeads = body.convertedLeads;
    if (body.productClicks !== undefined) updates.productClicks = body.productClicks;
    if (body.templateSends !== undefined) updates.templateSends = body.templateSends;

    // If no valid fields to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        error: "No valid fields to update",
        code: "NO_UPDATES"
      }, { status: 400 });
    }

    const updated = await db.update(analytics)
      .set(updates)
      .where(and(
        eq(analytics.id, parseInt(id)),
        eq(analytics.userId, user.id)
      ))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if record exists and belongs to user
    const existing = await db.select()
      .from(analytics)
      .where(and(
        eq(analytics.id, parseInt(id)),
        eq(analytics.userId, user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({
        error: 'Analytics record not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }

    const deleted = await db.delete(analytics)
      .where(and(
        eq(analytics.id, parseInt(id)),
        eq(analytics.userId, user.id)
      ))
      .returning();

    return NextResponse.json({
      message: 'Analytics record deleted successfully',
      record: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}