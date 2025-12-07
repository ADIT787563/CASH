import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

/**
 * Mark Conversation as Read API
 * PATCH /api/inbox/read/[customerId]
 * 
 * Mark all messages in a conversation as read
 */

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ customerId: string }> }
) {
    try {
        const params = await props.params;
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const customerId = parseInt(params.customerId);

        // Update unread count to 0
        await db
            .update(customers)
            .set({
                unreadCount: 0,
                updatedAt: new Date().toISOString(),
            })
            .where(
                and(
                    eq(customers.id, customerId),
                    eq(customers.userId, user.id)
                )
            );

        return NextResponse.json({
            success: true,
            unreadCount: 0,
        });
    } catch (error) {
        console.error('Error marking as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark as read' },
            { status: 500 }
        );
    }
}
