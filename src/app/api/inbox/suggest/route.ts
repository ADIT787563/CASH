import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { generateSmartReply } from '@/lib/openai';
import { db } from '@/db';
import { customers, messages } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

/**
 * Smart Reply Suggestion API
 * POST /api/inbox/suggest
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { customerId } = body;

        if (!customerId) {
            return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
        }

        // Fetch customer details
        const [customer] = await db
            .select()
            .from(customers)
            .where(and(eq(customers.id, customerId), eq(customers.userId, user.id)))
            .limit(1);

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        // Fetch last few messages for context
        const recentMessages = await db
            .select()
            .from(messages)
            .where(eq(messages.customerId, customerId))
            .orderBy(desc(messages.timestamp))
            .limit(10);

        // Reverse to chronological order
        recentMessages.reverse();

        const formattedMessages = recentMessages.map(m => ({
            role: m.direction === 'inbound' ? 'user' : 'assistant',
            content: m.content
        }));

        const suggestion = await generateSmartReply(formattedMessages, customer.name || 'Customer');

        return NextResponse.json({ suggestion });
    } catch (error) {
        console.error('Smart reply error:', error);
        return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 });
    }
}
