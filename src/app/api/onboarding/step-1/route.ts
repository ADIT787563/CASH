import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, businessProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const userId = session.user.id;
        const body = await request.json();

        // Basic validation
        if (!body.businessName || !body.phoneNumber) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Upsert business profile
        const existingProfile = await db.select().from(businessProfiles).where(eq(businessProfiles.userId, userId)).limit(1);

        if (existingProfile.length > 0) {
            await db.update(businessProfiles).set({
                ...body,
                updatedAt: new Date().toISOString()
            }).where(eq(businessProfiles.userId, userId));
        } else {
            await db.insert(businessProfiles).values({
                userId,
                ...body,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        // Update user step to 2
        await db.update(user).set({ onboardingStep: 2 }).where(eq(user.id, userId));

        return NextResponse.json({ success: true, nextStep: 2 });

    } catch (error) {
        console.error('Error in onboarding step 1:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
