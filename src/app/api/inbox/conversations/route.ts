import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, like, desc, or } from 'drizzle-orm';

/**
 * Inbox Conversations API
 * GET /api/inbox/conversations
 * 
 * List all customer conversations with filtering and pagination
 */

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const assignedTo = searchParams.get('assignedTo');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        // Build query conditions
        const conditions = [eq(customers.userId, user.id)];

        if (status) {
            conditions.push(eq(customers.status, status));
        }

        if (assignedTo) {
            conditions.push(eq(customers.assignedTo, assignedTo));
        }

        if (search) {
            conditions.push(
                or(
                    like(customers.name, `%${search}%`),
                    like(customers.phone, `%${search}%`)
                )!
            );
        }

        // Fetch conversations
        const conversations = await db
            .select()
            .from(customers)
            .where(and(...conditions))
            .orderBy(desc(customers.lastMessageTime))
            .limit(limit)
            .offset(offset);

        // Get total count
        const totalResult = await db
            .select()
            .from(customers)
            .where(and(...conditions));

        const total = totalResult.length;

        return NextResponse.json({
            conversations,
            total,
            page,
            limit,
            hasMore: offset + conversations.length < total,
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}
