import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { catalogSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const VALID_TEMPLATES = ['modern', 'classic', 'minimal', 'luxury'] as const;

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const settings = await db.select()
      .from(catalogSettings)
      .where(eq(catalogSettings.userId, session.user.id))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json({ 
        error: 'Catalog settings not found',
        code: 'SETTINGS_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json(settings[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const existingSettings = await db.select()
      .from(catalogSettings)
      .where(eq(catalogSettings.userId, session.user.id))
      .limit(1);

    if (existingSettings.length === 0) {
      return NextResponse.json({ 
        error: 'Catalog settings not found',
        code: 'SETTINGS_NOT_FOUND'
      }, { status: 404 });
    }

    const {
      defaultTemplate,
      autoUpdate,
      pdfDownloadEnabled,
      utmSource,
      utmMedium,
      utmCampaign
    } = body;

    if (defaultTemplate !== undefined && !VALID_TEMPLATES.includes(defaultTemplate)) {
      return NextResponse.json({ 
        error: `Invalid template. Must be one of: ${VALID_TEMPLATES.join(', ')}`,
        code: 'INVALID_TEMPLATE'
      }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (defaultTemplate !== undefined) updates.defaultTemplate = defaultTemplate;
    if (autoUpdate !== undefined) updates.autoUpdate = autoUpdate;
    if (pdfDownloadEnabled !== undefined) updates.pdfDownloadEnabled = pdfDownloadEnabled;
    if (utmSource !== undefined) updates.utmSource = utmSource;
    if (utmMedium !== undefined) updates.utmMedium = utmMedium;
    if (utmCampaign !== undefined) updates.utmCampaign = utmCampaign;

    const updated = await db.update(catalogSettings)
      .set(updates)
      .where(eq(catalogSettings.userId, session.user.id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update catalog settings',
        code: 'UPDATE_FAILED'
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}