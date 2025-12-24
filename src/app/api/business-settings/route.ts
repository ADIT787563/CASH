import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { businessSettings, businessProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// Helper to get userId from headers (for testing/demo)
function getUserId(request: NextRequest): string {
  return request.headers.get('x-user-id') || 'demo-user-1';
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch both settings and profile
    const [settings] = await db.select()
      .from(businessSettings)
      .where(eq(businessSettings.userId, user.id))
      .limit(1);

    const [profile] = await db.select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, user.id))
      .limit(1);

    if (!settings && !profile) {
      // Return empty default state instead of 404 to allow form to load
      return NextResponse.json({}, { status: 200 });
    }

    // Merge data with profile fallback
    const mergedData = {
      ...(settings || {}),
      // Fallback to profile data if settings are empty
      businessName: settings?.businessName || profile?.businessName || "",
      whatsappNumber: settings?.whatsappNumber || profile?.phoneNumber || "",

      // Profile specific fields
      gstin: profile?.gstNumber || null,
      address: profile?.street || null,
      businessEmail: profile?.businessEmail || null,
    };

    return NextResponse.json(mergedData, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
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

    const {
      businessName,
      whatsappNumber,
      businessCategory,
      businessDescription,
      catalogUrl,
      businessHours,
      themeConfig,
      gstin,
      address,
      logoUrl,
      logoUrlDark
    } = body;

    const now = new Date().toISOString();

    // 1. Upsert businessSettings
    const [existingSettings] = await db.select()
      .from(businessSettings)
      .where(eq(businessSettings.userId, user.id))
      .limit(1);

    const settingsValues = {
      businessName: businessName?.trim() || "My Business",
      whatsappNumber: whatsappNumber?.trim() || "",
      businessCategory: businessCategory?.trim() || null,
      businessDescription: businessDescription?.trim() || null,
      catalogUrl: catalogUrl?.trim() || null,
      businessHours: businessHours ? (typeof businessHours === 'string' ? businessHours : JSON.stringify(businessHours)) : null,
      themeConfig: themeConfig ? (typeof themeConfig === 'string' ? themeConfig : JSON.stringify(themeConfig)) : null,
      logoUrl: logoUrl?.trim() || null,
      logoUrlDark: logoUrlDark?.trim() || null,
      upiId: body.upiId?.trim() || null,
      merchantName: body.merchantName?.trim() || null,
      // Advanced Controls
      confirmationMode: body.confirmationMode || 'auto_confirm',
      partialPaymentAllowed: body.partialPaymentAllowed ?? false,
      refundPolicy: body.refundPolicy || 'no_refunds',
      refundPolicyCustomText: body.refundPolicyCustomText || null,
      codTemplate: body.codTemplate || null,
      updatedAt: now,
    };

    if (existingSettings) {
      await db.update(businessSettings)
        .set(settingsValues)
        .where(eq(businessSettings.userId, user.id));
    } else {
      await db.insert(businessSettings).values({
        userId: user.id,
        ...settingsValues,
        createdAt: now,
      });
    }

    // 2. Upsert businessProfiles (for GST/Address)
    const [existingProfile] = await db.select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, user.id))
      .limit(1);

    const profileValues = {
      fullName: user.name || "Business Owner", // Required field fallback
      businessName: businessName?.trim() || "My Business",
      businessCategory: businessCategory?.trim() || "General",
      phoneNumber: whatsappNumber?.trim() || "",
      businessEmail: user.email || "",
      street: address?.trim() || "",
      city: "Unknown", // Required in schema but not in form
      state: "Unknown", // Required in schema but not in form
      pincode: "000000", // Required in schema but not in form
      gstNumber: gstin?.trim() || null,
      updatedAt: now,
    };

    if (existingProfile) {
      await db.update(businessProfiles)
        .set(profileValues)
        .where(eq(businessProfiles.userId, user.id));
    } else {
      await db.insert(businessProfiles).values({
        userId: user.id,
        ...profileValues,
        createdAt: now,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });

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