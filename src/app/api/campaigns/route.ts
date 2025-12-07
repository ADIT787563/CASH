import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';
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

    // Single campaign fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const campaign = await db
        .select()
        .from(campaigns)
        .where(and(eq(campaigns.id, parseInt(id)), eq(campaigns.userId, userId)))
        .limit(1);

      if (campaign.length === 0) {
        return NextResponse.json(
          { error: 'Campaign not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(campaign[0], { status: 200 });
    }

    // List campaigns with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Build filter conditions
    const conditions = [eq(campaigns.userId, userId)];

    if (search) {
      conditions.push(like(campaigns.name, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(campaigns.status, status));
    }

    const results = await db.select()
      .from(campaigns)
      .where(and(...conditions))
      .orderBy(desc(campaigns.createdAt))
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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { name, templateId, scheduledAt } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must not be empty', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData: any = {
      userId: user.id,
      name: name.trim(),
      status: 'draft',
      targetCount: 0,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Add optional fields if provided
    if (templateId !== undefined && templateId !== null) {
      if (isNaN(parseInt(templateId))) {
        return NextResponse.json(
          { error: 'Template ID must be a valid integer', code: 'INVALID_TEMPLATE_ID' },
          { status: 400 }
        );
      }
      insertData.templateId = parseInt(templateId);
    }

    if (scheduledAt !== undefined && scheduledAt !== null) {
      insertData.scheduledAt = scheduledAt;
    }

    const newCampaign = await db.insert(campaigns).values(insertData).returning();

    return NextResponse.json(newCampaign[0], { status: 201 });
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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Check if campaign exists and belongs to user
    const existingCampaign = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, parseInt(id)), eq(campaigns.userId, user.id)))
      .limit(1);

    if (existingCampaign.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    // Add updatable fields if provided
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return NextResponse.json(
          { error: 'Name must not be empty', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.templateId !== undefined) {
      if (body.templateId === null) {
        updateData.templateId = null;
      } else if (!isNaN(parseInt(body.templateId))) {
        updateData.templateId = parseInt(body.templateId);
      } else {
        return NextResponse.json(
          { error: 'Template ID must be a valid integer or null', code: 'INVALID_TEMPLATE_ID' },
          { status: 400 }
        );
      }
    }

    if (body.status !== undefined) {
      const validStatuses = ['draft', 'scheduled', 'running', 'completed', 'paused'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            error: `Status must be one of: ${validStatuses.join(', ')}`,
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.scheduledAt !== undefined) {
      updateData.scheduledAt = body.scheduledAt;
    }

    if (body.targetCount !== undefined) {
      if (isNaN(parseInt(body.targetCount))) {
        return NextResponse.json(
          { error: 'Target count must be a valid integer', code: 'INVALID_TARGET_COUNT' },
          { status: 400 }
        );
      }
      updateData.targetCount = parseInt(body.targetCount);
    }

    if (body.sentCount !== undefined) {
      if (isNaN(parseInt(body.sentCount))) {
        return NextResponse.json(
          { error: 'Sent count must be a valid integer', code: 'INVALID_SENT_COUNT' },
          { status: 400 }
        );
      }
      updateData.sentCount = parseInt(body.sentCount);
    }

    if (body.deliveredCount !== undefined) {
      if (isNaN(parseInt(body.deliveredCount))) {
        return NextResponse.json(
          { error: 'Delivered count must be a valid integer', code: 'INVALID_DELIVERED_COUNT' },
          { status: 400 }
        );
      }
      updateData.deliveredCount = parseInt(body.deliveredCount);
    }

    if (body.readCount !== undefined) {
      if (isNaN(parseInt(body.readCount))) {
        return NextResponse.json(
          { error: 'Read count must be a valid integer', code: 'INVALID_READ_COUNT' },
          { status: 400 }
        );
      }
      updateData.readCount = parseInt(body.readCount);
    }

    const updated = await db
      .update(campaigns)
      .set(updateData)
      .where(and(eq(campaigns.id, parseInt(id)), eq(campaigns.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found', code: 'NOT_FOUND' },
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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if campaign exists and belongs to user
    const existingCampaign = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, parseInt(id)), eq(campaigns.userId, user.id)))
      .limit(1);

    if (existingCampaign.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(campaigns)
      .where(and(eq(campaigns.id, parseInt(id)), eq(campaigns.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Campaign deleted successfully',
        campaign: deleted[0],
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