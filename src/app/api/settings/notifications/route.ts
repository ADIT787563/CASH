import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notificationPreferences } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const prefs = await db.select()
            .from(notificationPreferences)
            .where(eq(notificationPreferences.userId, user.id));

        return NextResponse.json(prefs);
    } catch (error) {
        console.error('Fetch Notification Prefs Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, channel, enabled } = await request.json();

        if (!type || !channel || enabled === undefined) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Upsert preference
        const existing = await db.select()
            .from(notificationPreferences)
            .where(
                and(
                    eq(notificationPreferences.userId, user.id),
                    eq(notificationPreferences.type, type),
                    eq(notificationPreferences.channel, channel)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            await db.update(notificationPreferences)
                .set({ enabled, updatedAt: new Date().toISOString() })
                .where(eq(notificationPreferences.id, existing[0].id));
        } else {
            await db.insert(notificationPreferences)
                .values({
                    userId: user.id,
                    type,
                    channel,
                    enabled,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update Notification Prefs Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
