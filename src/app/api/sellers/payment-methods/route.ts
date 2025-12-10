import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sellerPaymentMethods } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET - Fetch seller payment methods
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sellerId = session.user.id;

        // Fetch payment methods
        const methods = await db
            .select()
            .from(sellerPaymentMethods)
            .where(eq(sellerPaymentMethods.sellerId, sellerId))
            .limit(1);

        if (methods.length === 0) {
            // Return default values if not found
            return NextResponse.json({
                paymentPreference: 'both',
                razorpayLink: null,
                razorpayConnectedAccountId: null,
                webhookConsent: false,
                webhookUrl: null,
                upiId: null,
                phoneNumber: null,
                qrImageUrl: null,
                codNotes: null,
            });
        }

        return NextResponse.json(methods[0]);
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT - Update seller payment methods
export async function PUT(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sellerId = session.user.id;
        const body = await request.json();

        const {
            paymentPreference,
            razorpayLink,
            razorpayConnectedAccountId,
            webhookConsent,
            webhookSecretHash,
            upiId,
            phoneNumber,
            qrImageUrl,
            codNotes,
        } = body;

        // Validation
        if (!paymentPreference || !['online', 'cod', 'both'].includes(paymentPreference)) {
            return NextResponse.json(
                { error: 'Invalid payment preference. Must be one of: online, cod, both' },
                { status: 400 }
            );
        }

        // Validate UPI ID format if provided
        if (upiId && !/^[\w.-]+@[\w.-]+$/.test(upiId)) {
            return NextResponse.json({ error: 'Invalid UPI ID format' }, { status: 400 });
        }

        // Validate Razorpay link format if provided
        if (razorpayLink && !razorpayLink.match(/^https?:\/\/(rzp\.io|razorpay\.com)/)) {
            return NextResponse.json(
                { error: 'Invalid Razorpay link. Must start with https://rzp.io/ or https://razorpay.com/' },
                { status: 400 }
            );
        }

        // Validate phone number format if provided
        if (phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
            return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
        }

        // Generate webhook URL for display
        const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/seller-payments/razorpay`;

        // Check if record exists
        const existing = await db
            .select()
            .from(sellerPaymentMethods)
            .where(eq(sellerPaymentMethods.sellerId, sellerId))
            .limit(1);

        const now = new Date();

        if (existing.length > 0) {
            // Update existing
            await db
                .update(sellerPaymentMethods)
                .set({
                    paymentPreference,
                    razorpayLink,
                    razorpayConnectedAccountId,
                    webhookConsent: webhookConsent || false,
                    webhookUrl: webhookConsent ? webhookUrl : null,
                    webhookSecretHash,
                    upiId,
                    phoneNumber,
                    qrImageUrl,
                    codNotes,
                    updatedAt: now,
                })
                .where(eq(sellerPaymentMethods.sellerId, sellerId));
        } else {
            // Insert new
            await db.insert(sellerPaymentMethods).values({
                sellerId,
                paymentPreference,
                razorpayLink,
                razorpayConnectedAccountId,
                webhookConsent: webhookConsent || false,
                webhookUrl: webhookConsent ? webhookUrl : null,
                webhookSecretHash,
                upiId,
                phoneNumber,
                qrImageUrl,
                codNotes,
                createdAt: now,
                updatedAt: now,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Payment methods updated successfully',
            webhookUrl: webhookConsent ? webhookUrl : null,
        });
    } catch (error) {
        console.error('Error updating payment methods:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
