import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verification, user } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email and OTP are required' },
                { status: 400 }
            );
        }

        // Find valid OTP
        // Must match identifier (email), value (otp), and not be expired
        const validOtp = await db.query.verification.findFirst({
            where: and(
                eq(verification.identifier, email),
                eq(verification.value, otp),
                gt(verification.expiresAt, new Date())
            ),
        });

        if (!validOtp) {
            return NextResponse.json(
                { error: 'Invalid or expired OTP' },
                { status: 400 }
            );
        }

        // OTP is valid!

        // 1. Mark email as verified in user table (if user exists)
        try {
            await db.update(user)
                .set({ emailVerified: true })
                .where(eq(user.email, email));
        } catch (e) {
            // User might not exist yet if this is pre-registration verification
            console.log('User update skipped (user may not exist yet)');
        }

        // 2. Delete the used OTP (prevent replay attacks)
        await db.delete(verification).where(eq(verification.id, validOtp.id));

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error: any) {
        console.error('OTP Verification Error:', error);
        return NextResponse.json(
            { error: 'Failed to verify OTP', details: error.message },
            { status: 500 }
        );
    }
}
