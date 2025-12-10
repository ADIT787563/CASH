import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { auth } from "@/lib/auth"; // Assuming better-auth setup
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount_paise, currency = "INR", receipt_id, notes } = await req.json();

        if (!amount_paise) {
            return NextResponse.json({ error: "Amount is required" }, { status: 400 });
        }

        const options = {
            amount: amount_paise,
            currency,
            receipt: receipt_id || `rcpt_${Date.now()}`,
            notes: {
                userId: session.user.id,
                ...notes
            }
        };

        const order = await razorpay.orders.create(options);

        // Persist to DB
        await db.insert(payments).values({
            userId: session.user.id,
            razorpayOrderId: order.id,
            amount: amount_paise,
            currency: currency,
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Error creating details:", error);
        return NextResponse.json(
            { error: "Error creating order" },
            { status: 500 }
        );
    }
}
