import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { securitySettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const { method } = body;

    // Validate method
    if (!method) {
      return NextResponse.json({ 
        error: 'Method is required',
        code: 'MISSING_METHOD' 
      }, { status: 400 });
    }

    if (method !== 'sms' && method !== 'authenticator') {
      return NextResponse.json({ 
        error: 'Method must be either "sms" or "authenticator"',
        code: 'INVALID_METHOD' 
      }, { status: 400 });
    }

    // Fetch security settings for user
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

    // Generate random secret (32 character alphanumeric string)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Generate OTP auth URL for authenticator method
    let qrCodeUrl = undefined;
    if (method === 'authenticator') {
      const userEmail = session.user.email || 'user';
      const issuer = 'YourApp';
      qrCodeUrl = `otpauth://totp/${issuer}:${userEmail}?secret=${secret}&issuer=${issuer}`;
    }

    // Update security settings
    await db.update(securitySettings)
      .set({
        twoFactorMethod: method,
        twoFactorSecret: secret,
        updatedAt: new Date().toISOString()
      })
      .where(eq(securitySettings.userId, userId));

    // Prepare response
    const response: {
      method: string;
      secret: string;
      qrCodeUrl?: string;
      message: string;
    } = {
      method,
      secret,
      message: 'Please verify the code to complete setup'
    };

    if (qrCodeUrl) {
      response.qrCodeUrl = qrCodeUrl;
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}