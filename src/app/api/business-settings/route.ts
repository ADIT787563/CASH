import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { businessSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// Helper to get userId from headers (for testing/demo)
function getUserId(request: NextRequest): string {
  return request.headers.get('x-user-id') || 'demo-user-1';
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);

    const settings = await db.select()
      .from(businessSettings)
      .where(eq(businessSettings.userId, userId))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json({
        error: 'Business settings not found',
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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED"
      }, { status: 400 });
    }

    const {
      businessName,
      whatsappNumber,
      businessCategory,
      businessDescription,
      catalogUrl
    } = body;

    if (!businessName || typeof businessName !== 'string' || businessName.trim() === '') {
      return NextResponse.json({
        error: 'Business name is required and cannot be empty',
        code: 'MISSING_BUSINESS_NAME'
      }, { status: 400 });
    }

    if (!whatsappNumber || typeof whatsappNumber !== 'string' || whatsappNumber.trim() === '') {
      return NextResponse.json({
        error: 'WhatsApp number is required and cannot be empty',
        code: 'MISSING_WHATSAPP_NUMBER'
      }, { status: 400 });
    }

    const existingSettings = await db.select()
      .from(businessSettings)
      .where(eq(businessSettings.userId, user.id))
      .limit(1);

    if (existingSettings.length > 0) {
      return NextResponse.json({
        error: 'Settings already exist for this user',
        code: 'DUPLICATE_SETTINGS'
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    const newSettings = await db.insert(businessSettings)
      .values({
        userId: user.id,
        businessName: businessName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        businessCategory: businessCategory ? businessCategory.trim() : null,
        businessDescription: businessDescription ? businessDescription.trim() : null,
        catalogUrl: catalogUrl ? catalogUrl.trim() : null,
        maintenanceMode: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newSettings[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED"
      }, { status: 400 });
    }

    const existingSettings = await db.select()
      .from(businessSettings)
      .where(eq(businessSettings.userId, user.id))
      .limit(1);

    if (existingSettings.length === 0) {
      return NextResponse.json({
        error: 'Business settings not found',
        code: 'SETTINGS_NOT_FOUND'
      }, { status: 404 });
    }

    const {
      businessName,
      whatsappNumber,
      businessCategory,
      businessDescription,
      catalogUrl
    } = body;

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (businessName !== undefined) {
      if (typeof businessName !== 'string' || businessName.trim() === '') {
        return NextResponse.json({
          error: 'Business name cannot be empty',
          code: 'INVALID_BUSINESS_NAME'
        }, { status: 400 });
      }
      updates.businessName = businessName.trim();
    }

    if (whatsappNumber !== undefined) {
      if (typeof whatsappNumber !== 'string' || whatsappNumber.trim() === '') {
        return NextResponse.json({
          error: 'WhatsApp number cannot be empty',
          code: 'INVALID_WHATSAPP_NUMBER'
        }, { status: 400 });
      }
      updates.whatsappNumber = whatsappNumber.trim();
    }

    if (businessCategory !== undefined) {
      updates.businessCategory = businessCategory ? businessCategory.trim() : null;
    }

    if (businessDescription !== undefined) {
      updates.businessDescription = businessDescription ? businessDescription.trim() : null;
    }

    if (catalogUrl !== undefined) {
      updates.catalogUrl = catalogUrl ? catalogUrl.trim() : null;
    }

    const updated = await db.update(businessSettings)
      .set(updates)
      .where(eq(businessSettings.userId, user.id))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      }, { status: 401 });
    }

    const existingSettings = await db.select()
      .from(businessSettings)
      .where(eq(businessSettings.userId, user.id))
      .limit(1);

    if (existingSettings.length === 0) {
      return NextResponse.json({
        error: 'Business settings not found',
        code: 'SETTINGS_NOT_FOUND'
      }, { status: 404 });
    }

    const deleted = await db.delete(businessSettings)
      .where(eq(businessSettings.userId, user.id))
      .returning();

    return NextResponse.json({
      message: 'Business settings deleted successfully',
      deleted: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}