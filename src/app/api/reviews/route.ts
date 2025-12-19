
import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

const reviewSchema = z.object({
    userName: z.string().min(2),
    userRole: z.string().optional(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(10),
});

export async function GET() {
    try {
        const allReviews = await db
            .select()
            .from(reviews)
            .where(eq(reviews.status, "approved"))
            .orderBy(desc(reviews.createdAt));
        return NextResponse.json(allReviews);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = reviewSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.format() },
                { status: 400 }
            );
        }

        const newReview = await db.insert(reviews).values({
            userName: result.data.userName,
            userRole: result.data.userRole || "Verified User",
            rating: result.data.rating,
            comment: result.data.comment,
            status: "pending", // Default to pending for moderation
        }).returning();

        return NextResponse.json(newReview[0], { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }
}
