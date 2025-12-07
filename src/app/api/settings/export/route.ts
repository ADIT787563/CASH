import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exportJobs } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Filters
    const jobType = searchParams.get('jobType');
    const status = searchParams.get('status');

    // Build query with user scoping
    let conditions = [eq(exportJobs.userId, session.user.id)];

    if (jobType) {
      conditions.push(eq(exportJobs.jobType, jobType));
    }

    if (status) {
      conditions.push(eq(exportJobs.status, status));
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    const results = await db.select()
      .from(exportJobs)
      .where(whereCondition)
      .orderBy(desc(exportJobs.createdAt))
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
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();

    // Security: Reject if userId or user_id in request body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { jobType, dateRangeStart, dateRangeEnd } = requestBody;

    // Validate required fields
    if (!jobType) {
      return NextResponse.json({ 
        error: "jobType is required",
        code: "MISSING_JOB_TYPE" 
      }, { status: 400 });
    }

    // Validate jobType
    const validJobTypes = ['leads', 'chats', 'analytics', 'full_backup'];
    if (!validJobTypes.includes(jobType)) {
      return NextResponse.json({ 
        error: `jobType must be one of: ${validJobTypes.join(', ')}`,
        code: "INVALID_JOB_TYPE" 
      }, { status: 400 });
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      userId: session.user.id,
      jobType,
      status: 'pending',
      fileUrl: null,
      dateRangeStart: dateRangeStart || null,
      dateRangeEnd: dateRangeEnd || null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    };

    const newExportJob = await db.insert(exportJobs)
      .values(insertData)
      .returning();

    return NextResponse.json(newExportJob[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}