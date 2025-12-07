import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth'; // Assuming auth helper exists, or I'll use headers
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await db
            .select()
            .from(paymentSettings)
            .where(eq(paymentSettings.userId, session.user.id))
            .limit(1);

        if (!settings.length) {
            // Return default settings
            return NextResponse.json({
                upiEnabled: false,
                codEnabled: true,
                razorpayEnabled: false,
            });
        }

        return NextResponse.json(settings[0]);
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Basic validation could go here

        const existing = await db
            .select()
            .from(paymentSettings)
            .where(eq(paymentSettings.userId, session.user.id))
            .limit(1);

        if (existing.length > 0) {
            await db
                .update(paymentSettings)
                .set({
                    ...body,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(paymentSettings.userId, session.user.id));
        } else {
            await db.insert(paymentSettings).values({
                userId: session.user.id,
                ...body,
                updatedAt: new Date().toISOString(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating payment settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
