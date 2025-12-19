import { db } from "@/db";
import { subscriptions, user } from "@/db/schema";
import { eq, and, or, sql } from "drizzle-orm";

export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled' | 'expired' | 'trial';

export class BillingService {
    /**
     * Checks if a user has an active or grace-period subscription.
     */
    static async getEffectiveSubscriptionStatus(userId: string): Promise<{
        status: SubscriptionStatus;
        isOperational: boolean;
        planId?: string;
    }> {
        const sub = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.userId, userId),
            orderBy: (subscriptions, { desc }) => [desc(subscriptions.updatedAt)]
        });

        if (!sub) {
            return { status: 'inactive', isOperational: false };
        }

        const now = new Date();
        const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
        const graceEnd = sub.gracePeriodEndsAt ? new Date(sub.gracePeriodEndsAt) : null;

        // 1. Check if explicitly active
        if (sub.status === 'active') {
            if (periodEnd && periodEnd < now) {
                // Period expired, but status still 'active' in DB? 
                // This usually means we missed a webhook. We should treat as past_due or check for grace.
                if (graceEnd && graceEnd > now) {
                    return { status: 'past_due', isOperational: true, planId: sub.planId };
                }
                return { status: 'expired', isOperational: false, planId: sub.planId };
            }
            return { status: 'active', isOperational: true, planId: sub.planId };
        }

        // 2. Check Trial
        if (sub.status === 'trial') {
            if (periodEnd && periodEnd < now) {
                return { status: 'expired', isOperational: false, planId: sub.planId };
            }
            return { status: 'trial', isOperational: true, planId: sub.planId };
        }

        // 3. Check Past Due with Grace Period
        if (sub.status === 'past_due') {
            if (graceEnd && graceEnd > now) {
                return { status: 'past_due', isOperational: true, planId: sub.planId };
            }
            return { status: 'expired', isOperational: false, planId: sub.planId };
        }

        return { status: sub.status as SubscriptionStatus, isOperational: false, planId: sub.planId };
    }

    /**
     * Handles subscription renewal (usually called from webhook).
     */
    static async handleRenewal(userId: string, newPeriodEnd: Date) {
        await db.update(subscriptions)
            .set({
                status: 'active',
                currentPeriodEnd: newPeriodEnd.toISOString(),
                lastRenewalAt: new Date().toISOString(),
                gracePeriodEndsAt: null, // Clear grace period on successful payment
                updatedAt: new Date().toISOString()
            })
            .where(eq(subscriptions.userId, userId));

        await db.update(user)
            .set({ subscriptionStatus: 'active' })
            .where(eq(user.id, userId));
    }

    /**
     * Marks subscription as past_due and sets a grace period (e.g., 3 days).
     */
    static async handlePaymentFailure(userId: string) {
        const gracePeriodDays = 3;
        const graceEnd = new Date();
        graceEnd.setDate(graceEnd.getDate() + gracePeriodDays);

        await db.update(subscriptions)
            .set({
                status: 'past_due',
                gracePeriodEndsAt: graceEnd.toISOString(),
                updatedAt: new Date().toISOString()
            })
            .where(eq(subscriptions.userId, userId));

        await db.update(user)
            .set({ subscriptionStatus: 'past_due' })
            .where(eq(user.id, userId));
    }

    /**
     * Immediately cancels/expires a subscription.
     */
    static async handleExpiration(userId: string) {
        await db.update(subscriptions)
            .set({
                status: 'expired',
                updatedAt: new Date().toISOString()
            })
            .where(eq(subscriptions.userId, userId));

        await db.update(user)
            .set({ subscriptionStatus: 'inactive' })
            .where(eq(user.id, userId));
    }
}
