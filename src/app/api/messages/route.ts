import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages, leads } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

// --- Zod Schemas ---

const messageQuerySchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  leadId: z.coerce.number().optional(),
  direction: z.enum(['inbound', 'outbound']).optional(),
  status: z.enum(['sent', 'delivered', 'read', 'failed']).optional(),
});

const createMessageSchema = z.object({
  direction: z.enum(['inbound', 'outbound']),
  content: z.string().min(1, "Content is required"),
  status: z.enum(['sent', 'delivered', 'read', 'failed']),
  phoneNumber: z.string().min(1, "Phone number is required"),
  fromNumber: z.string().optional(),
  toNumber: z.string().optional(),
  messageType: z.string().default('text'),
  leadId: z.number().int().optional(),
}).strict().refine(data => {
  // Security: Prevent manually injecting restricted internal fields if we monitored them here
  return true;
});

const updateMessageSchema = z.object({
  status: z.enum(['sent', 'delivered', 'read', 'failed']).optional(),
  content: z.string().min(1).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

// --- API Route Handlers ---

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams: any = {};
    searchParams.forEach((value, key) => queryParams[key] = value);

    const validation = messageQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { id, limit, offset, leadId, direction, status } = validation.data;

    // Single record fetch
    if (id) {
      const message = await db.select()
        .from(messages)
        .where(and(
          eq(messages.id, id),
          eq(messages.userId, user.id) // RLS
        ))
        .limit(1);

      if (message.length === 0) {
        return NextResponse.json({ error: 'Message not found', code: 'MESSAGE_NOT_FOUND' }, { status: 404 });
      }

      return NextResponse.json(message[0], { status: 200 });
    }

    // List with filters
    const conditions = [eq(messages.userId, user.id)]; // RLS

    if (leadId) conditions.push(eq(messages.leadId, leadId));
    if (direction) conditions.push(eq(messages.direction, direction));
    if (status) conditions.push(eq(messages.status, status));

    const results = await db.select()
      .from(messages)
      .where(and(...conditions))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();

    // Security check: Reject explicitly provided userId to prevent spoofing
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ error: "User ID cannot be provided in request body", code: "USER_ID_NOT_ALLOWED" }, { status: 403 });
    }

    const validation = createMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { direction, content, status, phoneNumber, leadId, fromNumber, toNumber, messageType } = validation.data;

    // Validate lead exists and belongs to user
    if (leadId) {
      const lead = await db.select()
        .from(leads)
        .where(and(
          eq(leads.id, leadId),
          eq(leads.userId, user.id)
        ))
        .limit(1);

      if (lead.length === 0) {
        return NextResponse.json({ error: "Lead not found or does not belong to user", code: "INVALID_LEAD" }, { status: 400 });
      }
    }

    const now = new Date().toISOString();

    const insertData: any = {
      userId: user.id, // Enforced from session
      direction,
      content,
      status,
      phoneNumber,
      fromNumber: fromNumber || (direction === 'outbound' ? 'BUSINESS' : phoneNumber),
      toNumber: toNumber || (direction === 'outbound' ? phoneNumber : 'BUSINESS'),
      messageType,
      timestamp: now,
      createdAt: now,
    };

    if (leadId) insertData.leadId = leadId;

    const newMessage = await db.insert(messages)
      .values(insertData)
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (isNaN(id)) {
      return NextResponse.json({ error: "Valid ID is required", code: "INVALID_ID" }, { status: 400 });
    }

    const body = await request.json();

    // Security check
    if ('userId' in body) {
      return NextResponse.json({ error: "Cannot limit/change userId via PUT" }, { status: 403 });
    }

    const validation = updateMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { status, content } = validation.data;
    const updates: any = {};
    if (status) updates.status = status;
    if (content) updates.content = content;

    const updated = await db.update(messages)
      .set(updates)
      .where(and(
        eq(messages.id, id),
        eq(messages.userId, user.id) // RLS
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Message not found', code: 'MESSAGE_NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (isNaN(id)) {
      return NextResponse.json({ error: "Valid ID is required", code: "INVALID_ID" }, { status: 400 });
    }

    const deleted = await db.delete(messages)
      .where(and(
        eq(messages.id, id),
        eq(messages.userId, user.id) // RLS
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Message not found', code: 'MESSAGE_NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Message deleted successfully',
      deleted: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}