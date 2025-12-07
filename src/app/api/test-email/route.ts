import { NextRequest, NextResponse } from 'next/server';
import { runAllEmailTests } from '@/lib/email-test';

/**
 * Email Test API Route
 * 
 * Usage: GET /api/test-email?email=your-email@example.com
 * 
 * This will send all test emails to the specified email address.
 */
export async function GET(req: NextRequest) {
    try {
        // Get email from query parameters
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                {
                    error: 'Email parameter is required',
                    usage: 'GET /api/test-email?email=your-email@example.com'
                },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        console.log(`Running email tests for: ${email}`);

        // Run all email tests
        const results = await runAllEmailTests(email);

        return NextResponse.json({
            success: true,
            message: `Test emails sent to ${email}`,
            results,
            note: 'Check your inbox (and spam folder) for the test emails'
        });

    } catch (error: any) {
        console.error('Email test error:', error);
        return NextResponse.json(
            {
                error: 'Failed to send test emails',
                details: error.message
            },
            { status: 500 }
        );
    }
}
