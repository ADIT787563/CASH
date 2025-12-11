import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/register
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if user exists (using Drizzle directly for speed/custom logic, or Auth)
        // Better Auth `signUp.email` handles this, but here we wrap strictly as requested.

        // 1. Check existing user
        const existingUser = await db.select().from(user).where(eq(user.email, email)).get();
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        // 2. Create user via Better Auth API
        // We use the internal API to sign up
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
                image: undefined // Optional
            }
        });

        // 3. Return strictly { userId, token } as requested
        if (result?.user) {
            // We need to get the session token. 
            // signUpEmail returns { user, session } if autoSignIn is true (default)
            // But treating strictly...
            return NextResponse.json({
                userId: result.user.id,
                token: result.token
            }, { status: 201 });
        }

        return NextResponse.json({ error: "Registration failed" }, { status: 500 });

    } catch (error: any) {
        console.error("Register Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
