import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/businesses/[id]/complete-onboarding
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify Ownership
        const business = await db.select().from(businesses).where(eq(businesses.id, id)).get();
        if (!business || business.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Mark Business as Onboarding Complete
        await db.update(businesses)
            .set({
                onboardingCompleted: true,
                updatedAt: new Date().toISOString()
            })
            .where(eq(businesses.id, id));

        // Mark User as Onboarding Complete (Step 4 or final state)
        await db.update(user)
            .set({ onboardingStep: 4 })
            .where(eq(user.id, session.user.id));

        // Trigger Welcome Logic (Email, WhatsApp, etc)
        // TODO: Send Welcome Email / Notification

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
