import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, messages } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Inbox Messages API
 * GET /api/inbox/messages/[customerId]
 * 
 * Get chat history for a specific customer
 */

export async function GET(
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

        // Verify customer belongs to user
        const [customer] = await db
            .select()
            .from(customers)
            .where(
                and(
                    eq(customers.id, customerId),
                    eq(customers.userId, user.id)
                )
            )
            .limit(1);

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        // Fetch messages
        const chatMessages = await db
            .select()
            .from(messages)
            .where(
                and(
                    eq(messages.customerId, customerId),
                    eq(messages.userId, user.id)
                )
            )
            .orderBy(desc(messages.timestamp));

        return NextResponse.json({
            customer,
            messages: chatMessages.reverse(), // Oldest first for chat display
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}
