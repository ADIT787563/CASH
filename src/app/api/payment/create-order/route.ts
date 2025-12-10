import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/db';
import { orders, payments, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { planId, billingCycle, amount, couponCode } = body;

        // Validate input
        if (!planId || !billingCycle || amount === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create Order record in DB (SaaS Subscription)
        const newOrder = await db.insert(orders).values({
            userId: session.user.id,
            customerName: session.user.name || 'SaaS User',
            customerPhone: 'N/A', // SaaS internal order
            customerEmail: session.user.email,
            subtotal: Math.round(amount * 100),
            totalAmount: Math.round(amount * 100),
            status: 'pending',
            paymentStatus: 'unpaid',
            source: 'subscription',
            channel: 'web',
            notesInternal: `Plan: ${planId}, Cycle: ${billingCycle}`,
            orderDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }).returning({ id: orders.id });

        const dbOrderId = newOrder[0].id;

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: `order_${dbOrderId}`,
            notes: {
                planId,
                billingCycle,
                couponCode: couponCode || '',
                wavegroww_order_id: dbOrderId.toString(),
            },
        };

        const order = await razorpay.orders.create(options);

        // Create Payment record
        await db.insert(payments).values({
            orderId: dbOrderId,
            sellerId: session.user.id, // User paying is the 'seller' context here
            method: 'RAZORPAY',
            amount: Math.round(amount * 100),
            currency: 'INR',
            status: 'PENDING',
            gatewayOrderId: order.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            success: true,
        });
    } catch (error: any) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create order' },
            { status: 500 }
        );
    }
}
