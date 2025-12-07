import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { whatsappSettings } from '@/db/schema';
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
            return NextResponse.json(
                { error: 'Phone Number ID, WABA ID, and Access Token are required' },
                { status: 400 }
            );
        }

        // Check if settings already exist
        const existing = await db
            .select()
            .from(whatsappSettings)
            .where(eq(whatsappSettings.userId, userId))
            .limit(1);

        if (existing.length > 0) {
            // Update existing
            await db
                .update(whatsappSettings)
                .set({
                    phoneNumberId,
                    wabaId,
                    accessToken,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(whatsappSettings.userId, userId));
        } else {
            // Insert new
            await db.insert(whatsappSettings).values({
                userId,
                phoneNumberId,
                wabaId,
                accessToken,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        return NextResponse.json({
            success: true,
            message: 'WhatsApp settings saved successfully'
        });

    } catch (error: any) {
        console.error('Error saving WhatsApp settings:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
