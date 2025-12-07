import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { backupSchedules } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

    // Fetch backup schedule for authenticated user
    const schedule = await db.select()
      .from(backupSchedules)
      .where(eq(backupSchedules.userId, userId))
      .limit(1);

    if (schedule.length === 0) {
      return NextResponse.json({ 
        error: 'Backup schedule not found',
        code: 'SCHEDULE_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json(schedule[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();

    // Security: Reject if userId or user_id in request body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED'
      }, { status: 400 });
    }

    // Check if schedule exists for user
    const existingSchedule = await db.select()
      .from(backupSchedules)
      .where(eq(backupSchedules.userId, userId))
      .limit(1);

    if (existingSchedule.length === 0) {
      return NextResponse.json({ 
        error: 'Backup schedule not found',
        code: 'SCHEDULE_NOT_FOUND'
      }, { status: 404 });
    }

    // Validation
    const { enabled, frequency, storageProvider, storageConfig, lastBackupAt, nextBackupAt } = body;

    // Validate frequency if provided
    if (frequency !== undefined) {
      const validFrequencies = ['daily', 'weekly'];
      if (!validFrequencies.includes(frequency)) {
        return NextResponse.json({ 
          error: 'Frequency must be one of: daily, weekly',
          code: 'INVALID_FREQUENCY'
        }, { status: 400 });
      }
    }

    // Validate storageProvider if provided
    if (storageProvider !== undefined && storageProvider !== null) {
      const validProviders = ['s3', 'firebase'];
      if (!validProviders.includes(storageProvider)) {
        return NextResponse.json({ 
          error: 'Storage provider must be one of: s3, firebase, or null',
          code: 'INVALID_STORAGE_PROVIDER'
        }, { status: 400 });
      }
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (enabled !== undefined) updates.enabled = enabled;
    if (frequency !== undefined) updates.frequency = frequency;
    if (storageProvider !== undefined) updates.storageProvider = storageProvider;
    if (storageConfig !== undefined) updates.storageConfig = storageConfig;
    if (lastBackupAt !== undefined) updates.lastBackupAt = lastBackupAt;
    if (nextBackupAt !== undefined) updates.nextBackupAt = nextBackupAt;

    // Update backup schedule
    const updated = await db.update(backupSchedules)
      .set(updates)
      .where(eq(backupSchedules.userId, userId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update backup schedule',
        code: 'UPDATE_FAILED'
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}