import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, products, invoices, subscriptions, analytics } from '@/db/schema';
import { eq, desc, and, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // 1. Fetch User Plan & Subscription Status
        const [userData] = await db.select({
            plan: user.plan,
            subscriptionStatus: user.subscriptionStatus
        })
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        // 2. Calculate Usage
        // Products Usage
        const [productCount] = await db.select({ count: count() })
            .from(products)
            .where(and(
                eq(products.userId, userId),
                eq(products.status, 'active')
            ));

        // Message/AI Usage (aggregated from Analytics for simple approximation)
        // In a real scenario, you'd aggregate over the billing period. 
        // For now, we sum up all time or use a dedicated usage table.
        // Let's use a 30-day window aggregation from analytics table
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

        // This is a simplified aggregated usage. 
        // Ideally, use a dedicated 'usage' table reset monthly.
        const usageStats = await db.select().from(analytics).where(eq(analytics.userId, userId));

        const totalMessages = usageStats.reduce((acc, curr) => acc + (curr.totalMessages || 0), 0);
        // Assuming AI replies are ~40% of outbound for demo or track separately
        const aiRepliesEstimate = Math.round(totalMessages * 0.4);

        // 3. Define Limits based on Plan (Hardcoded or fetched from DB)
        const PLAN_LIMITS: Record<string, any> = {
            'starter': { products: 10, messages: 500, ai_replies: 100 },
            'growth': { products: 50, messages: 5000, ai_replies: 2000 },
            'pro': { products: 500, messages: 50000, ai_replies: 10000 },
            'enterprise': { products: 9999, messages: 999999, ai_replies: 999999 }
        };

        const currentPlan = userData?.plan || 'starter';
        const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS['starter'];

        // 4. Fetch Invoices
        const userInvoices = await db.select()
            .from(invoices)
            .where(eq(invoices.userId, userId))
            .orderBy(desc(invoices.createdAt))
            .limit(5);

        return NextResponse.json({
            plan: {
                id: currentPlan,
                name: currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1),
                status: userData?.subscriptionStatus || 'inactive',
                amount: currentPlan === 'pro' ? 2999 : currentPlan === 'growth' ? 999 : 0
            },
            usage: {
                products: { used: productCount.count, limit: limits.products },
                conversations: { used: totalMessages, limit: limits.messages },
                ai_replies: { used: aiRepliesEstimate, limit: limits.ai_replies }
            },
            invoices: userInvoices.map(inv => ({
                id: inv.id,
                amount: inv.amount,
                date: inv.createdAt,
                status: inv.status,
                pdfUrl: inv.pdfUrl
            }))
        });

    } catch (error: any) {
        console.error('Billing Usage API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
