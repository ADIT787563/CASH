import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembers, user } from '@/db/schema';
import { requirePermission, canManageUser } from '@/lib/rbac';
import { eq, and } from 'drizzle-orm';

/**
 * Remove Team Member API
 * DELETE /api/team/remove
 * 
 * Allows Owner to remove any member, Admin to remove non-owner members
 */

export const DELETE = requirePermission('MANAGE_TEAM')(async (request: NextRequest, currentUser) => {
    try {
        const { searchParams } = new URL(request.url);
        const memberUserId = searchParams.get('userId');

        if (!memberUserId) {
            return NextResponse.json(
                { error: 'Member user ID is required' },
                { status: 400 }
            );
        }

        // Get the target user's role
        const [targetUser] = await db
            .select()
            .from(user)
            .where(eq(user.id, memberUserId))
            .limit(1);

        if (!targetUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if current user can manage the target user
        if (!canManageUser(currentUser.role, targetUser.role as any)) {
            return NextResponse.json(
                {
                    error: 'Permission denied',
                    message: 'You cannot remove this user'
                },
                { status: 403 }
            );
        }

        // Prevent removing yourself
        if (memberUserId === currentUser.id) {
            return NextResponse.json(
                { error: 'You cannot remove yourself' },
                { status: 400 }
            );
        }

        // Remove from team members table
        await db
            .delete(teamMembers)
            .where(
                and(
                    eq(teamMembers.userId, currentUser.id),
                    eq(teamMembers.memberUserId, memberUserId)
                )
            );

        // Note: We're not deleting the user account itself
        // Just removing them from the team
        // If you want to delete the user account, uncomment below:
        // await db.delete(user).where(eq(user.id, memberUserId));

        console.log(`🗑️ Team member ${targetUser.email} removed by ${currentUser.email}`);

        return NextResponse.json({
            success: true,
            message: 'Team member removed successfully',
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Remove team member error:', error);
        return NextResponse.json(
            {
                error: 'Failed to remove team member',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
});
