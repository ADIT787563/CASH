import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, user, orderSequences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { customAlphabet } from "nanoid";

// POST /api/businesses
export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, slug, type, category, phone, email, address, gstin } = body;

        // Validation
        if (!name || !slug || !email || !phone) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Slug Uniqueness check
        const existingSlug = await db.query.businesses.findFirst({
            where: eq(businesses.slug, slug)
        });
        if (existingSlug) {
            return NextResponse.json({ error: "Store URL handle is already taken" }, { status: 409 });
        }

        // Generate Seller Code (WG-XXXXXX)
        const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
        const codeSuffix = nanoid();
        const sellerCode = `WG-${codeSuffix}`;

        // Create Business
        const [newBusiness] = await db.insert(businesses).values({
            ownerId: session.user.id,
            name,
            displayName: name, // Default
            slug,
            sellerCode,
            type,
            category,
            phone,
            email,
            address, // JSON
            gstin,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }).returning();

        // Initialize Order Sequence
        await db.insert(orderSequences).values({
            businessId: newBusiness.id,
            lastSeqNumber: 0
        });

        // Update User Step
        await db.update(user)
            .set({ onboardingStep: 3 })
            .where(eq(user.id, session.user.id));

        return NextResponse.json({ success: true, businessId: newBusiness.id, sellerCode });

    } catch (error: any) {
        console.error("Create Business Error:", error);
        // Handle unique constraint violations gracefully if race condition
        return NextResponse.json({ error: "Failed to create business profile" }, { status: 500 });
    }
}
