import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, businessProfiles, whatsappSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const userId = session.user.id;

        // Fetch user to get current step
        const [userData] = await db.select({
            onboardingStep: user.onboardingStep
        }).from(user).where(eq(user.id, userId));

        // Fetch business profile if it exists
        const [profile] = await db.select().from(businessProfiles).where(eq(businessProfiles.userId, userId));

        // Fetch whatsapp settings if they exist
        const [whatsapp] = await db.select().from(whatsappSettings).where(eq(whatsappSettings.userId, userId));

        return NextResponse.json({
            currentStep: userData?.onboardingStep || 1,
            profile: profile || null,
            whatsapp: whatsapp || null
        });

    } catch (error) {
        console.error('Error fetching onboarding state:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
