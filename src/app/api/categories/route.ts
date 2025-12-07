import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const userId = session.user.id;

        const allCategories = await db.select()
            .from(categories)
            .where(and(
                eq(categories.userId, userId),
                isNull(categories.deletedAt)
            ))
            .orderBy(desc(categories.createdAt));

        return NextResponse.json(allCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const userId = session.user.id;
        const body = await request.json();

        const { name, description, imageUrl } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Simple slug generation
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const newCategory = await db.insert(categories).values({
            userId,
            name,
            slug,
            description,
            imageUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }).returning();

        return NextResponse.json(newCategory[0], { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
