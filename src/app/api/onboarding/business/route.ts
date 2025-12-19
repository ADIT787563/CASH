import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, businessSettings, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import crypto from 'crypto';

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { businessName, ownerName, category, whatsappNumber, supportNumber, city, state, gst, address, description } = body;

        if (!businessName || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Generate Slug and Seller Code
        const baseSlug = slugify(businessName);
        const randomSuffix = crypto.randomBytes(3).toString('hex');
        const slug = `${baseSlug}-${randomSuffix}`;
        const sellerCode = `WG-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // DB Transaction to update both tables
        await db.transaction(async (tx) => {
            // 1. Create or Update Business
            // Check if business already exists for user
            const existingBusiness = await tx.select().from(businesses).where(eq(businesses.ownerId, currentUser.id)).get();

            if (existingBusiness) {
                await tx.update(businesses).set({
                    name: businessName,
                    category: category,
                    gstin: gst,
                    phone: whatsappNumber || existingBusiness.phone || (currentUser as any).phone || "PENDING",
                    email: existingBusiness.email || currentUser.email,
                    updatedAt: new Date().toISOString(),
                }).where(eq(businesses.id, existingBusiness.id));
            } else {
                await tx.insert(businesses).values({
                    ownerId: currentUser.id,
                    name: businessName,
                    displayName: businessName,
                    slug: slug,
                    sellerCode: sellerCode,
                    category: category,
                    gstin: gst,
                    phone: whatsappNumber || (currentUser as any).phone || "PENDING",
                    email: currentUser.email,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }

            // 2. Update Business Settings
            const existingSettings = await tx.select().from(businessSettings).where(eq(businessSettings.userId, currentUser.id)).get();

            if (existingSettings) {
                await tx.update(businessSettings).set({
                    businessName: businessName,
                    businessCategory: category,
                    businessDescription: description,
                    updatedAt: new Date().toISOString(),
                }).where(eq(businessSettings.id, existingSettings.id));
            } else {
                await tx.insert(businessSettings).values({
                    userId: currentUser.id,
                    businessName: businessName,
                    businessCategory: category,
                    businessDescription: description,
                    whatsappNumber: (currentUser as any).phone || "PENDING",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }

            // 3. Update User Step
            await tx.update(user).set({
                onboardingStep: 2,
                updatedAt: new Date(),
            }).where(eq(user.id, currentUser.id));
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Onboarding Business Error:", e);
        return NextResponse.json({ error: "Failed to save business profile" }, { status: 500 });
    }
}
