import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamInvites, user } from '@/db/schema';
import { requirePermission } from '@/lib/rbac';
import { ROLES, Role } from '@/lib/roles';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Team Invite API
 * POST /api/team/invite
 * 
 * Allows Owner and Admin to invite new team members
 */

export const POST = requirePermission('MANAGE_TEAM')(async (request: NextRequest, currentUser) => {
    try {
        const body = await request.json();
        const { email, role } = body;

        // Validate inputs
        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Valid email is required' },
                { status: 400 }
            );
        }

        if (!role || typeof role !== 'string') {
            return NextResponse.json(
                { error: 'Valid role is required' },
                { status: 400 }
            );
        }

        // Validate role (cannot invite as owner)
        const validRoles: Role[] = [ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER];
        if (!validRoles.includes(role as Role)) {
            return NextResponse.json(
                {
                    error: 'Invalid role',
                    message: 'You can only invite users as: admin, manager, agent, or viewer'
                },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.email, email.toLowerCase()))
            .limit(1);

        if (existingUser.length > 0) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Check if there's already a pending invite
        const existingInvite = await db
            .select()
            .from(teamInvites)
            .where(eq(teamInvites.email, email.toLowerCase()))
            .limit(1);

        if (existingInvite.length > 0 && existingInvite[0].status === 'pending') {
            return NextResponse.json(
                { error: 'An invite for this email is already pending' },
                { status: 409 }
            );
        }

        // Generate unique invite token
        const token = crypto.randomUUID();
        const now = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Create invite
        const [invite] = await db
            .insert(teamInvites)
            .values({
                email: email.toLowerCase(),
                role: role as Role,
                businessId: currentUser.id,
                token,
                status: 'pending',
                expiresAt,
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        // TODO: Send invitation email
        // For now, we'll return the invite link
        const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/accept-invite?token=${token}`;

        console.log(`📧 Team invite created for ${email} as ${role}`);
        console.log(`🔗 Invite URL: ${inviteUrl}`);

        return NextResponse.json({
            success: true,
            invite: {
                id: invite.id,
                email: invite.email,
                role: invite.role,
                token: invite.token,
                expiresAt: invite.expiresAt,
                inviteUrl,
            },
            message: 'Team member invited successfully',
        }, { status: 201 });

    } catch (error) {
        console.error('❌ Team invite error:', error);
        return NextResponse.json(
            {
                error: 'Failed to create invite',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
});
