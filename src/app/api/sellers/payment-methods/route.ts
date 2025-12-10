import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sellerPaymentMethods } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET /api/sellers/payment-methods - Get current seller settings
export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const methods = await db.query.sellerPaymentMethods.findFirst({
            where: eq(sellerPaymentMethods.sellerId, session.user.id),
        });

        return NextResponse.json(methods || {});

    } catch (error) {
        console.error('Fetch Payment Methods Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/sellers/payment-methods - Update settings
export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            paymentPreference, // 'online', 'cod', 'both'
            razorpayLink,
            razorpayKeyId,
            razorpayKeySecret,
            upiId,
            phoneNumber,
            qrImageUrl
        } = body;

        // Check if exists
        const existing = await db.query.sellerPaymentMethods.findFirst({
            where: eq(sellerPaymentMethods.sellerId, session.user.id),
        });

        if (existing) {
            await db.update(sellerPaymentMethods).set({
                paymentPreference,
                razorpayLink,
                razorpayKeyId,
                razorpayKeySecret,
                upiId,
                phoneNumber,
                qrImageUrl,
                updatedAt: new Date()
            }).where(eq(sellerPaymentMethods.sellerId, session.user.id));
        } else {
            await db.insert(sellerPaymentMethods).values({
                sellerId: session.user.id,
                paymentPreference: paymentPreference || 'both',
                razorpayLink,
                razorpayKeyId,
                razorpayKeySecret,
                upiId,
                phoneNumber,
                qrImageUrl,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update Payment Methods Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
