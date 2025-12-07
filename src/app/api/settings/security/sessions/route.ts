import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userSessions } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Query user sessions
    const sessions = await db.select()
      .from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.lastActiveAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(sessions, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID is provided
    if (!id) {
      return NextResponse.json({ 
        error: 'Session ID is required',
        code: 'MISSING_SESSION_ID' 
      }, { status: 400 });
    }

    // Validate ID is a valid integer
    if (isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid session ID is required',
        code: 'INVALID_SESSION_ID' 
      }, { status: 400 });
    }

    // Check if session exists and belongs to the authenticated user
    const existingSession = await db.select()
      .from(userSessions)
      .where(and(
        eq(userSessions.id, parseInt(id)),
        eq(userSessions.userId, userId)
      ))
      .limit(1);

    if (existingSession.length === 0) {
      return NextResponse.json({ 
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete the session
    const deleted = await db.delete(userSessions)
      .where(and(
        eq(userSessions.id, parseInt(id)),
        eq(userSessions.userId, userId)
      ))
      .returning();

    return NextResponse.json({ 
      message: 'Session terminated successfully',
      session: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}