import { BillingService } from "./billing-service";
import { UsageService, MetricType } from "./usage-service";
import { NextResponse } from "next/server";

export async function checkBillingOperational(userId: string) {
    const billing = await BillingService.getEffectiveSubscriptionStatus(userId);
    if (!billing.isOperational) {
        return {
            allowed: false,
            status: billing.status,
            error: `Subscription inactive (Status: ${billing.status}). Please renew your plan.`
        };
    }
    return { allowed: true };
}

export async function validateUsage(userId: string, metric: MetricType) {
    const usage = await UsageService.checkUsageLimit(userId, metric);
    if (!usage.allowed) {
        return {
            allowed: false,
            current: usage.current,
            limit: usage.limit,
            error: `Usage limit reached for ${metric} (${usage.current}/${usage.limit}). Please upgrade.`
        };
    }
    return { allowed: true };
}

/**
 * Helper for API routes to block unauthorized billing/usage.
 */
export async function billingGuard(userId: string, metric?: MetricType) {
    const billing = await checkBillingOperational(userId);
    if (!billing.allowed) {
        return NextResponse.json({ error: billing.error }, { status: 403 });
    }

    if (metric) {
        const usage = await validateUsage(userId, metric);
        if (!usage.allowed) {
            return NextResponse.json({ error: usage.error }, { status: 403 });
        }
    }

    return null; // All good
}
