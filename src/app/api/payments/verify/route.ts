import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, subscriptions, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { RAZORPAY_KEY_SECRET } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = await req.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // 1. Update Payment Record
            await db.update(payments)
                .set({
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: "captured",
                    updatedAt: new Date().toISOString()
                })
                .where(eq(payments.razorpayOrderId, razorpay_order_id));

            // 2. Fetch payment to get userId and notes (optional, if we need it)
            // Check if this payment was for a subscription (logic would be typically passed in metadata)

            // For now, return success
            return NextResponse.json({
                message: "success",
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id
            });
        } else {
            return NextResponse.json(
                { message: "Invalid signature" },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Error verifying payment:", error);
        return NextResponse.json(
            { error: "Error verifying payment" },
            { status: 500 }
        );
    }
}
