import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { businessProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const VALID_CATEGORIES = ['Clothing', 'Services', 'Electronics', 'Bakery', 'Beauty', 'Handicraft', 'Others'];

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

function validatePincode(pincode: string): boolean {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
}

export async function PATCH(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;

    // Parse request body
    const body = await request.json();

    // SECURITY: Reject if userId or user_id is provided in request body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: "User ID cannot be provided in request body",
          code: "USER_ID_NOT_ALLOWED"
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};

    // Validate and sanitize provided fields
    if (body.fullName !== undefined) {
      updateData.fullName = body.fullName.trim();
    }

    if (body.businessName !== undefined) {
      updateData.businessName = body.businessName.trim();
    }

    if (body.businessCategory !== undefined) {
      const category = body.businessCategory.trim();
      if (!VALID_CATEGORIES.includes(category)) {
        return NextResponse.json(
          {
            error: `Invalid business category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
            code: "INVALID_CATEGORY"
          },
          { status: 400 }
        );
      }
      updateData.businessCategory = category;
    }

    if (body.phoneNumber !== undefined) {
      const phone = body.phoneNumber.trim();
      if (phone && !validatePhoneNumber(phone)) {
        return NextResponse.json(
          {
            error: "Invalid phone number. Must be 10 digits with optional +91 prefix",
            code: "INVALID_PHONE"
          },
          { status: 400 }
        );
      }
      updateData.phoneNumber = phone;
    }

    if (body.businessEmail !== undefined) {
      const email = body.businessEmail.trim().toLowerCase();
      if (email && !validateEmail(email)) {
        return NextResponse.json(
          {
            error: "Invalid email format",
            code: "INVALID_EMAIL"
          },
          { status: 400 }
        );
      }
      updateData.businessEmail = email;
    }

    if (body.street !== undefined) {
      updateData.street = body.street.trim();
    }

    if (body.city !== undefined) {
      updateData.city = body.city.trim();
    }

    if (body.state !== undefined) {
      updateData.state = body.state.trim();
    }

    if (body.pincode !== undefined) {
      const pincode = body.pincode.trim();
      if (pincode && !validatePincode(pincode)) {
        return NextResponse.json(
          {
            error: "Invalid pincode. Must be 6 digits",
            code: "INVALID_PINCODE"
          },
          { status: 400 }
        );
      }
      updateData.pincode = pincode;
    }

    if (body.gstNumber !== undefined) {
      updateData.gstNumber = body.gstNumber.trim();
    }

    // Always update timestamp
    updateData.updatedAt = new Date().toISOString();

    // Check if profile exists for this user
    const existingProfile = await db.select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .limit(1);

    if (existingProfile.length > 0) {
      // UPDATE existing profile - only update provided fields, preserve isComplete
      const updated = await db.update(businessProfiles)
        .set(updateData)
        .where(eq(businessProfiles.userId, userId))
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    } else {
      // INSERT new profile with partial data
      const insertData = {
        userId,
        isComplete: false,
        createdAt: new Date().toISOString(),
        fullName: updateData.fullName ?? null,
        businessName: updateData.businessName ?? null,
        businessCategory: updateData.businessCategory ?? null,
        phoneNumber: updateData.phoneNumber ?? null,
        businessEmail: updateData.businessEmail ?? null,
        street: updateData.street ?? null,
        city: updateData.city ?? null,
        state: updateData.state ?? null,
        pincode: updateData.pincode ?? null,
        gstNumber: updateData.gstNumber ?? null,
        updatedAt: new Date().toISOString(),
      };

      const newProfile = await db.insert(businessProfiles)
        .values(insertData)
        .returning();

      return NextResponse.json(newProfile[0], { status: 200 });
    }

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}