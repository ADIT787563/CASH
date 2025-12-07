import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, incrementRateLimit, getIdentifierFromRequest, RATE_LIMIT_ERRORS, RateLimitType, getRateLimitForPlan } from '@/lib/rate-limiter';
import { getCurrentUserWithRole } from '@/lib/rbac';
import { logUserAction } from '@/lib/audit-logger';

/**
 * Rate Limiting Middleware
 * 
 * Provides HOC functions to wrap API routes with rate limiting
 */

interface RateLimitResponse {
    error: string;
    code: number;
    message: string;
    limit: number;
    remaining: number;
    resetAt: string;
    retryAfter: number;
}

/**
 * Create rate limit error response
 */
function createRateLimitError(
    errorType: keyof typeof RATE_LIMIT_ERRORS,
    limit: number,
    remaining: number,
    resetAt: Date,
    retryAfter: number
): NextResponse<RateLimitResponse> {
    const error = RATE_LIMIT_ERRORS[errorType];

    return NextResponse.json(
        {
            error: error.message,
            code: error.code,
            message: error.message,
            limit,
            remaining,
            resetAt: resetAt.toISOString(),
            retryAfter,
        },
        {
            status: 429,
            headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': Math.floor(resetAt.getTime() / 1000).toString(),
                'Retry-After': retryAfter.toString(),
            },
        }
    );
}

/**
 * Generic rate limit middleware
 */
export function withRateLimit(
    limitType: RateLimitType,
    errorType: keyof typeof RATE_LIMIT_ERRORS,
    getIdentifier?: (request: NextRequest, user?: any) => string
) {
    return function <T extends any[]>(
        handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
    ) {
        return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
            try {
                // Get identifier (IP or user ID)
                const identifier = getIdentifier
                    ? getIdentifier(request, args[0])
                    : getIdentifierFromRequest(request);

                // Check rate limit
                const result = await checkRateLimit(identifier, limitType);

                if (!result.allowed) {
                    // Log rate limit violation
                    if (args[0]?.id) {
                        await logUserAction(
                            args[0].id,
                            'rate_limit_exceeded',
                            `Rate limit exceeded for ${limitType}`,
                            'rate_limit',
                            undefined,
                            {
                                limitType,
                                limit: result.limit,
                                identifier,
                            },
                            request
                        );
                    }

                    return createRateLimitError(
                        errorType,
                        result.limit,
                        result.remaining,
                        result.resetAt,
                        result.retryAfter || 60
                    );
                }

                // Increment counter
                await incrementRateLimit(identifier, limitType);

                // Call original handler
                return await handler(request, ...args);
            } catch (error) {
                console.error('Rate limit middleware error:', error);
                // On error, allow request to proceed
                return await handler(request, ...args);
            }
        };
    };
}

/**
 * Authentication rate limiting (IP-based)
 */
export function withAuthRateLimit() {
    return withRateLimit(
        'AUTH_LOGIN',
        'AUTH_EXCEEDED',
        (request) => getIdentifierFromRequest(request)
    );
}

/**
 * API rate limiting (user-based, plan-aware)
 */
export function withAPIRateLimit() {
    return function <T extends any[]>(
        handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
    ) {
        return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
            try {
                // Get user from session
                const user = await getCurrentUserWithRole(request);

                if (!user) {
                    // No user, use IP-based limiting with starter tier
                    const identifier = getIdentifierFromRequest(request);
                    const result = await checkRateLimit(identifier, 'API_STARTER');

                    if (!result.allowed) {
                        return createRateLimitError(
                            'API_EXCEEDED',
                            result.limit,
                            result.remaining,
                            result.resetAt,
                            result.retryAfter || 60
                        );
                    }

                    await incrementRateLimit(identifier, 'API_STARTER');
                    return await handler(request, ...args);
                }

                // User authenticated, use plan-based limiting
                const rawPlan = ((user as any).plan || 'starter').toString().toLowerCase();
                const plan = (['starter', 'growth', 'pro', 'enterprise'].includes(rawPlan) ? rawPlan : 'starter') as 'starter' | 'growth' | 'pro' | 'enterprise';
                const limitType = `API_${plan.toUpperCase()}` as RateLimitType;
                const identifier = user.id;

                const result = await checkRateLimit(identifier, limitType);

                if (!result.allowed) {
                    await logUserAction(
                        user.id,
                        'rate_limit_exceeded',
                        `API rate limit exceeded (${plan} plan)`,
                        'rate_limit',
                        undefined,
                        {
                            limitType,
                            limit: result.limit,
                            plan,
                        },
                        request
                    );

                    return createRateLimitError(
                        'API_EXCEEDED',
                        result.limit,
                        result.remaining,
                        result.resetAt,
                        result.retryAfter || 60
                    );
                }

                await incrementRateLimit(identifier, limitType);
                return await handler(request, ...args);
            } catch (error) {
                console.error('API rate limit middleware error:', error);
                return await handler(request, ...args);
            }
        };
    };
}

/**
 * Message sending rate limiting (user-based, plan-aware)
 */
export function withMessageRateLimit() {
    return function <T extends any[]>(
        handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
    ) {
        return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
            try {
                const user = await getCurrentUserWithRole(request);

                if (!user) {
                    return NextResponse.json(
                        { error: 'Authentication required' },
                        { status: 401 }
                    );
                }

                const rawPlan = ((user as any).plan || 'starter').toString().toLowerCase();
                const plan = (['starter', 'growth', 'pro', 'enterprise'].includes(rawPlan) ? rawPlan : 'starter') as 'starter' | 'growth' | 'pro' | 'enterprise';
                const limitType = `MESSAGE_${plan.toUpperCase()}` as RateLimitType;
                const identifier = user.id;

                const result = await checkRateLimit(identifier, limitType);

                if (!result.allowed) {
                    await logUserAction(
                        user.id,
                        'rate_limit_exceeded',
                        `Message rate limit exceeded (${plan} plan)`,
                        'rate_limit',
                        undefined,
                        {
                            limitType,
                            limit: result.limit,
                            plan,
                        },
                        request
                    );

                    return createRateLimitError(
                        'MESSAGE_EXCEEDED',
                        result.limit,
                        result.remaining,
                        result.resetAt,
                        result.retryAfter || 60
                    );
                }

                await incrementRateLimit(identifier, limitType);
                return await handler(request, ...args);
            } catch (error) {
                console.error('Message rate limit middleware error:', error);
                return await handler(request, ...args);
            }
        };
    };
}

/**
 * Webhook rate limiting
 */
export function withWebhookRateLimit() {
    return withRateLimit(
        'WEBHOOK',
        'WEBHOOK_FLOOD',
        (request) => getIdentifierFromRequest(request)
    );
}
