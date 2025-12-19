import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, leadActivityLog } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
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

    // Single lead by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        }, { status: 400 });
      }

      const lead = await db.select()
        .from(leads)
        .where(and(eq(leads.id, parseInt(id)), eq(leads.userId, userId)))
        .limit(1);

      if (lead.length === 0) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      return NextResponse.json(lead[0], { status: 200 });
    }

    // List leads with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const source = searchParams.get('source');

    // Build conditions array
    const conditions = [eq(leads.userId, userId)];

    if (search) {
      conditions.push(
        or(
          like(leads.name, `%${search}%`),
          like(leads.phone, `%${search}%`),
          like(leads.email, `%${search}%`)
        )!
      );
    }

    if (status) {
      conditions.push(eq(leads.status, status));
    }

    if (source) {
      conditions.push(eq(leads.source, source));
    }

    const results = await db.select()
      .from(leads)
      .where(and(...conditions))
      .orderBy(desc(leads.createdAt))
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
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED'
      }, { status: 400 });
    }

    const { name, phone, email, source, status, interest, lastMessage, lastContacted, notes } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({
        error: 'Name is required',
        code: 'MISSING_NAME'
      }, { status: 400 });
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json({
        error: 'Phone is required',
        code: 'MISSING_PHONE'
      }, { status: 400 });
    }

    if (!source || !source.trim()) {
      return NextResponse.json({
        error: 'Source is required',
        code: 'MISSING_SOURCE'
      }, { status: 400 });
    }

    // Validate source value
    const validSources = ['whatsapp', 'website', 'referral'];
    if (!validSources.includes(source)) {
      return NextResponse.json({
        error: 'Invalid source. Must be one of: whatsapp, website, referral',
        code: 'INVALID_SOURCE'
      }, { status: 400 });
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({
          error: 'Invalid status. Must be one of: new, contacted, qualified, converted, lost',
          code: 'INVALID_STATUS'
        }, { status: 400 });
      }
    }

    // Check for duplicate lead - AG-301
    const existingLead = await db.select()
      .from(leads)
      .where(and(eq(leads.userId, user.id), eq(leads.phone, phone.trim())))
      .limit(1);

    if (existingLead.length > 0) {
      return NextResponse.json({
        error: 'A lead with this phone number already exists',
        code: 'DUPLICATE_LEAD'
      }, { status: 409 });
    }

    const now = new Date().toISOString();
    const newLead = await db.insert(leads)
      .values({
        userId: user.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : null,
        source: source.trim(),
        status: status || 'new',
        interest: interest ? interest.trim() : null,
        lastMessage: lastMessage ? lastMessage.trim() : null,
        lastContacted: lastContacted || null,
        notes: notes ? notes.trim() : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const createdLead = newLead[0];

    // Log Creation - AG-302
    await db.insert(leadActivityLog).values({
      leadId: createdLead.id,
      userId: user.id,
      action: 'lead_created',
      newStatus: createdLead.status,
      createdAt: now,
    });

    return NextResponse.json(createdLead, { status: 201 });

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
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED'
      }, { status: 400 });
    }

    // Check if lead exists and belongs to user
    const existingLead = await db.select()
      .from(leads)
      .where(and(eq(leads.id, parseInt(id)), eq(leads.userId, user.id)))
      .limit(1);

    if (existingLead.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const { name, phone, email, source, status, interest, lastMessage, lastContacted, notes } = body;

    // Validate fields if provided
    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json({
        error: 'Name cannot be empty',
        code: 'INVALID_NAME'
      }, { status: 400 });
    }

    if (phone !== undefined && (!phone || !phone.trim())) {
      return NextResponse.json({
        error: 'Phone cannot be empty',
        code: 'INVALID_PHONE'
      }, { status: 400 });
    }

    if (source !== undefined) {
      const validSources = ['whatsapp', 'website', 'referral'];
      if (!validSources.includes(source)) {
        return NextResponse.json({
          error: 'Invalid source. Must be one of: whatsapp, website, referral',
          code: 'INVALID_SOURCE'
        }, { status: 400 });
      }
    }

    if (status !== undefined) {
      const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({
          error: 'Invalid status. Must be one of: new, contacted, qualified, converted, lost',
          code: 'INVALID_STATUS'
        }, { status: 400 });
      }
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (email !== undefined) updates.email = email ? email.trim().toLowerCase() : null;
    if (source !== undefined) updates.source = source.trim();
    if (status !== undefined) updates.status = status;
    if (interest !== undefined) updates.interest = interest ? interest.trim() : null;
    if (lastMessage !== undefined) updates.lastMessage = lastMessage ? lastMessage.trim() : null;
    if (lastContacted !== undefined) updates.lastContacted = lastContacted;
    if (notes !== undefined) updates.notes = notes ? notes.trim() : null;

    const updatedLead = await db.update(leads)
      .set(updates)
      .where(and(eq(leads.id, parseInt(id)), eq(leads.userId, user.id)))
      .returning();

    if (updatedLead.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const updatedLeadData = updatedLead[0];

    // Log Status Change - AG-302
    if (status !== undefined && status !== existingLead[0].status) {
      await db.insert(leadActivityLog).values({
        leadId: updatedLeadData.id,
        userId: user.id,
        action: 'status_change',
        oldStatus: existingLead[0].status,
        newStatus: status,
        createdAt: new Date().toISOString(),
      });
    }

    // Log Note Addition - AG-302
    if (notes !== undefined && notes !== existingLead[0].notes) {
      await db.insert(leadActivityLog).values({
        leadId: updatedLeadData.id,
        userId: user.id,
        action: 'note_updated',
        metadata: { notes: notes.trim() },
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(updatedLeadData, { status: 200 });

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
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    // Check if lead exists and belongs to user
    const existingLead = await db.select()
      .from(leads)
      .where(and(eq(leads.id, parseInt(id)), eq(leads.userId, user.id)))
      .limit(1);

    if (existingLead.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const deletedLead = await db.delete(leads)
      .where(and(eq(leads.id, parseInt(id)), eq(leads.userId, user.id)))
      .returning();

    if (deletedLead.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Lead deleted successfully',
      lead: deletedLead[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}