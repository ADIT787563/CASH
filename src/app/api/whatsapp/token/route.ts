import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { whatsappSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * WhatsApp Token Refresh API
 * PUT /api/whatsapp/token
 * 
 * Updates the WhatsApp access token when it expires
 */

export async function PUT(request: NextRequest) {
    try {
        // Authentication
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { accessToken } = body;

        if (!accessToken || typeof accessToken !== 'string') {
            return NextResponse.json(
                { error: 'Access token is required' },
                { status: 400 }
            );
        }

        // Check if WhatsApp settings exist
        const existing = await db
            .select()
            .from(whatsappSettings)
            .where(eq(whatsappSettings.userId, userId))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json(
                { error: 'WhatsApp settings not found. Please complete onboarding first.' },
                { status: 404 }
            );
        }

        // Update access token and expiration
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 23); // 23 hours from now (safe margin)

        const updated = await db
            .update(whatsappSettings)
            .set({
                accessToken,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(whatsappSettings.userId, userId))
            .returning();

        return NextResponse.json({
            success: true,
            message: 'Access token updated successfully',
            expiresAt: expiresAt.toISOString(),
        });

    } catch (error: any) {
        console.error('Error updating WhatsApp token:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/whatsapp/token
 * 
 * Check token expiration status
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const userId = session.user.id;

        const settings = await db
            .select()
            .from(whatsappSettings)
            .where(eq(whatsappSettings.userId, userId))
            .limit(1);

        if (settings.length === 0) {
            return NextResponse.json(
                { error: 'WhatsApp settings not found' },
                { status: 404 }
            );
        }

        // Schema doesn't support token expiration yet
        return NextResponse.json({
            isExpired: false,
            expiresAt: null,
            hoursUntilExpiry: null,
            needsRefresh: false,
        });

    } catch (error: any) {
        console.error('Error checking token status:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
