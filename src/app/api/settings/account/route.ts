import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accountSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const VALID_LANGUAGES = ['en', 'hi', 'te', 'ta', 'bn', 'mr', 'gu'];

function isValidTimezone(timezone: string): boolean {
  return timezone.startsWith('Asia/') || 
         timezone.startsWith('UTC') || 
         timezone.startsWith('Europe/') || 
         timezone.startsWith('America/') || 
         timezone.startsWith('Africa/') || 
         timezone.startsWith('Pacific/') || 
         timezone.startsWith('Atlantic/') || 
         timezone.startsWith('Indian/');
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const settings = await db.select()
      .from(accountSettings)
      .where(eq(accountSettings.userId, session.user.id))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json({ 
        error: 'Account settings not found',
        code: 'NOT_FOUND' 
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
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const requestBody = await request.json();

    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const existingSettings = await db.select()
      .from(accountSettings)
      .where(eq(accountSettings.userId, session.user.id))
      .limit(1);

    if (existingSettings.length === 0) {
      return NextResponse.json({ 
        error: 'Account settings not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const updates: {
      fullName?: string;
      phone?: string;
      phoneVerified?: boolean;
      timezone?: string;
      language?: string;
      logoUrl?: string;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString()
    };

    if ('fullName' in requestBody) {
      updates.fullName = requestBody.fullName?.trim() || null;
    }

    if ('phone' in requestBody) {
      updates.phone = requestBody.phone?.trim() || null;
    }

    if ('phoneVerified' in requestBody) {
      if (typeof requestBody.phoneVerified !== 'boolean') {
        return NextResponse.json({ 
          error: 'phoneVerified must be a boolean',
          code: 'INVALID_PHONE_VERIFIED' 
        }, { status: 400 });
      }
      updates.phoneVerified = requestBody.phoneVerified;
    }

    if ('timezone' in requestBody) {
      const timezone = requestBody.timezone?.trim();
      if (timezone && !isValidTimezone(timezone)) {
        return NextResponse.json({ 
          error: 'Invalid timezone format. Expected format: Asia/*, UTC, Europe/*, etc.',
          code: 'INVALID_TIMEZONE' 
        }, { status: 400 });
      }
      updates.timezone = timezone;
    }

    if ('language' in requestBody) {
      const language = requestBody.language?.trim();
      if (language && !VALID_LANGUAGES.includes(language)) {
        return NextResponse.json({ 
          error: `Invalid language. Must be one of: ${VALID_LANGUAGES.join(', ')}`,
          code: 'INVALID_LANGUAGE' 
        }, { status: 400 });
      }
      updates.language = language;
    }

    if ('logoUrl' in requestBody) {
      updates.logoUrl = requestBody.logoUrl?.trim() || null;
    }

    const updatedSettings = await db.update(accountSettings)
      .set(updates)
      .where(eq(accountSettings.userId, session.user.id))
      .returning();

    if (updatedSettings.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update account settings',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(updatedSettings[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}