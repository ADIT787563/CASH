import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { productViews } from '@/db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
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
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const topParam = searchParams.get('top');
    const top = Math.min(parseInt(topParam ?? '10'), 50);

    // Validate date formats if provided
    if (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      return NextResponse.json({ 
        error: 'Invalid from date format. Use YYYY-MM-DD',
        code: 'INVALID_DATE_FORMAT' 
      }, { status: 400 });
    }

    if (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return NextResponse.json({ 
        error: 'Invalid to date format. Use YYYY-MM-DD',
        code: 'INVALID_DATE_FORMAT' 
      }, { status: 400 });
    }

    // Build where conditions
    const conditions = [eq(productViews.userId, userId)];

    if (from) {
      conditions.push(gte(productViews.viewDate, from));
    }

    if (to) {
      conditions.push(lte(productViews.viewDate, to));
    }

    // Query with aggregations
    const results = await db
      .select({
        productId: productViews.productId,
        name: productViews.productName,
        views: sql<number>`CAST(SUM(${productViews.viewCount}) AS INTEGER)`,
        clicks: sql<number>`CAST(SUM(${productViews.clickCount}) AS INTEGER)`,
      })
      .from(productViews)
      .where(and(...conditions))
      .groupBy(productViews.productId, productViews.productName)
      .orderBy(desc(sql`SUM(${productViews.viewCount})`))
      .limit(top);

    // Calculate CTR for each item
    const items = results.map(item => ({
      productId: item.productId,
      name: item.name,
      views: item.views,
      clicks: item.clicks,
      ctr: item.views > 0 ? Number((item.clicks / item.views).toFixed(4)) : 0,
    }));

    return NextResponse.json({ items }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}