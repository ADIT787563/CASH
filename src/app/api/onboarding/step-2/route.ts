import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, whatsappSettings } from '@/db/schema';
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

        const { phoneNumberId, wabaId, accessToken } = body;

        if (!phoneNumberId || !wabaId || !accessToken) {
            return NextResponse.json({ error: 'Missing required WhatsApp credentials' }, { status: 400 });
        }

        // Upsert WhatsApp settings
        const existing = await db.select().from(whatsappSettings).where(eq(whatsappSettings.userId, userId)).limit(1);

        if (existing.length > 0) {
            await db.update(whatsappSettings).set({
                phoneNumberId,
                wabaId,
                accessToken,
                updatedAt: new Date().toISOString()
            }).where(eq(whatsappSettings.userId, userId));
        } else {
            await db.insert(whatsappSettings).values({
                userId,
                phoneNumberId,
                wabaId,
                accessToken,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        // Update user step to 3 (Complete)
        await db.update(user).set({ onboardingStep: 3 }).where(eq(user.id, userId));

        return NextResponse.json({ success: true, nextStep: 3 });

    } catch (error) {
        console.error('Error in onboarding step 2:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
