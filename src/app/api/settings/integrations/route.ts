import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { integrations } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const VALID_INTEGRATION_TYPES = [
  'whatsapp',
  'razorpay',
  'paytm',
  'google_sheets',
  'firebase',
  'supabase',
  'zoho',
  'hubspot'
] as const;

const VALID_STATUSES = ['connected', 'disconnected'] as const;

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const integration = await db
        .select()
        .from(integrations)
        .where(and(eq(integrations.id, parseInt(id)), eq(integrations.userId, session.user.id)))
        .limit(1);

      if (integration.length === 0) {
        return NextResponse.json(
          { error: 'Integration not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(integration[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const type = searchParams.get('type');
    const status = searchParams.get('status');



    const conditions = [eq(integrations.userId, session.user.id)];

    if (type) {
      if (!VALID_INTEGRATION_TYPES.includes(type as any)) {
        return NextResponse.json(
          { error: 'Invalid integration type', code: 'INVALID_TYPE' },
          { status: 400 }
        );
      }
      conditions.push(eq(integrations.integrationType, type));
    }

    if (status) {
      if (!VALID_STATUSES.includes(status as any)) {
        return NextResponse.json(
          { error: 'Invalid status', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      conditions.push(eq(integrations.status, status));
    }

    const results = await db
      .select()
      .from(integrations)
      .where(and(...conditions))
      .orderBy(desc(integrations.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED'
        },
        { status: 400 }
      );
    }

    const { integrationType, config, status } = body;

    if (!integrationType) {
      return NextResponse.json(
        { error: 'Integration type is required', code: 'MISSING_INTEGRATION_TYPE' },
        { status: 400 }
      );
    }

    if (!VALID_INTEGRATION_TYPES.includes(integrationType)) {
      return NextResponse.json(
        {
          error: `Invalid integration type. Must be one of: ${VALID_INTEGRATION_TYPES.join(', ')}`,
          code: 'INVALID_INTEGRATION_TYPE'
        },
        { status: 400 }
      );
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newIntegration = await db
      .insert(integrations)
      .values({
        userId: session.user.id,
        integrationType: integrationType.trim(),
        status: status || 'disconnected',
        config: config || null,
        lastSyncAt: null,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newIntegration[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED'
        },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.id, parseInt(id)), eq(integrations.userId, session.user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Integration not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const { integrationType, status, config, lastSyncAt } = body;

    if (integrationType && !VALID_INTEGRATION_TYPES.includes(integrationType)) {
      return NextResponse.json(
        {
          error: `Invalid integration type. Must be one of: ${VALID_INTEGRATION_TYPES.join(', ')}`,
          code: 'INVALID_INTEGRATION_TYPE'
        },
        { status: 400 }
      );
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (integrationType !== undefined) {
      updateData.integrationType = integrationType.trim();
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    if (config !== undefined) {
      updateData.config = config;
    }
    if (lastSyncAt !== undefined) {
      updateData.lastSyncAt = lastSyncAt;
    }

    const updated = await db
      .update(integrations)
      .set(updateData)
      .where(and(eq(integrations.id, parseInt(id)), eq(integrations.userId, session.user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Integration not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.id, parseInt(id)), eq(integrations.userId, session.user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Integration not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(integrations)
      .where(and(eq(integrations.id, parseInt(id)), eq(integrations.userId, session.user.id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Integration deleted successfully',
        integration: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}