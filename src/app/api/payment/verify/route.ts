import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user, subscriptions, invoices, paymentRecords } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planId,
            billingCycle,
            amount // Assuming amount is passed from frontend or we should fetch order amount
        } = body;

        // Get user session
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Validate input
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing payment details' },
                { status: 400 }
            );
        }

        // Verify signature
        const secret = process.env.RAZORPAY_KEY_SECRET || '';
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        if (billingCycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        const paymentAmount = amount ? parseInt(amount) * 100 : 0; // Convert to paise if needed, assume amount is in INR if passed

        // TRANSACTION: Update User, Create Subscription, Invoice, Payment Record
        await db.transaction(async (tx) => {
            // 1. Update User Plan
            await tx.update(user)
                .set({
                    plan: planId,
                    updatedAt: new Date()
                })
                .where(eq(user.id, session.user.id));

            // 2. Create Subscription Record
            const [newSubscription] = await tx.insert(subscriptions).values({
                userId: session.user.id,
                planId: planId,
                status: 'active',
                provider: 'razorpay',
                providerSubscriptionId: razorpay_order_id, // Using order_id as ref for prepaid
                currentPeriodStart: startDate,
                currentPeriodEnd: endDate,
            }).returning();

            // 3. Create Invoice
            const [newInvoice] = await tx.insert(invoices).values({
                userId: session.user.id,
                subscriptionId: newSubscription.id,
                amount: paymentAmount,
                currency: 'INR',
                status: 'paid',
                paidAt: new Date(),
            }).returning();

            // 4. Create Payment Record
            await tx.insert(paymentRecords).values({
                userId: session.user.id,
                invoiceId: newInvoice.id,
                amount: paymentAmount,
                currency: 'INR',
                status: 'success',
                method: 'razorpay',
                providerPaymentId: razorpay_payment_id,
                metadata: {
                    order_id: razorpay_order_id,
                    signature: razorpay_signature,
                    billing_cycle: billingCycle
                }
            });
        });

        console.log('Payment verified and records created:', {
            userId: session.user.id,
            planId,
            orderId: razorpay_order_id
        });

        return NextResponse.json({
            success: true,
            message: 'Payment verified and subscription activated',
            subscription: {
                planId,
                billingCycle,
                startDate,
                endDate,
            },
        });
    } catch (error: any) {
        console.error('Verify payment error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
