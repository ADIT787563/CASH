import { db } from '@/db';
import { subscriptions, pricingPlans, products } from '@/db/schema';
import { eq, and, count, isNull } from 'drizzle-orm';

export interface PlanLimits {
    messages: number;
    whatsappNumbers: number;
    templates: number;
    leads: number;
    catalogs: number;
    teamMembers: number;
    aiAssistant: boolean;
    productFields: 'basic' | 'advanced' | 'full';
    bulkUpload: boolean;
    aiDescriptions: boolean;
    roleBasedAccess: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    autoReplySuggestions?: boolean;
    autoFollowUp?: boolean;
    customerNotes?: boolean;
    workflowAutomation?: boolean;
    whiteLabel?: boolean;
    dedicatedSupport?: boolean;
    customIntegrations?: boolean;
    priorityApproval?: boolean;
    [key: string]: any;
}

export type PlanId = 'starter' | 'growth' | 'agency' | 'enterprise';

// Default limits for free/trial users
const DEFAULT_LIMITS: PlanLimits = {
    messages: 100,
    whatsappNumbers: 1,
    templates: 3,
    leads: 50,
    catalogs: 5,
    teamMembers: 1,
    aiAssistant: false,
    productFields: 'basic',
    bulkUpload: false,
    aiDescriptions: false,
    roleBasedAccess: false,
    advancedAnalytics: false,
    apiAccess: false,
};

/**
 * Get the user's current plan and limits
 */
// 3-Day Trial Limits
const TRIAL_LIMITS: PlanLimits = {
    messages: 100, // Very limited
    whatsappNumbers: 1,
    templates: 1, // Only 1 template
    leads: 20,
    catalogs: 3,
    teamMembers: 0,
    aiAssistant: false, // No AI
    productFields: 'basic',
    bulkUpload: false,
    aiDescriptions: false,
    roleBasedAccess: false,
    advancedAnalytics: false,
    apiAccess: false,
};

/**
 * Get the user's current plan and limits
 */
export async function getUserPlanLimits(userId: string): Promise<{
    planId: PlanId | 'free' | 'trial';
    planName: string;
    limits: PlanLimits;
}> {
    try {
        // Get active subscription
        const subscription = await db
            .select()
            .from(subscriptions)
            .where(and(
                eq(subscriptions.userId, userId),
                eq(subscriptions.status, 'active')
            ))
            .limit(1);

        // Check if subscription exists and is not expired
        if (!subscription.length) {
            return {
                planId: 'free',
                planName: 'Free Tier',
                limits: DEFAULT_LIMITS,
            };
        }

        const sub = subscription[0];

        // Expiration Check
        if (sub.currentPeriodEnd) {
            const endDate = new Date(sub.currentPeriodEnd);
            if (endDate < new Date()) {
                // Expired
                return {
                    planId: 'free',
                    planName: 'Expired (Free Tier)',
                    limits: DEFAULT_LIMITS,
                };
            }
        }

        // Special handling for Trial Plan
        if (sub.planId === 'trial') {
            return {
                planId: 'trial',
                planName: '3-Day Trial',
                limits: TRIAL_LIMITS,
            };
        }

        // Get plan details for standard plans
        const plan = await db
            .select()
            .from(pricingPlans)
            .where(eq(pricingPlans.planId, sub.planId))
            .limit(1);

        if (!plan.length) {
            return {
                planId: 'free',
                planName: 'Unknown Plan (Free)',
                limits: DEFAULT_LIMITS,
            };
        }

        return {
            planId: sub.planId as PlanId,
            planName: plan[0].planName,
            limits: plan[0].limits as PlanLimits,
        };
    } catch (error) {
        console.error('Error getting user plan limits:', error);
        return {
            planId: 'free',
            planName: 'Free Tier',
            limits: DEFAULT_LIMITS,
        };
    }
}

/**
 * Check if user can add more catalogs
 */
export async function canAddCatalog(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    currentCount: number;
    limit: number;
}> {
    const { limits } = await getUserPlanLimits(userId);

    // Count current catalogs (products)
    const result = await db
        .select({ count: count() })
        .from(products)
        .where(and(
            eq(products.userId, userId),
            isNull(products.deletedAt)
        ));

    const currentCount = result[0]?.count || 0;
    const limit = limits.catalogs;

    // -1 means unlimited
    if (limit === -1) {
        return {
            allowed: true,
            currentCount,
            limit: -1,
        };
    }

    if (currentCount >= limit) {
        return {
            allowed: false,
            reason: `You have reached your catalog limit of ${limit}. Please upgrade your plan to add more products.`,
            currentCount,
            limit,
        };
    }

    return {
        allowed: true,
        currentCount,
        limit,
    };
}

/**
 * Check if user can access a specific feature
 */
export async function canAccessFeature(
    userId: string,
    feature: keyof PlanLimits
): Promise<boolean> {
    const { limits } = await getUserPlanLimits(userId);
    const featureValue = limits[feature];

    // If it's a boolean, return it directly
    if (typeof featureValue === 'boolean') {
        return featureValue;
    }

    // If it's -1, it means unlimited access
    if (featureValue === -1) {
        return true;
    }

    // Otherwise, if it exists and is truthy, allow access
    return !!featureValue;
}

/**
 * Get catalog usage stats
 */
export async function getCatalogUsageStats(userId: string): Promise<{
    used: number;
    limit: number;
    percentage: number;
    isUnlimited: boolean;
}> {
    const { limits } = await getUserPlanLimits(userId);

    const result = await db
        .select({ count: count() })
        .from(products)
        .where(and(
            eq(products.userId, userId),
            isNull(products.deletedAt)
        ));

    const used = result[0]?.count || 0;
    const limit = limits.catalogs;
    const isUnlimited = limit === -1;
    const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);

    return {
        used,
        limit: isUnlimited ? -1 : limit,
        percentage,
        isUnlimited,
    };
}

/**
 * Get all plan features for comparison
 */
export async function getAllPlanFeatures(): Promise<
    Array<{
        planId: string;
        planName: string;
        monthlyPrice: number;
        features: string[];
        limits: PlanLimits;
        isPopular: boolean;
    }>
> {
    const plans = await db
        .select()
        .from(pricingPlans)
        .where(eq(pricingPlans.isActive, true))
        .orderBy(pricingPlans.sortOrder);

    return plans.map((plan) => ({
        planId: plan.planId,
        planName: plan.planName,
        monthlyPrice: plan.monthlyPrice,
        features: plan.features as string[],
        limits: plan.limits as PlanLimits,
        isPopular: plan.isPopular || false,
    }));
}

/**
 * Check if user has exceeded their limit
 */
export async function hasExceededLimit(
    userId: string,
    limitType: 'catalogs' | 'messages' | 'templates' | 'leads' | 'teamMembers'
): Promise<{
    exceeded: boolean;
    current: number;
    limit: number;
}> {
    const { limits } = await getUserPlanLimits(userId);
    let current = 0;

    switch (limitType) {
        case 'catalogs':
            const catalogResult = await db
                .select({ count: count() })
                .from(products)
                .where(and(
                    eq(products.userId, userId),
                    isNull(products.deletedAt)
                ));
            current = catalogResult[0]?.count || 0;
            break;
        // Add other cases as needed
    }

    const limit = limits[limitType] as number;
    const exceeded = limit !== -1 && current >= limit;

    return {
        exceeded,
        current,
        limit,
    };
}
