import { NextRequest } from 'next/server';
import { db } from '@/db';
import { rateLimitTracking } from '@/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

/**
 * Rate Limiter Utility
 * 
 * Provides rate limiting functionality for various operations
 */

// Rate limit configurations
export const RATE_LIMITS = {
    // Authentication limits
    AUTH_LOGIN: { window: 15 * 60 * 1000, max: 5 },
    AUTH_PASSWORD_RESET: { window: 60 * 60 * 1000, max: 2 },

    // API limits (plan-based)
    API_STARTER: { window: 60 * 1000, max: 20 },
    API_GROWTH: { window: 60 * 1000, max: 60 },
    API_PRO: { window: 60 * 1000, max: 150 },
    API_ENTERPRISE: { window: 60 * 1000, max: 300 },

    // Message sending limits (plan-based)
    MESSAGE_STARTER: { window: 60 * 1000, max: 20 },
    MESSAGE_GROWTH: { window: 60 * 1000, max: 60 },
    MESSAGE_PRO: { window: 60 * 1000, max: 150 },
    MESSAGE_ENTERPRISE: { window: 60 * 1000, max: 300 },

    // Webhook limits
    WEBHOOK: { window: 60 * 1000, max: 60 },

    // Chatbot limits (daily)
    CHATBOT_STARTER: { window: 24 * 60 * 60 * 1000, max: 200 },
    CHATBOT_GROWTH: { window: 24 * 60 * 60 * 1000, max: 1000 },
    CHATBOT_PRO: { window: 24 * 60 * 60 * 1000, max: 3000 },
    CHATBOT_ENTERPRISE: { window: 24 * 60 * 60 * 1000, max: 10000 },
} as const;

// Error codes for rate limiting
export const RATE_LIMIT_ERRORS = {
    API_EXCEEDED: { code: 42901, message: 'API rate limit exceeded' },
    MESSAGE_EXCEEDED: { code: 42902, message: 'Message sending limit exceeded' },
    CHATBOT_EXCEEDED: { code: 42903, message: 'Chatbot daily limit exceeded' },
    WEBHOOK_FLOOD: { code: 42904, message: 'Webhook flood prevented' },
    AUTH_EXCEEDED: { code: 42905, message: 'Authentication rate limit exceeded' },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

interface RateLimitConfig {
    window: number;
    max: number;
}

interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: Date;
    retryAfter?: number;
}

export async function checkRateLimit(
    identifier: string,
    limitType: RateLimitType,
    customLimit?: number
): Promise<RateLimitResult> {
    const config = RATE_LIMITS[limitType];
    const limit = customLimit || config.max;
    const now = new Date();

    try {
        const [record] = await db
            .select()
            .from(rateLimitTracking)
            .where(
                and(
                    eq(rateLimitTracking.identifier, identifier),
                    eq(rateLimitTracking.limitType, limitType),
                    gte(rateLimitTracking.windowEnd, now.toISOString())
                )
            )
            .limit(1);

        if (!record) {
            const windowEnd = new Date(now.getTime() + config.window);
            await db.insert(rateLimitTracking).values({
                identifier,
                limitType,
                count: 0,
                windowStart: now.toISOString(),
                windowEnd: windowEnd.toISOString(),
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
            });

            return {
                allowed: true,
                limit,
                remaining: limit,
                resetAt: windowEnd,
            };
        }

        const allowed = record.count < limit;
        const remaining = Math.max(0, limit - record.count);
        const resetAt = new Date(record.windowEnd);
        const retryAfter = allowed ? undefined : Math.ceil((resetAt.getTime() - now.getTime()) / 1000);

        return {
            allowed,
            limit,
            remaining,
            resetAt,
            retryAfter,
        };
    } catch (error) {
        console.error('Rate limit check error:', error);
        return {
            allowed: true,
            limit,
            remaining: limit,
            resetAt: new Date(now.getTime() + config.window),
        };
    }
}

export async function incrementRateLimit(
    identifier: string,
    limitType: RateLimitType
): Promise<void> {
    const now = new Date();
    const config = RATE_LIMITS[limitType];

    try {
        const [record] = await db
            .select()
            .from(rateLimitTracking)
            .where(
                and(
                    eq(rateLimitTracking.identifier, identifier),
                    eq(rateLimitTracking.limitType, limitType),
                    gte(rateLimitTracking.windowEnd, now.toISOString())
                )
            )
            .limit(1);

        if (record) {
            await db
                .update(rateLimitTracking)
                .set({
                    count: record.count + 1,
                    updatedAt: now.toISOString(),
                })
                .where(eq(rateLimitTracking.id, record.id));
        } else {
            const windowEnd = new Date(now.getTime() + config.window);
            await db.insert(rateLimitTracking).values({
                identifier,
                limitType,
                count: 1,
                windowStart: now.toISOString(),
                windowEnd: windowEnd.toISOString(),
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
            });
        }
    } catch (error) {
        console.error('Rate limit increment error:', error);
    }
}

export async function getRemainingLimit(
    identifier: string,
    limitType: RateLimitType
): Promise<number> {
    const result = await checkRateLimit(identifier, limitType);
    return result.remaining;
}

export async function getResetTime(
    identifier: string,
    limitType: RateLimitType
): Promise<Date | null> {
    const now = new Date();

    try {
        const [record] = await db
            .select()
            .from(rateLimitTracking)
            .where(
                and(
                    eq(rateLimitTracking.identifier, identifier),
                    eq(rateLimitTracking.limitType, limitType),
                    gte(rateLimitTracking.windowEnd, now.toISOString())
                )
            )
            .limit(1);

        return record ? new Date(record.windowEnd) : null;
    } catch (error) {
        console.error('Get reset time error:', error);
        return null;
    }
}

export async function resetRateLimit(
    identifier: string,
    limitType: RateLimitType
): Promise<void> {
    try {
        await db
            .delete(rateLimitTracking)
            .where(
                and(
                    eq(rateLimitTracking.identifier, identifier),
                    eq(rateLimitTracking.limitType, limitType)
                )
            );
    } catch (error) {
        console.error('Reset rate limit error:', error);
    }
}

const PLAN_KEYS = ['starter', 'growth', 'pro', 'enterprise'] as const;
type PlanKey = (typeof PLAN_KEYS)[number];

export function getRateLimitForPlan(plan: PlanKey, type: 'api' | 'message' | 'chatbot'): RateLimitConfig {
    const normalizedPlan = PLAN_KEYS.includes(plan) ? plan : 'starter';
    const limitKey = `${type.toUpperCase()}_${normalizedPlan.toUpperCase()}` as RateLimitType;
    return RATE_LIMITS[limitKey] || RATE_LIMITS[`${type.toUpperCase()}_STARTER` as RateLimitType];
}

export async function cleanupOldRateLimits(): Promise<number> {
    const now = new Date();

    try {
        const result = await db
            .delete(rateLimitTracking)
            .where(lt(rateLimitTracking.windowEnd, now.toISOString()));

        const deleted = (result as any).rowsAffected || 0;
        console.log(`🧹 Cleaned up ${deleted} old rate limit records`);
        return deleted;
    } catch (error) {
        console.error('Cleanup rate limits error:', error);
        return 0;
    }
}

export function getIdentifierFromRequest(request: NextRequest, userId?: string): string {
    if (userId) return userId;

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() :
        request.headers.get('x-real-ip') ||
        'unknown';

    return `ip:${ip}`;
}
