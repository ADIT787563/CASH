import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/auth/verify-phone
export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { phone, otp } = await req.json();

        if (!phone || !otp) {
            return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
        }

        // Mock OTP Verification Logic
        // In real world: Verify with SMS provider (Twilio, MSG91, etc.)
        // For now, assume OTP '123456' is valid for verified phones.
        const isValid = otp === '123456';

        if (!isValid) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        // Update User
        await db.update(user)
            .set({
                phone: phone,
                phoneVerified: true,
                onboardingStep: 2, // Move to next step (Business Profile)
                updatedAt: new Date()
            })
            .where(eq(user.id, session.user.id));

        return NextResponse.json({ success: true, message: "Phone verified successfully" });

    } catch (error) {
        console.error("Verify Phone Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
