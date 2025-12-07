import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verification } from '@/db/schema';
import { sendOtpEmail } from '@/lib/email';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Set expiration (10 minutes from now)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Delete any existing OTPs for this email to prevent clutter
        // Note: In a real app, you might want to rate limit this
        try {
            await db.delete(verification).where(eq(verification.identifier, email));
        } catch (e) {
            // Ignore error if no previous OTP exists
            console.log('No previous OTP to delete or error deleting:', e);
        }

        // Store OTP in database
        await db.insert(verification).values({
            id: crypto.randomUUID(),
            identifier: email,
            value: otp,
            expiresAt: expiresAt,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Send OTP via email
        const emailSent = await sendOtpEmail(email, otp);

        if (!emailSent) {
            return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully'
        });

    } catch (error: any) {
        console.error('OTP Generation Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate OTP', details: error.message },
            { status: 500 }
        );
    }
}
