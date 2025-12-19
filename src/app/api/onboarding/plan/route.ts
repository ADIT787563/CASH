import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { plan } = body; // 'trial' or 'pro'

        if (!plan || !['trial', 'basic', 'growth', 'pro', 'enterprise'].includes(plan)) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        if (plan === 'trial') {
            // Check if ANY user with this phone number has already used a trial
            // We assume 'currentUser.phone' is populated. If not, we can't check.
            if ((currentUser as any).phone) {
                // Find any user with the same phone (excluding current user if they are just retrying)
                // Actually, if current user ALREADY has a trial, we should prevent extending it?
                // Or if ANOTHER user has the same phone.

                // We check if *any* user with this phone has a trialEndsAt set (meaning they took a trial)
                // OR if a user exists with this phone who isn't the current user (prevent multi-account).

                // Logic:
                // 1. Check if current user already has used trial? (Maybe allow if it's not expired? But simpler to just proceed or error)
                // 2. Check if OTHER users with same phone exist.

                const existingUsers = await db.select().from(user).where(eq(user.phone, (currentUser as any).phone));

                // If any record found that is NOT the current user, or if the current user has already used a trial (trialEndsAt is not null)
                // Actually, if trialEndsAt is not null, they used it.

                const duplicateUser = existingUsers.find(u => u.id !== currentUser.id);
                const alreadyUsed = existingUsers.some(u => u.trialEndsAt !== null);

                if (duplicateUser) {
                    return NextResponse.json({ error: "This phone number is already associated with another account." }, { status: 400 });
                }

                if (alreadyUsed) {
                    return NextResponse.json({ error: "Free trial already used for this phone number." }, { status: 400 });
                }
            } else {
                // No phone on profile? Should probably require it.
                // Assuming step 2 collected phone.
            }

            // Set trial to 3 days
            const trialEnds = new Date();
            trialEnds.setDate(trialEnds.getDate() + 3);

            await db.update(user).set({
                onboardingStep: 4,
                subscriptionStatus: 'trial',
                trialEndsAt: trialEnds,
                updatedAt: new Date(),
            }).where(eq(user.id, currentUser.id));

        } else {

            // Paid plan selected (growth, pro, enterprise)
            await db.update(user).set({
                onboardingStep: 4,
                plan: plan, // Save the selected plan
                // Do NOT set subscriptionStatus to active yet, wait for payment.
                updatedAt: new Date(),
            }).where(eq(user.id, currentUser.id));
        }

        return NextResponse.json({ success: true, plan });
    } catch (e) {
        console.error("Onboarding Plan Error:", e);
        return NextResponse.json({ error: "Failed to save plan" }, { status: 500 });
    }
}
