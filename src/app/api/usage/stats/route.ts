import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rateLimitTracking, user } from '@/db/schema';
import { getCurrentUserWithRole } from '@/lib/rbac';
import { RATE_LIMITS } from '@/lib/rate-limiter';
import { getChatbotUsageStats } from '@/lib/chatbot-usage';
import { eq, and, gte } from 'drizzle-orm';

/**
 * Usage Statistics API
 * GET /api/usage/stats
 * 
 * Returns current usage statistics for the authenticated user
 * Includes API, message, and chatbot usage
 */

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUserWithRole(request);

        if (!currentUser) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const userId = currentUser.id;
        const rawPlan = ((currentUser as any).plan || 'starter').toString().toLowerCase();
        const plan = (['starter', 'growth', 'pro', 'enterprise'].includes(rawPlan) ? rawPlan : 'starter') as 'starter' | 'growth' | 'pro' | 'enterprise';
        const now = new Date();

        // Get API usage
        const apiLimitType = `API_${plan.toUpperCase()}` as keyof typeof RATE_LIMITS;
        const apiLimit = RATE_LIMITS[apiLimitType];

        const [apiUsage] = await db
            .select()
            .from(rateLimitTracking)
            .where(
                and(
                    eq(rateLimitTracking.identifier, userId),
                    eq(rateLimitTracking.limitType, apiLimitType),
                    gte(rateLimitTracking.windowEnd, now.toISOString())
                )
            )
            .limit(1);

        // Get message usage
        const messageLimitType = `MESSAGE_${plan.toUpperCase()}` as keyof typeof RATE_LIMITS;
        const messageLimit = RATE_LIMITS[messageLimitType];

        const [messageUsage] = await db
            .select()
            .from(rateLimitTracking)
            .where(
                and(
                    eq(rateLimitTracking.identifier, userId),
                    eq(rateLimitTracking.limitType, messageLimitType),
                    gte(rateLimitTracking.windowEnd, now.toISOString())
                )
            )
            .limit(1);

        // Get chatbot usage
        const chatbotStats = await getChatbotUsageStats(userId);

        // Calculate reset times
        const apiResetAt = apiUsage?.windowEnd || new Date(now.getTime() + apiLimit.window).toISOString();
        const messageResetAt = messageUsage?.windowEnd || new Date(now.getTime() + messageLimit.window).toISOString();

        return NextResponse.json({
            plan,
            usage: {
                api: {
                    current: apiUsage?.count || 0,
                    limit: apiLimit.max,
                    remaining: Math.max(0, apiLimit.max - (apiUsage?.count || 0)),
                    resetAt: apiResetAt,
                    window: 'per minute',
                },
                messages: {
                    current: messageUsage?.count || 0,
                    limit: messageLimit.max,
                    remaining: Math.max(0, messageLimit.max - (messageUsage?.count || 0)),
                    resetAt: messageResetAt,
                    window: 'per minute',
                },
                chatbot: {
                    current: chatbotStats.today,
                    limit: chatbotStats.limit,
                    remaining: chatbotStats.remaining,
                    resetAt: chatbotStats.resetAt.toISOString(),
                    window: 'per day',
                },
            },
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Usage stats error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch usage statistics',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
