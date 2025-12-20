import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const results = await db.select()
            .from(reviews)
            .where(eq(reviews.status, 'approved'))
            .orderBy(desc(reviews.createdAt));

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error('GET reviews error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const body = await request.json();
        const { rating, comment, role, location } = body;

        // Simple validation
        if (!rating || !comment) {
            return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 });
        }

        const [newReview] = await db.insert(reviews).values({
            userId: user.id,
            userName: user.name,
            userRole: role || 'User', // Default role if not provided
            location: location || '',
            rating: Number(rating),
            comment: comment,
            status: 'approved', // Auto-approve as per user request
        }).returning();

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        console.error('POST review error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}
