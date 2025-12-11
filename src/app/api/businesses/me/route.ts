import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/businesses/me
export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const business = await db.query.businesses.findFirst({
            where: eq(businesses.ownerId, session.user.id)
        });

        if (!business) {
            return NextResponse.json({ error: "No business found" }, { status: 404 });
        }

        return NextResponse.json(business);

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
