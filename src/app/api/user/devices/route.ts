import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userDevices } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { deviceId, deviceName } = body;

        if (!deviceId) {
            return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
        }

        const userId = session.user.id;
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Check if device exists for user
        const existing = await db.select().from(userDevices).where(
            and(
                eq(userDevices.userId, userId),
                eq(userDevices.deviceId, deviceId)
            )
        ).limit(1);

        if (existing.length > 0) {
            await db.update(userDevices).set({
                lastLoginAt: new Date(),
                ipAddress: ip,
                userAgent: userAgent,
                deviceName: deviceName || existing[0].deviceName // Update name if provided, else keep old
            }).where(eq(userDevices.id, existing[0].id));
        } else {
            await db.insert(userDevices).values({
                userId,
                deviceId,
                deviceName: deviceName || 'Unknown Device',
                userAgent,
                ipAddress: ip,
                lastLoginAt: new Date()
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking device:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
