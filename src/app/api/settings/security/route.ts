import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { securitySettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch security settings for authenticated user
    const settings = await db.select()
      .from(securitySettings)
      .where(eq(securitySettings.userId, userId))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json({ 
        error: 'Security settings not found',
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
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Security: Reject if userId or user_id in request body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if settings exist for user
    const existingSettings = await db.select()
      .from(securitySettings)
      .where(eq(securitySettings.userId, userId))
      .limit(1);

    if (existingSettings.length === 0) {
      return NextResponse.json({ 
        error: 'Security settings not found',
        code: 'SETTINGS_NOT_FOUND'
      }, { status: 404 });
    }

    // Validate twoFactorMethod if provided
    if (body.twoFactorMethod !== undefined && body.twoFactorMethod !== null) {
      const validMethods = ['sms', 'authenticator'];
      if (!validMethods.includes(body.twoFactorMethod)) {
        return NextResponse.json({ 
          error: "Invalid two-factor method. Must be 'sms', 'authenticator', or null",
          code: "INVALID_TWO_FACTOR_METHOD" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: {
      twoFactorEnabled?: boolean;
      twoFactorMethod?: string | null;
      twoFactorSecret?: string | null;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString()
    };

    // Handle updatable fields
    if ('twoFactorEnabled' in body) {
      updateData.twoFactorEnabled = body.twoFactorEnabled;
      
      // If two-factor is disabled, clear method and secret
      if (body.twoFactorEnabled === false) {
        updateData.twoFactorMethod = null;
        updateData.twoFactorSecret = null;
      }
    }

    if ('twoFactorMethod' in body && updateData.twoFactorEnabled !== false) {
      updateData.twoFactorMethod = body.twoFactorMethod;
    }

    if ('twoFactorSecret' in body && updateData.twoFactorEnabled !== false) {
      updateData.twoFactorSecret = body.twoFactorSecret;
    }

    // Update settings
    const updated = await db.update(securitySettings)
      .set(updateData)
      .where(eq(securitySettings.userId, userId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update security settings',
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