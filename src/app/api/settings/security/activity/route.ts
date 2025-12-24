import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { loginActivity } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const activity = await db.select()
            .from(loginActivity)
            .where(eq(loginActivity.userId, user.id))
            .orderBy(desc(loginActivity.timestamp))
            .limit(10);

        // Mock if empty
        if (activity.length === 0) {
            return NextResponse.json([
                {
                    id: 1,
                    ipAddress: '127.0.0.1',
                    device: 'Windows 11',
                    browser: 'Chrome',
                    location: 'Localhost',
                    timestamp: new Date().toISOString()
                }
            ]);
        }

        return NextResponse.json(activity);
    } catch (error) {
        console.error('Fetch Login Activity Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
