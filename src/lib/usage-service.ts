import { db } from "@/db";
import { businessUsage, user, subscriptions, pricingPlans } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getUserPlanLimits, PlanLimits } from "./plan-limits";

export type MetricType = 'conversations' | 'ai_replies' | 'orders' | 'messages';

export class UsageService {
    /**
     * Increments usage for a specific metric.
     * Updates both daily and monthly counters.
     */
    static async incrementUsage(userId: string, metric: MetricType, amount = 1) {
        const now = new Date();
        const dailyKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const monthlyKey = dailyKey.substring(0, 7); // YYYY-MM

        // Increment Daily
        await this.upsertUsage(userId, metric, 'daily', dailyKey, amount);

        // Increment Monthly
        await this.upsertUsage(userId, metric, 'monthly', monthlyKey, amount);
    }

    /**
     * Checks if usage is within limits for a metric.
     * @returns { allowed: boolean, current: number, limit: number }
     */
    static async checkUsageLimit(userId: string, metric: MetricType): Promise<{
        allowed: boolean;
        current: number;
        limit: number;
    }> {
        const { limits } = await getUserPlanLimits(userId);

        // In our current plan structure:
        // 'messages' is a monthly limit.
        // 'aiAssistant' (replies) might be daily or monthly. Let's assume daily for AI, monthly for bulk messages.
        // For this MVP, we map metrics to plan limit keys.

        let limitKey: keyof PlanLimits = 'messages';
        let period: 'daily' | 'monthly' = 'monthly';

        if (metric === 'ai_replies') {
            limitKey = 'messages'; // Using messages limit for bot replies too for now, or define separate
            period = 'daily'; // Bot replies are usually capped daily in our logic elsewhere
        } else if (metric === 'orders') {
            // Orders might be unlimited or capped. 
            // If not in limits, return unlimited.
            return { allowed: true, current: 0, limit: -1 };
        }

        const limit = limits[limitKey] as number;

        // If limit is -1, it's unlimited
        if (limit === -1) {
            return { allowed: true, current: 0, limit: -1 };
        }

        const key = period === 'daily'
            ? new Date().toISOString().split('T')[0]
            : new Date().toISOString().substring(0, 7);

        const usage = await db.query.businessUsage.findFirst({
            where: and(
                eq(businessUsage.userId, userId),
                eq(businessUsage.metric, metric),
                eq(businessUsage.period, period),
                eq(businessUsage.key, key)
            )
        });

        const current = usage?.count || 0;

        return {
            allowed: current < limit,
            current,
            limit
        };
    }

    /**
     * Internal helper to upsert usage records.
     */
    private static async upsertUsage(
        userId: string,
        metric: MetricType,
        period: 'daily' | 'monthly',
        key: string,
        amount: number
    ) {
        const { limits } = await getUserPlanLimits(userId);
        // Map metric to limit for the record
        let limitValue = -1;
        if (metric === 'ai_replies') limitValue = (limits.messages as number) || 100;
        if (metric === 'messages') limitValue = (limits.messages as number) || 100;

        await db.insert(businessUsage)
            .values({
                userId,
                metric,
                period,
                key,
                count: amount,
                limit: limitValue,
                updatedAt: new Date().toISOString()
            })
            .onConflictDoUpdate({
                target: [businessUsage.userId, businessUsage.metric, businessUsage.period, businessUsage.key],
                set: {
                    count: sql`${businessUsage.count} + ${amount}`,
                    updatedAt: new Date().toISOString()
                }
            });
    }

    /**
     * Gets current usage summary for dashboard.
     */
    static async getUsageSummary(userId: string) {
        const dailyKey = new Date().toISOString().split('T')[0];
        const monthlyKey = dailyKey.substring(0, 7);

        const records = await db.select().from(businessUsage).where(and(
            eq(businessUsage.userId, userId),
            sql`${businessUsage.key} IN (${dailyKey}, ${monthlyKey})`
        ));

        return records;
    }
}
