import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user, subscriptions, pricingPlans } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const sessionUser = await getCurrentUser(req);

        if (!sessionUser) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch full user details from DB to get custom fields like trialEndsAt
        const dbUser = await db.query.user.findFirst({
            where: eq(user.id, sessionUser.id)
        });

        if (!dbUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // 1. Check if user already used trial
        if (dbUser.trialEndsAt) {
            return new NextResponse("Free trial already used", { status: 403 });
        }

        // 2. Check if user already has an active subscription
        const existingSub = await db.query.subscriptions.findFirst({
            where: and(
                eq(subscriptions.userId, sessionUser.id),
                eq(subscriptions.status, 'active')
            )
        });

        if (existingSub) {
            return new NextResponse("User already has an active subscription", { status: 400 });
        }

        // 3. Activate 3-Day Trial
        const trialDays = 3;
        const now = new Date();
        const trialEndDate = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

        // Transaction to update both user and create subscription
        await db.transaction(async (tx) => {
            // Update User
            await tx
                .update(user)
                .set({
                    subscriptionStatus: 'trial',
                    trialEndsAt: trialEndDate,
                    updatedAt: new Date(),
                })
                .where(eq(user.id, sessionUser.id));

            // Create Trial Subscription
            await tx.insert(subscriptions).values({
                userId: sessionUser.id,
                planId: 'trial', // Linking to our special logic in plan-limits
                status: 'active',
                currentPeriodStart: now.toISOString(),
                currentPeriodEnd: trialEndDate.toISOString(),
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
            });
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[START_TRIAL]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
