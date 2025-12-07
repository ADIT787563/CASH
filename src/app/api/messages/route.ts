import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages, leads } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
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

      const message = await db.select()
        .from(messages)
        .where(and(
          eq(messages.id, parseInt(id)),
          eq(messages.userId, userId)
        ))
        .limit(1);

      if (message.length === 0) {
        return NextResponse.json({
          error: 'Message not found',
          code: 'MESSAGE_NOT_FOUND'
        }, { status: 404 });
      }

      return NextResponse.json(message[0], { status: 200 });
    }

    // List with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const leadId = searchParams.get('leadId');
    const direction = searchParams.get('direction');
    const status = searchParams.get('status');

    // Build WHERE conditions
    const conditions = [eq(messages.userId, userId)];

    if (leadId) {
      const leadIdNum = parseInt(leadId);
      if (!isNaN(leadIdNum)) {
        conditions.push(eq(messages.leadId, leadIdNum));
      }
    }

    if (direction) {
      conditions.push(eq(messages.direction, direction));
    }

    if (status) {
      conditions.push(eq(messages.status, status));
    }

    const results = await db.select()
      .from(messages)
      .where(and(...conditions))
      .orderBy(desc(messages.createdAt))
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

    const { direction, content, status, phoneNumber, leadId, fromNumber, toNumber, messageType } = body;

    // Validate required fields
    if (!direction) {
      return NextResponse.json({
        error: "Direction is required",
        code: "MISSING_DIRECTION"
      }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({
        error: "Content is required",
        code: "MISSING_CONTENT"
      }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({
        error: "Status is required",
        code: "MISSING_STATUS"
      }, { status: 400 });
    }

    if (!phoneNumber) {
      return NextResponse.json({
        error: "Phone number is required",
        code: "MISSING_PHONE_NUMBER"
      }, { status: 400 });
    }

    // Validate direction
    const validDirections = ['inbound', 'outbound'];
    if (!validDirections.includes(direction)) {
      return NextResponse.json({
        error: "Direction must be 'inbound' or 'outbound'",
        code: "INVALID_DIRECTION"
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['sent', 'delivered', 'read', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: "Status must be 'sent', 'delivered', 'read', or 'failed'",
        code: "INVALID_STATUS"
      }, { status: 400 });
    }

    // Validate leadId if provided
    if (leadId !== undefined && leadId !== null) {
      const leadIdNum = parseInt(leadId);
      if (isNaN(leadIdNum)) {
        return NextResponse.json({
          error: "Lead ID must be a valid number",
          code: "INVALID_LEAD_ID"
        }, { status: 400 });
      }

      // Verify lead exists and belongs to user
      const lead = await db.select()
        .from(leads)
        .where(and(
          eq(leads.id, leadIdNum),
          eq(leads.userId, user.id)
        ))
        .limit(1);

      if (lead.length === 0) {
        return NextResponse.json({
          error: "Lead not found or does not belong to user",
          code: "INVALID_LEAD"
        }, { status: 400 });
      }
    }

    const now = new Date().toISOString();

    // Prepare insert data
    const insertData: any = {
      userId: user.id,
      direction: direction.trim(),
      content: content.trim(),
      status: status.trim(),
      phoneNumber: phoneNumber.trim(),
      fromNumber: fromNumber ? fromNumber.trim() : (direction === 'outbound' ? 'BUSINESS' : phoneNumber.trim()),
      toNumber: toNumber ? toNumber.trim() : (direction === 'outbound' ? phoneNumber.trim() : 'BUSINESS'),
      messageType: messageType ? messageType.trim() : 'text',
      timestamp: now,
      createdAt: now,
    };

    if (leadId !== undefined && leadId !== null) {
      insertData.leadId = parseInt(leadId);
    }

    const newMessage = await db.insert(messages)
      .values(insertData)
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });
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

    // Check if message exists and belongs to user
    const existingMessage = await db.select()
      .from(messages)
      .where(and(
        eq(messages.id, parseInt(id)),
        eq(messages.userId, user.id)
      ))
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json({
        error: 'Message not found',
        code: 'MESSAGE_NOT_FOUND'
      }, { status: 404 });
    }

    const { status, content } = body;

    // Prepare update data
    const updates: {
      status?: string;
      content?: string;
    } = {};

    if (status !== undefined) {
      const validStatuses = ['sent', 'delivered', 'read', 'failed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({
          error: "Status must be 'sent', 'delivered', 'read', or 'failed'",
          code: "INVALID_STATUS"
        }, { status: 400 });
      }
      updates.status = status.trim();
    }

    if (content !== undefined) {
      if (!content || content.trim().length === 0) {
        return NextResponse.json({
          error: "Content cannot be empty",
          code: "INVALID_CONTENT"
        }, { status: 400 });
      }
      updates.content = content.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        error: "No valid fields to update",
        code: "NO_UPDATES"
      }, { status: 400 });
    }

    const updated = await db.update(messages)
      .set(updates)
      .where(and(
        eq(messages.id, parseInt(id)),
        eq(messages.userId, user.id)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({
        error: 'Message not found',
        code: 'MESSAGE_NOT_FOUND'
      }, { status: 404 });
    }

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

    // Check if message exists and belongs to user before deleting
    const existingMessage = await db.select()
      .from(messages)
      .where(and(
        eq(messages.id, parseInt(id)),
        eq(messages.userId, user.id)
      ))
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json({
        error: 'Message not found',
        code: 'MESSAGE_NOT_FOUND'
      }, { status: 404 });
    }

    const deleted = await db.delete(messages)
      .where(and(
        eq(messages.id, parseInt(id)),
        eq(messages.userId, user.id)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({
        error: 'Message not found',
        code: 'MESSAGE_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Message deleted successfully',
      deleted: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}