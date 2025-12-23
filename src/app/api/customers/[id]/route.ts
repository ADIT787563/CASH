import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const updateCustomerSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    tags: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    notes: z.string().optional(),
    status: z.enum(['active', 'inactive', 'archived']).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});

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
        if (isNaN(customerId)) {
            return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
        }

        const body = await request.json();

        // Zod Validation
        const validation = updateCustomerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validation.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { name, email, tags, labels, notes, status } = validation.data;

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

        // Update customer with STRICT UserId check (RLS)
        const result = await db
            .update(customers)
            .set(updateData)
            .where(
                and(
                    eq(customers.id, customerId),
                    eq(customers.userId, user.id) // Security: Ensure ownership
                )
            )
            .returning();

        if (result.length === 0) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            customer: result[0]
        });
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        );
    }
}
