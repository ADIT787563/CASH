import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

/**
 * Update Customer API
 * PATCH /api/customers/[id]
 * 
 * Update customer information (name, tags, labels, notes, status)
 */

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
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

        const customerId = parseInt(params.id);
        const body = await request.json();
        const { name, email, tags, labels, notes, status } = body;

        // Build update object
        const updateData: any = {
            updatedAt: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (tags !== undefined) updateData.tags = JSON.stringify(tags);
        if (labels !== undefined) updateData.labels = JSON.stringify(labels);
        if (notes !== undefined) updateData.notes = notes;
        if (status !== undefined) updateData.status = status;

        // Update customer
        await db
            .update(customers)
            .set(updateData)
            .where(
                and(
                    eq(customers.id, customerId),
                    eq(customers.userId, user.id)
                )
            );

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        );
    }
}
