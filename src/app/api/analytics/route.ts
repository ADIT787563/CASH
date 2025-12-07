import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analytics } from '@/db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// Helper to get userId from headers (for testing/demo)
function getUserId(request: NextRequest): string {
  return request.headers.get('x-user-id') || 'demo-user-1';
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
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

    // List with pagination and date range filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build WHERE conditions
    const conditions = [eq(analytics.userId, userId)];

    if (startDate) {
      conditions.push(gte(analytics.date, startDate));
    }

    if (endDate) {
      conditions.push(lte(analytics.date, endDate));
    }

    // Sort by date descending (newest first)
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