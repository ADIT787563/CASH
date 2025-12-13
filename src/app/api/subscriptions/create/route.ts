import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { razorpay } from "@/lib/razorpay";
import { db } from "@/db";
import { subscriptions, payments } from "@/db/schema";
import { auth } from "@/lib/auth"; // Assuming better-auth setup
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { plan_id } = await req.json();

        // Validate Plan ID
        const plans = ["starter_999", "growth_1699", "pro_3999", "enterprise_8999"];
        if (!plans.includes(plan_id)) {
            return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
        }

        // Define price based on ID (In a real app, fetch from DB or config)
        let amount = 99900;
        if (plan_id === "growth_1699") amount = 169900;
        if (plan_id === "pro_3999") amount = 500;
        if (plan_id === "enterprise_8999") amount = 899900;

        // 1. Create Subscription Record (Pending)
        const [newSub] = await db.insert(subscriptions).values({
            userId: session.user.id,
            planId: plan_id,
            status: "pending",
            startDate: new Date().toISOString(),
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date().toISOString(), // Will update on activation
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }).returning({ id: subscriptions.id });

        const subscriptionId = newSub.id;

        // 2. Create Razorpay Order
        const options = {
            amount: amount,
            currency: "INR",
            receipt: `sub_${String(subscriptionId).substring(0, 8)}`,
            notes: {
                userId: session.user.id,
                subscriptionId: subscriptionId,
                planId: plan_id
            }
        };

        const order = await razorpay.orders.create(options);

        // 3. Create Payment Record (Pending) linked to Subscription
        // Note: payments table is for seller orders. We rely on subscription status.
        /*
         await db.insert(payments).values({
             userId: session.user.id,
             subscriptionId: subscriptionId,
             razorpayOrderId: order.id,
             amount: amount,
             currency: "INR",
             status: "pending",
             createdAt: new Date().toISOString(),
             updatedAt: new Date().toISOString()
         });
         */

        return NextResponse.json({
            subscriptionId: subscriptionId,
            razorpayOrderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            prefill: {
                name: session.user.name,
                email: session.user.email
            }
        });

    } catch (error) {
        console.error("Subscription Error:", error);
        return NextResponse.json(
            { error: "Error creating subscription" },
            { status: 500 }
        );
    }
}
