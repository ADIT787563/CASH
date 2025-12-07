import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
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

        // Mark onboarding as complete (step 3)
        await db.update(user).set({ onboardingStep: 3 }).where(eq(user.id, userId));

        return NextResponse.json({ success: true, redirectTo: '/dashboard' });

    } catch (error) {
        console.error('Error completing onboarding:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
