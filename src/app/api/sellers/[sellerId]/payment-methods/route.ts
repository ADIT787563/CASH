// src/app/api/sellers/[id]/payment-methods/route.ts
// Wait, Next.js App Router dynamic route params are handled via folder structure.
// I will create `src/app/api/sellers/[sellerId]/payment-methods/route.ts` 
// But wait, the `id` in the URL usually refers to the User ID or Business ID?
// The prompt said `PUT /api/sellers/:id/payment-methods`.
// I'll assume `:id` is the Business ID (Seller ID).

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sellerPaymentMethods, user, businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ sellerId: string }> }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sellerId } = await params; // Business ID

        // Verify Ownership
        const business = await db.select().from(businesses).where(eq(businesses.id, sellerId)).get();
        if (!business || business.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const {
            payment_preference,
            razorpay_link,
            webhook_consent,
            upi_id,
            cod_notes
        } = body;

        // Validation based on preference
        if (['online', 'both'].includes(payment_preference) && !razorpay_link && !upi_id) {
            return NextResponse.json({ error: "Online payments require a Razorpay Link or UPI ID" }, { status: 400 });
        }

        // Upsert Payment Methods
        // Check if exists
        const existing = await db.select().from(sellerPaymentMethods).where(eq(sellerPaymentMethods.sellerId, sellerId)).get();

        if (existing) {
            await db.update(sellerPaymentMethods).set({
                paymentPreference: payment_preference,
                razorpayLink: razorpay_link,
                webhookConsent: webhook_consent,
                upiId: upi_id,
                codNotes: cod_notes,
                updatedAt: new Date()
            }).where(eq(sellerPaymentMethods.id, existing.id));
        } else {
            await db.insert(sellerPaymentMethods).values({
                sellerId: sellerId,
                paymentPreference: payment_preference,
                razorpayLink: razorpay_link,
                webhookConsent: webhook_consent,
                upiId: upi_id,
                codNotes: cod_notes,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // Update User Step to 4 (Complete)
        await db.update(user)
            .set({ onboardingStep: 4 })
            .where(eq(user.id, session.user.id));

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Update Payment Methods Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
