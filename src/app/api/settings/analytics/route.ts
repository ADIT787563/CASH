import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analyticsSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;

    const settings = await db.select()
      .from(analyticsSettings)
      .where(eq(analyticsSettings.userId, userId))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json({ 
        error: 'Analytics settings not found',
        code: 'SETTINGS_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json(settings[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const existingSettings = await db.select()
      .from(analyticsSettings)
      .where(eq(analyticsSettings.userId, userId))
      .limit(1);

    if (existingSettings.length === 0) {
      return NextResponse.json({ 
        error: 'Analytics settings not found',
        code: 'SETTINGS_NOT_FOUND'
      }, { status: 404 });
    }

    if (body.retentionDays !== undefined) {
      if (![30, 90, -1].includes(body.retentionDays)) {
        return NextResponse.json({ 
          error: 'Retention days must be 30, 90, or -1 (unlimited)',
          code: 'INVALID_RETENTION_DAYS'
        }, { status: 400 });
      }
    }

    if (body.reportFrequency !== undefined) {
      if (!['daily', 'weekly', 'monthly'].includes(body.reportFrequency)) {
        return NextResponse.json({ 
          error: 'Report frequency must be one of: daily, weekly, monthly',
          code: 'INVALID_REPORT_FREQUENCY'
        }, { status: 400 });
      }
    }

    if (body.reportTime !== undefined) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(body.reportTime)) {
        return NextResponse.json({ 
          error: 'Report time must be in HH:MM format (24-hour)',
          code: 'INVALID_REPORT_TIME'
        }, { status: 400 });
      }
    }

    const updatableFields: Partial<typeof analyticsSettings.$inferInsert> = {};

    if (body.retentionDays !== undefined) updatableFields.retentionDays = body.retentionDays;
    if (body.realtimeEnabled !== undefined) updatableFields.realtimeEnabled = body.realtimeEnabled;
    if (body.defaultTimezone !== undefined) updatableFields.defaultTimezone = body.defaultTimezone.trim();
    if (body.csvExportEnabled !== undefined) updatableFields.csvExportEnabled = body.csvExportEnabled;
    if (body.pngExportEnabled !== undefined) updatableFields.pngExportEnabled = body.pngExportEnabled;
    if (body.anonymizePii !== undefined) updatableFields.anonymizePii = body.anonymizePii;
    if (body.webhookUrl !== undefined) updatableFields.webhookUrl = body.webhookUrl ? body.webhookUrl.trim() : null;
    if (body.webhookSecret !== undefined) updatableFields.webhookSecret = body.webhookSecret ? body.webhookSecret.trim() : null;
    if (body.scheduledReportEnabled !== undefined) updatableFields.scheduledReportEnabled = body.scheduledReportEnabled;
    if (body.reportFrequency !== undefined) updatableFields.reportFrequency = body.reportFrequency;
    if (body.reportTime !== undefined) updatableFields.reportTime = body.reportTime;
    if (body.reportRecipients !== undefined) updatableFields.reportRecipients = body.reportRecipients;
    if (body.demoMode !== undefined) updatableFields.demoMode = body.demoMode;

    updatableFields.updatedAt = new Date().toISOString();

    const updated = await db.update(analyticsSettings)
      .set(updatableFields)
      .where(eq(analyticsSettings.userId, userId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update analytics settings',
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