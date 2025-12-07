import { db } from '@/db';
import { chatbotUsage, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { RATE_LIMITS } from './rate-limiter';

/**
 * Chatbot Usage Tracking
 * 
 * Tracks daily chatbot reply usage per user
 * Enforces plan-based limits
 */

/**
 * Get chatbot usage limit for user's plan
 */
const SUPPORTED_PLANS = ['starter', 'growth', 'pro', 'enterprise'] as const;
type ChatbotPlan = (typeof SUPPORTED_PLANS)[number];

export function getChatbotLimit(plan: ChatbotPlan): number {
    const normalizedPlan = SUPPORTED_PLANS.includes(plan) ? plan : 'starter';
    const limitKey = `CHATBOT_${normalizedPlan.toUpperCase()}` as keyof typeof RATE_LIMITS;
    return RATE_LIMITS[limitKey]?.max || RATE_LIMITS.CHATBOT_STARTER.max;
}

/**
 * Check if user can send chatbot reply
 */
export async function canSendChatbotReply(userId: string): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
    resetAt: Date;
}> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const now = new Date();

    try {
        // Get user's plan
        const [userData] = await db
            .select({ plan: user.plan })
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        const plan = (userData?.plan || 'starter') as ChatbotPlan;
        const limit = getChatbotLimit(plan);

        // Get today's usage
        const [usage] = await db
            .select()
            .from(chatbotUsage)
            .where(
                and(
                    eq(chatbotUsage.userId, userId),
                    eq(chatbotUsage.date, today)
                )
            )
            .limit(1);

        const current = usage?.count || 0;
        const allowed = current < limit;

        // Reset time is midnight tonight
        const resetAt = new Date(now);
        resetAt.setHours(24, 0, 0, 0);

        return {
            allowed,
            current,
            limit,
            resetAt,
        };
    } catch (error) {
        console.error('Check chatbot usage error:', error);
        // On error, allow the request
        return {
            allowed: true,
            current: 0,
            limit: 200,
            resetAt: new Date(),
        };
    }
}

/**
 * Increment chatbot usage counter
 */
export async function incrementChatbotUsage(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    try {
        // Get user's plan
        const [userData] = await db
            .select({ plan: user.plan })
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        const plan = (userData?.plan || 'starter') as ChatbotPlan;
        const limit = getChatbotLimit(plan);

        // Check if record exists for today
        const [existing] = await db
            .select()
            .from(chatbotUsage)
            .where(
                and(
                    eq(chatbotUsage.userId, userId),
                    eq(chatbotUsage.date, today)
                )
            )
            .limit(1);

        if (existing) {
            // Increment existing record
            await db
                .update(chatbotUsage)
                .set({
                    count: existing.count + 1,
                    updatedAt: now,
                })
                .where(eq(chatbotUsage.id, existing.id));
        } else {
            // Create new record for today
            await db.insert(chatbotUsage).values({
                userId,
                date: today,
                count: 1,
                limit,
                createdAt: now,
                updatedAt: now,
            });
        }

        console.log(`📊 Chatbot usage incremented for user ${userId} (${plan} plan)`);
    } catch (error) {
        console.error('Increment chatbot usage error:', error);
    }
}

/**
 * Get chatbot usage statistics for user
 */
export async function getChatbotUsageStats(userId: string): Promise<{
    today: number;
    limit: number;
    remaining: number;
    resetAt: Date;
}> {
    const result = await canSendChatbotReply(userId);

    return {
        today: result.current,
        limit: result.limit,
        remaining: Math.max(0, result.limit - result.current),
        resetAt: result.resetAt,
    };
}

/**
 * Cleanup old chatbot usage records (older than 90 days)
 */
export async function cleanupOldChatbotUsage(): Promise<number> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const cutoffDate = ninetyDaysAgo.toISOString().split('T')[0];

    try {
        const result = await db
            .delete(chatbotUsage)
            .where(eq(chatbotUsage.date, cutoffDate));

        const deleted = (result as any).rowsAffected || 0;
        console.log(`🧹 Cleaned up ${deleted} old chatbot usage records`);
        return deleted;
    } catch (error) {
        console.error('Cleanup chatbot usage error:', error);
        return 0;
    }
}
