import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, businessSettings, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { phone } = body;

        if (!phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        await db.transaction(async (tx) => {
            // 1. Update Business Phone
            // Find business owned by user
            const existingBusiness = await tx.select().from(businesses).where(eq(businesses.ownerId, currentUser.id)).get();
            if (existingBusiness) {
                await tx.update(businesses).set({
                    phone: phone,
                    updatedAt: new Date().toISOString(),
                }).where(eq(businesses.id, existingBusiness.id));
            }

            // 2. Update Business Settings WhatsApp Number
            const existingSettings = await tx.select().from(businessSettings).where(eq(businessSettings.userId, currentUser.id)).get();
            if (existingSettings) {
                await tx.update(businessSettings).set({
                    whatsappNumber: phone,
                    updatedAt: new Date().toISOString(),
                }).where(eq(businessSettings.id, existingSettings.id));
            } else {
                // Create if not exists (edge case if they skipped Step 2 but that shouldn't happen flow-wise)
                await tx.insert(businessSettings).values({
                    userId: currentUser.id,
                    businessName: existingBusiness?.name || "My Business",
                    whatsappNumber: phone,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }

            // 3. Update User Step to 4 (WhatsApp Verified)
            await tx.update(user).set({
                onboardingStep: 4,
                updatedAt: new Date(),
            }).where(eq(user.id, currentUser.id));
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Onboarding WhatsApp Save Error:", e);
        return NextResponse.json({ error: "Failed to save WhatsApp number" }, { status: 500 });
    }
}
