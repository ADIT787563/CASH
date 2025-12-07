import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { businessProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const VALID_CATEGORIES = [
  'Clothing',
  'Services',
  'Electronics',
  'Bakery',
  'Beauty',
  'Handicraft',
  'Others'
];

function validateEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}

function validatePhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  return phoneRegex.test(cleanPhone);
}

function validatePincode(pincode: string): boolean {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;

    const profile = await db.select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    return NextResponse.json(profile[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const {
      fullName,
      businessName,
      businessCategory,
      phoneNumber,
      businessEmail,
      street,
      city,
      state,
      pincode,
      gstNumber
    } = body;

    if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
      return NextResponse.json({ 
        error: "Full name is required and must be a non-empty string",
        code: "MISSING_FULL_NAME" 
      }, { status: 400 });
    }

    if (!businessName || typeof businessName !== 'string' || businessName.trim() === '') {
      return NextResponse.json({ 
        error: "Business name is required and must be a non-empty string",
        code: "MISSING_BUSINESS_NAME" 
      }, { status: 400 });
    }

    if (!businessCategory || typeof businessCategory !== 'string' || businessCategory.trim() === '') {
      return NextResponse.json({ 
        error: "Business category is required and must be a non-empty string",
        code: "MISSING_BUSINESS_CATEGORY" 
      }, { status: 400 });
    }

    if (!VALID_CATEGORIES.includes(businessCategory)) {
      return NextResponse.json({ 
        error: `Business category must be one of: ${VALID_CATEGORIES.join(', ')}`,
        code: "INVALID_BUSINESS_CATEGORY" 
      }, { status: 400 });
    }

    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
      return NextResponse.json({ 
        error: "Phone number is required and must be a non-empty string",
        code: "MISSING_PHONE_NUMBER" 
      }, { status: 400 });
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return NextResponse.json({ 
        error: "Phone number must be a valid 10-digit number with optional +91 prefix",
        code: "INVALID_PHONE_NUMBER" 
      }, { status: 400 });
    }

    if (!businessEmail || typeof businessEmail !== 'string' || businessEmail.trim() === '') {
      return NextResponse.json({ 
        error: "Business email is required and must be a non-empty string",
        code: "MISSING_BUSINESS_EMAIL" 
      }, { status: 400 });
    }

    if (!validateEmail(businessEmail)) {
      return NextResponse.json({ 
        error: "Business email must be a valid email address",
        code: "INVALID_BUSINESS_EMAIL" 
      }, { status: 400 });
    }

    if (!street || typeof street !== 'string' || street.trim() === '') {
      return NextResponse.json({ 
        error: "Street is required and must be a non-empty string",
        code: "MISSING_STREET" 
      }, { status: 400 });
    }

    if (!city || typeof city !== 'string' || city.trim() === '') {
      return NextResponse.json({ 
        error: "City is required and must be a non-empty string",
        code: "MISSING_CITY" 
      }, { status: 400 });
    }

    if (!state || typeof state !== 'string' || state.trim() === '') {
      return NextResponse.json({ 
        error: "State is required and must be a non-empty string",
        code: "MISSING_STATE" 
      }, { status: 400 });
    }

    if (!pincode || typeof pincode !== 'string' || pincode.trim() === '') {
      return NextResponse.json({ 
        error: "Pincode is required and must be a non-empty string",
        code: "MISSING_PINCODE" 
      }, { status: 400 });
    }

    if (!validatePincode(pincode)) {
      return NextResponse.json({ 
        error: "Pincode must be a 6-digit number",
        code: "INVALID_PINCODE" 
      }, { status: 400 });
    }

    const sanitizedData = {
      fullName: fullName.trim(),
      businessName: businessName.trim(),
      businessCategory: businessCategory.trim(),
      phoneNumber: phoneNumber.trim(),
      businessEmail: businessEmail.trim().toLowerCase(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      gstNumber: gstNumber ? gstNumber.trim() : null,
      isComplete: true
    };

    const existingProfile = await db.select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .limit(1);

    if (existingProfile.length > 0) {
      const updated = await db.update(businessProfiles)
        .set({
          ...sanitizedData,
          updatedAt: new Date().toISOString()
        })
        .where(eq(businessProfiles.userId, userId))
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    } else {
      const created = await db.insert(businessProfiles)
        .values({
          userId,
          ...sanitizedData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();

      return NextResponse.json(created[0], { status: 201 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}