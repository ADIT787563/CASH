import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user, customers, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth"; // better-auth
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch User, Customer details, and Active Subscription
        const [userData] = await db.select().from(user).where(eq(user.id, session.user.id));
        const [customerData] = await db.select().from(customers).where(eq(customers.userId, session.user.id));

        // Find active subscription
        const [subscription] = await db.select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, session.user.id));
        // In real app, filter by status='active'

        if (!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                plan: userData.plan, // 'starter', etc.
                image: userData.image,
                emailVerified: userData.emailVerified
            },
            customer: customerData || null,
            subscription: subscription || null,
        });

    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
