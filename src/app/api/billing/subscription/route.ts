import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subscriptions, user as userTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get current subscription
        const [subscription] = await db.select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, user.id))
            .limit(1);

        // 2. Get user's base plan info (fallback)
        const [userData] = await db.select({
            plan: userTable.plan,
        })
            .from(userTable)
            .where(eq(userTable.id, user.id))
            .limit(1);

        if (!subscription) {
            // Return basic data if no subscription record yet
            return NextResponse.json({
                planId: userData?.plan || 'starter',
                status: 'active', // Default to active for basic plans
                amount: 0,
                currency: 'INR',
                interval: 'monthly',
                currentPeriodStart: new Date().toISOString(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                usage: {
                    messages: 0,
                    messagesLimit: 100,
                    orders: 0,
                    ordersLimit: 10,
                }
            });
        }

        return NextResponse.json({
            ...subscription,
            // Mock usage for now - will be replaced by businessUsage table join later
            usage: {
                messages: 45,
                messagesLimit: 1000,
                orders: 12,
                ordersLimit: 100,
            }
        });

    } catch (error) {
        console.error('Subscription Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
