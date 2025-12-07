import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analyticsSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Fetch analytics settings for user
    const settings = await db.select()
      .from(analyticsSettings)
      .where(eq(analyticsSettings.userId, session.user.id))
      .limit(1);

    if (settings.length === 0 || !settings[0].webhookUrl) {
      return NextResponse.json({ 
        error: 'Webhook URL not configured',
        code: 'WEBHOOK_URL_NOT_CONFIGURED'
      }, { status: 400 });
    }

    const webhookUrl = settings[0].webhookUrl;
    const webhookSecret = settings[0].webhookSecret;

    // Create test payload
    const testPayload = {
      event: 'test',
      message: 'This is a test webhook from your analytics settings',
      timestamp: new Date().toISOString(),
      userId: session.user.id
    };

    // Prepare headers for webhook request
    const webhookHeaders: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (webhookSecret) {
      webhookHeaders['X-Webhook-Secret'] = webhookSecret;
    }

    // Send webhook request with 10 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: webhookHeaders,
        body: JSON.stringify(testPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return NextResponse.json({ 
          success: true, 
          status: response.status,
          message: 'Webhook test successful'
        }, { status: 200 });
      } else {
        const errorText = await response.text().catch(() => 'No error details available');
        return NextResponse.json({ 
          success: false, 
          error: `Webhook returned status ${response.status}: ${errorText}`
        }, { status: 200 });
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({ 
          success: false, 
          error: 'Webhook request timed out after 10 seconds'
        }, { status: 200 });
      }

      return NextResponse.json({ 
        success: false, 
        error: `Failed to send webhook: ${fetchError.message}`
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}