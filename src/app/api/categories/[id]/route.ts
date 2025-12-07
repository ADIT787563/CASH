import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const userId = session.user.id;
        const { id } = await params;
        const categoryId = parseInt(id);

        if (isNaN(categoryId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const body = await request.json();
        const { name, description, imageUrl, isActive } = body;

        // Verify ownership
        const existing = await db.select().from(categories).where(and(
            eq(categories.id, categoryId),
            eq(categories.userId, userId)
        )).limit(1);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const updates: any = {
            updatedAt: new Date().toISOString()
        };
        if (name) {
            updates.name = name;
            updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (description !== undefined) updates.description = description;
        if (imageUrl !== undefined) updates.imageUrl = imageUrl;
        if (isActive !== undefined) updates.isActive = isActive;

        const updatedCategory = await db.update(categories)
            .set(updates)
            .where(eq(categories.id, categoryId))
            .returning();

        return NextResponse.json(updatedCategory[0]);

    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const userId = session.user.id;
        const { id } = await params;
        const categoryId = parseInt(id);

        if (isNaN(categoryId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Soft delete
        const deleted = await db.update(categories)
            .set({ deletedAt: new Date().toISOString() })
            .where(and(
                eq(categories.id, categoryId),
                eq(categories.userId, userId)
            ))
            .returning();

        if (deleted.length === 0) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
