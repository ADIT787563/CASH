import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { paymentSettings, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { method, upiId, razorpayKey, razorpaySecret } = body;

        if (!method) {
            return NextResponse.json({ error: "Method is required" }, { status: 400 });
        }

        const updates: any = {
            updatedAt: new Date().toISOString(),
        };

        if (method === 'upi' || method === 'both') {
            if (!upiId) return NextResponse.json({ error: "UPI ID is required" }, { status: 400 });
            updates.upiEnabled = true;
            updates.upiId = upiId;
        }

        if (method === 'razorpay' || method === 'both') {
            if (!razorpayKey || !razorpaySecret) return NextResponse.json({ error: "Keys are required" }, { status: 400 });
            updates.razorpayEnabled = true;
            updates.razorpayKeyId = razorpayKey;
            // Note: In real app, encrypt this. Storing plain for now as per schema existing pattern if not handled elsewhere
            updates.razorpayKeySecretEncrypted = razorpaySecret;
            updates.razorpayMode = 'live';
        }

        await db.transaction(async (tx) => {
            // Check if settings exist
            const existing = await tx.select().from(paymentSettings).where(eq(paymentSettings.userId, currentUser.id)).get();

            if (existing) {
                await tx.update(paymentSettings).set(updates).where(eq(paymentSettings.id, existing.id));
            } else {
                await tx.insert(paymentSettings).values({
                    userId: currentUser.id,
                    ...updates,
                    // Set defaults if creating new
                    codEnabled: true,
                    createdAt: new Date().toISOString(),
                });
            }

            // Update User Step to 3
            await tx.update(user).set({
                onboardingStep: 3,
                updatedAt: new Date(),
            }).where(eq(user.id, currentUser.id));
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Onboarding Payments Error:", e);
        return NextResponse.json({ error: "Failed to save payment settings" }, { status: 500 });
    }
}
