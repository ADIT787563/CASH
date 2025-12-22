import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user, subscriptions, invoices, payments, orders, paymentRecords } from '@/db/schema';
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
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error("RAZORPAY_KEY_SECRET is not defined in environment variables.");
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            console.error("Payment Signature Verification Failed");
            console.error(`Received: ${razorpay_signature}`);
            console.error(`Generated: ${generated_signature}`);
            return NextResponse.json(
                { error: 'Invalid payment signature', detail: 'Signature mismatch' },
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

        console.log('--------------------------------------------------');
        console.log('PAYMENT VERIFY STARTED');
        console.log(`Order ID: ${razorpay_order_id}`);
        console.log(`Payment ID: ${razorpay_payment_id}`);

        // Find the initial pending payment record
        const [pendingPayment] = await db.select()
            .from(payments)
            .where(eq(payments.gatewayOrderId, razorpay_order_id))
            .limit(1);

        if (!pendingPayment) {
            console.error("No pending payment found for Razorpay Order ID:", razorpay_order_id);
            // Fallback: Check if it exists in 'metadata' of any successful payment (edge case)
            return NextResponse.json({ error: 'Order not found in system' }, { status: 404 });
        }

        if (pendingPayment.status === 'captured' || pendingPayment.status === 'success') {
            console.log("Payment already captured. Returning success (Idempotency).");
            return NextResponse.json({
                success: true,
                message: 'Payment already verified',
                invoiceId: (await db.select().from(paymentRecords).where(eq(paymentRecords.providerPaymentId, razorpay_payment_id)).limit(1))[0]?.invoiceId
            });
        }

        const paymentAmount = pendingPayment.amount;

        let newInvoiceId: string | null = null;
        let newSubscriptionId: string | null = null;

        // TRANSACTION: Update User, Create Subscription, Invoice, Update Payment Record
        await db.transaction(async (tx) => {
            // 1. Update User Plan
            await tx.update(user)
                .set({
                    plan: planId,
                    updatedAt: new Date(),
                    subscriptionStatus: 'active' // Important Update
                })
                .where(eq(user.id, session.user.id));

            // 2. Update Original Order Status
            await tx.update(orders)
                .set({
                    status: 'completed',
                    paymentStatus: 'paid',
                    updatedAt: new Date().toISOString()
                })
                .where(eq(orders.id, pendingPayment.orderId));

            // 3. Create Subscription Record
            const [newSubscription] = await tx.insert(subscriptions).values({
                userId: session.user.id,
                planId: planId,
                status: 'active',
                provider: 'razorpay',
                providerSubscriptionId: razorpay_order_id, // Using order_id as ref for prepaid
                startDate: startDate.toISOString(),
                currentPeriodStart: startDate.toISOString(),
                currentPeriodEnd: endDate.toISOString(),
            }).returning();

            newSubscriptionId = newSubscription.id;

            // 4. Create Invoice
            const [newInvoice] = await tx.insert(invoices).values({
                userId: session.user.id,
                subscriptionId: newSubscription.id,
                amount: paymentAmount,
                currency: 'INR',
                status: 'paid',
                paidAt: new Date(),
                orderId: pendingPayment.orderId // Link invoice to order
            }).returning();

            newInvoiceId = newInvoice.id;

            // 5. Create Payment Record (Receipt)
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

            // 6. Update Payment Transaction Status
            await tx.update(payments)
                .set({
                    status: 'captured',
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    updatedAt: new Date().toISOString()
                })
                .where(eq(payments.id, pendingPayment.id));
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
            invoiceId: newInvoiceId,
            subscriptionId: newSubscriptionId,
        });
    } catch (error: any) {
        console.error('Verify payment error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
