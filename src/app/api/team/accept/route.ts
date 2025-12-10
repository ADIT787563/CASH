import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamInvites, user, teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';


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

        // Create User using Better Auth
        // We use the internal API to handle hashing and session creation logic if possible
        // Or we replicate the insertion. Since we need to trigger 'signUpEmail', let's try calling it.
        // However, better-auth server-side calls might require passing headers or a mock request context.
        // A simpler way for "Do it" MVP might be to trust the library's method.

        let newUser;
        try {
            // Attempt to create user via better-auth
            // Note: This relies on better-auth server API signature.
            // If this fails (e.g. requires request context), we might need a workaround.
            const signUpResponse = await auth.api.signUpEmail({
                body: {
                    email: invite.email,
                    password: password,
                    name: name,
                }
            });

            if (!signUpResponse?.user) {
                throw new Error("Failed to create user via auth provider");
            }
            newUser = signUpResponse.user;

        } catch (e) {
            console.error("Auth Signup Error:", e);
            return NextResponse.json({ error: 'Failed to create user account. Please try standard signup.' }, { status: 500 });
        }

        // Link to Team (Create Team Member)
        // Check if member already exists (shouldn't if user didn't exist, but good to check)

        // Mark invite as accepted
        await db.update(teamInvites)
            .set({ status: 'accepted', updatedAt: new Date().toISOString() })
            .where(eq(teamInvites.id, invite.id));

        // Add to Team Members table (linking new user to the business owner)
        await db.insert(teamMembers).values({
            userId: invite.businessId, // The Business Owner
            memberUserId: extractUserId(newUser), // The New Team Member
            inviteId: invite.id,
            email: invite.email,
            name: name,
            role: invite.role,
            status: 'active',
            invitedAt: invite.createdAt || new Date().toISOString(), // Fallback
            acceptedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Add BusinessId to team_members if the schema calls for it. 
        // We need to look at `teamMembers` schema again in DB.

        return NextResponse.json({
            success: true,
            user: newUser,
            message: 'Invite accepted and account created.',
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

function extractUserId(userObj: any): string {
    return userObj.id || userObj.user.id;
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
