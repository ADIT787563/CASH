import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sellerPaymentMethods } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// POST - Verify Razorpay payment link
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sellerId = session.user.id;

        // Fetch seller's payment methods
        const methods = await db
            .select()
            .from(sellerPaymentMethods)
            .where(eq(sellerPaymentMethods.sellerId, sellerId))
            .limit(1);

        if (methods.length === 0 || !methods[0].razorpayLink) {
            return NextResponse.json(
                { error: 'No Razorpay link configured' },
                { status: 400 }
            );
        }

        const razorpayLink = methods[0].razorpayLink;

        // Simple validation: Check if the link is accessible
        try {
            const response = await fetch(razorpayLink, {
                method: 'HEAD',
                redirect: 'follow',
            });

            if (response.ok || response.status === 200 || response.status === 301 || response.status === 302) {
                return NextResponse.json({
                    success: true,
                    message: 'Razorpay link is valid and accessible',
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: `Link returned status ${response.status}. Please verify the link is correct.`,
                });
            }
        } catch (fetchError) {
            return NextResponse.json({
                success: false,
                message: 'Could not verify the Razorpay link. Please ensure it is correct and accessible.',
            });
        }
    } catch (error) {
        console.error('Error verifying payment link:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
