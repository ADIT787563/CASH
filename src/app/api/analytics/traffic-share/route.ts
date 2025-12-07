import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { trafficSources } from '@/db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Build WHERE conditions
    const conditions = [eq(trafficSources.userId, userId)];

    if (from) {
      conditions.push(gte(trafficSources.date, from));
    }

    if (to) {
      conditions.push(lte(trafficSources.date, to));
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Query to get breakdown by source with aggregated visits
    const breakdownResults = await db
      .select({
        source: trafficSources.source,
        count: sql<number>`CAST(SUM(${trafficSources.visits}) AS INTEGER)`,
      })
      .from(trafficSources)
      .where(whereCondition)
      .groupBy(trafficSources.source)
      .orderBy(desc(sql`SUM(${trafficSources.visits})`));

    // Calculate total visits
    const total = breakdownResults.reduce((sum, item) => sum + item.count, 0);

    // Calculate percentages
    const breakdown = breakdownResults.map(item => ({
      source: item.source,
      count: item.count,
      percent: total > 0 ? parseFloat(((item.count / total) * 100).toFixed(1)) : 0,
    }));

    return NextResponse.json({
      breakdown,
      total,
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/analytics/traffic-share error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}