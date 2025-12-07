import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatbotSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Helper to get current authenticated user
async function getCurrentUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user || null;
}

// Helper to get userId from headers (for testing/demo)
function getUserId(request: NextRequest): string {
  return request.headers.get('x-user-id') || 'demo-user-1';
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);

    const settings = await db
      .select()
      .from(chatbotSettings)
      .where(eq(chatbotSettings.userId, userId))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json(
        { error: 'Settings not found for this user', code: 'SETTINGS_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(settings[0], { status: 200 });
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
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
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

    // Check if settings already exist for this user
    const existingSettings = await db
      .select()
      .from(chatbotSettings)
      .where(eq(chatbotSettings.userId, user.id))
      .limit(1);

    if (existingSettings.length > 0) {
      return NextResponse.json(
        {
          error: 'Settings already exist for this user',
          code: 'SETTINGS_ALREADY_EXIST',
        },
        { status: 400 }
      );
    }

    const {
      enabled = true,
      autoReply = true,
      language = 'en',
      tone = 'friendly',
      typingDelay = 2,
      businessHoursOnly = false,
      welcomeMessage,
      awayMessage,
    } = body;

    // Validate language
    const validLanguages = ['en', 'hi', 'te', 'ta', 'bn', 'mr', 'gu'];
    if (language && !validLanguages.includes(language)) {
      return NextResponse.json(
        {
          error: 'Invalid language. Must be one of: en, hi, te, ta, bn, mr, gu',
          code: 'INVALID_LANGUAGE',
        },
        { status: 400 }
      );
    }

    // Validate tone
    const validTones = ['professional', 'friendly', 'offer'];
    if (tone && !validTones.includes(tone)) {
      return NextResponse.json(
        {
          error: 'Invalid tone. Must be one of: professional, friendly, offer',
          code: 'INVALID_TONE',
        },
        { status: 400 }
      );
    }

    // Validate typingDelay
    if (typingDelay && (typeof typingDelay !== 'number' || typingDelay < 0)) {
      return NextResponse.json(
        {
          error: 'Typing delay must be a non-negative number',
          code: 'INVALID_TYPING_DELAY',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newSettings = await db
      .insert(chatbotSettings)
      .values({
        userId: user.id,
        enabled: enabled ?? true,
        autoReply: autoReply ?? true,
        language: language ?? 'en',
        tone: tone ?? 'friendly',
        typingDelay: typingDelay ?? 2,
        businessHoursOnly: businessHoursOnly ?? false,
        welcomeMessage: welcomeMessage ?? null,
        awayMessage: awayMessage ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newSettings[0], { status: 201 });
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
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
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

    // Check if settings exist for this user
    const existingSettings = await db
      .select()
      .from(chatbotSettings)
      .where(eq(chatbotSettings.userId, user.id))
      .limit(1);

    if (existingSettings.length === 0) {
      return NextResponse.json(
        { error: 'Settings not found for this user', code: 'SETTINGS_NOT_FOUND' },
        { status: 404 }
      );
    }

    const {
      enabled,
      autoReply,
      language,
      tone,
      typingDelay,
      businessHoursOnly,
      welcomeMessage,
      awayMessage,
    } = body;

    // Validate language if provided
    if (language) {
      const validLanguages = ['en', 'hi', 'te', 'ta', 'bn', 'mr', 'gu'];
      if (!validLanguages.includes(language)) {
        return NextResponse.json(
          {
            error: 'Invalid language. Must be one of: en, hi, te, ta, bn, mr, gu',
            code: 'INVALID_LANGUAGE',
          },
          { status: 400 }
        );
      }
    }

    // Validate tone if provided
    if (tone) {
      const validTones = ['professional', 'friendly', 'offer'];
      if (!validTones.includes(tone)) {
        return NextResponse.json(
          {
            error: 'Invalid tone. Must be one of: professional, friendly, offer',
            code: 'INVALID_TONE',
          },
          { status: 400 }
        );
      }
    }

    // Validate typingDelay if provided
    if (typingDelay !== undefined && (typeof typingDelay !== 'number' || typingDelay < 0)) {
      return NextResponse.json(
        {
          error: 'Typing delay must be a non-negative number',
          code: 'INVALID_TYPING_DELAY',
        },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (enabled !== undefined) updateData.enabled = enabled;
    if (autoReply !== undefined) updateData.autoReply = autoReply;
    if (language !== undefined) updateData.language = language;
    if (tone !== undefined) updateData.tone = tone;
    if (typingDelay !== undefined) updateData.typingDelay = typingDelay;
    if (businessHoursOnly !== undefined) updateData.businessHoursOnly = businessHoursOnly;
    if (welcomeMessage !== undefined) updateData.welcomeMessage = welcomeMessage;
    if (awayMessage !== undefined) updateData.awayMessage = awayMessage;

    const updated = await db
      .update(chatbotSettings)
      .set(updateData)
      .where(eq(chatbotSettings.userId, user.id))
      .returning();

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
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Check if settings exist for this user
    const existingSettings = await db
      .select()
      .from(chatbotSettings)
      .where(eq(chatbotSettings.userId, user.id))
      .limit(1);

    if (existingSettings.length === 0) {
      return NextResponse.json(
        { error: 'Settings not found for this user', code: 'SETTINGS_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(chatbotSettings)
      .where(eq(chatbotSettings.userId, user.id))
      .returning();

    return NextResponse.json(
      {
        message: 'Settings deleted successfully',
        deletedSettings: deleted[0],
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