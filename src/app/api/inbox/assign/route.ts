import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, conversationAssignments } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { logUserAction } from '@/lib/audit-logger';

/**
 * Assign Conversation API
 * POST /api/inbox/assign
 * 
 * Assign a conversation to an agent
 */

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { customerId, assignedTo, notes } = body;

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

        const now = new Date().toISOString();

        // Update customer assignment
        await db
            .update(customers)
            .set({
                assignedTo,
                updatedAt: now,
            })
            .where(eq(customers.id, customerId));

        // Create assignment record
        await db
            .insert(conversationAssignments)
            .values({
                customerId,
                assignedTo,
                assignedBy: user.id,
                assignedAt: now,
                notes: notes || null,
            });

        // Log assignment
        await logUserAction(
            user.id,
            'conversation_assigned',
            `Assigned conversation with ${customer.name || customer.phone} to ${assignedTo}`,
            'conversation',
            customerId.toString(),
            { assignedTo, notes },
            request
        );

        return NextResponse.json({
            success: true,
            assignedTo,
        });
    } catch (error) {
        console.error('Error assigning conversation:', error);
        return NextResponse.json(
            { error: 'Failed to assign conversation' },
            { status: 500 }
        );
    }
}
