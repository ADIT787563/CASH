import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamInvites, user, teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';


/**
 * Accept Team Invite API
 * POST /api/team/accept
 * 
 * Validates invite token and creates user account with assigned role
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, name, password } = body;

        // Validate inputs
        if (!token || typeof token !== 'string') {
            return NextResponse.json(
                { error: 'Valid invite token is required' },
                { status: 400 }
            );
        }

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        if (!password || typeof password !== 'string' || password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Find invite by token
        const [invite] = await db
            .select()
            .from(teamInvites)
            .where(eq(teamInvites.token, token))
            .limit(1);

        if (!invite) {
            return NextResponse.json(
                { error: 'Invalid invite token' },
                { status: 404 }
            );
        }

        // Check if invite is expired
        const now = new Date();
        if (new Date(invite.expiresAt) < now) {
            // Update invite status to expired
            await db
                .update(teamInvites)
                .set({ status: 'expired', updatedAt: now.toISOString() })
                .where(eq(teamInvites.id, invite.id));

            return NextResponse.json(
                { error: 'Invite has expired' },
                { status: 410 }
            );
        }

        // Check if invite is already accepted
        if (invite.status === 'accepted') {
            return NextResponse.json(
                { error: 'Invite has already been accepted' },
                { status: 409 }
            );
        }

        // Check if user already exists
        const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.email, invite.email))
            .limit(1);

        if (existingUser.length > 0) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Note: User creation should be handled by better-auth signup
        // This endpoint is for validation and returning invite details
        // The actual user creation will happen through the auth system

        // For now, return invite details for the signup form
        return NextResponse.json({
            success: true,
            invite: {
                email: invite.email,
                role: invite.role,
                businessId: invite.businessId,
            },
            message: 'Invite is valid. Please complete signup.',
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Accept invite error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process invite',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/team/accept?token=xxx
 * 
 * Validate and get invite details
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Invite token is required' },
                { status: 400 }
            );
        }

        // Find invite by token
        const [invite] = await db
            .select()
            .from(teamInvites)
            .where(eq(teamInvites.token, token))
            .limit(1);

        if (!invite) {
            return NextResponse.json(
                { error: 'Invalid invite token' },
                { status: 404 }
            );
        }

        // Check if invite is expired
        const now = new Date();
        if (new Date(invite.expiresAt) < now) {
            return NextResponse.json(
                { error: 'Invite has expired' },
                { status: 410 }
            );
        }

        // Check if invite is already accepted
        if (invite.status === 'accepted') {
            return NextResponse.json(
                { error: 'Invite has already been accepted' },
                { status: 409 }
            );
        }

        // Get business owner details
        const [owner] = await db
            .select({ name: user.name, email: user.email })
            .from(user)
            .where(eq(user.id, invite.businessId))
            .limit(1);

        return NextResponse.json({
            success: true,
            invite: {
                email: invite.email,
                role: invite.role,
                businessOwner: owner?.name || 'Unknown',
                expiresAt: invite.expiresAt,
            },
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Get invite error:', error);
        return NextResponse.json(
            {
                error: 'Failed to get invite details',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
