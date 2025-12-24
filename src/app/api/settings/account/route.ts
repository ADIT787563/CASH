import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accountSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [settings] = await db.select()
      .from(accountSettings)
      .where(eq(accountSettings.userId, user.id))
      .limit(1);

    if (!settings) {
      return NextResponse.json({
        timezone: 'Asia/Kolkata',
        language: 'en',
        dataRetentionPeriod: 30
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Fetch Account Settings Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { timezone, language, dataRetentionPeriod } = body;

    const [existing] = await db.select()
      .from(accountSettings)
      .where(eq(accountSettings.userId, user.id))
      .limit(1);

    const now = new Date().toISOString();

    if (existing) {
      await db.update(accountSettings)
        .set({
          timezone: timezone || existing.timezone,
          language: language || existing.language,
          dataRetentionPeriod: dataRetentionPeriod !== undefined ? dataRetentionPeriod : existing.dataRetentionPeriod,
          updatedAt: now
        })
        .where(eq(accountSettings.id, existing.id));
    } else {
      await db.insert(accountSettings)
        .values({
          userId: user.id,
          timezone: timezone || 'Asia/Kolkata',
          language: language || 'en',
          dataRetentionPeriod: dataRetentionPeriod !== undefined ? dataRetentionPeriod : 30,
          createdAt: now,
          updatedAt: now
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Account Settings Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}