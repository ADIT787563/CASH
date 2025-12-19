import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { businesses, user } from '@/db/schema';
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

        // Mark onboarding as complete
        await db.transaction(async (tx) => {
            // 1. Mark Business as Onboarding Completed
            await tx.update(businesses)
                .set({ onboardingCompleted: true, updatedAt: new Date().toISOString() })
                .where(eq(businesses.ownerId, userId));

            // 2. Mark User as fully onboarded (Step 5)
            await tx.update(user)
                .set({ onboardingStep: 5, updatedAt: new Date() })
                .where(eq(user.id, userId));
        });

        return NextResponse.json({ success: true, redirectTo: '/dashboard' });

    } catch (error) {
        console.error('Error completing onboarding:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
