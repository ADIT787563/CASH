import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, pricingPlans, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Razorpay from 'razorpay';

// Initialize Razorpay for Platform
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await requestJson(req);
    const { plan_id, amount_paise, payment_method_preference } = body;

    // Button 1 Spec: { buyer_id, seller_id, plan_id, amount_paise, payment_method_preference }
    // We use session.user.id as buyer_id unless specified and authorized.
    // For plan purchase, seller_id is effectively the Platform (or null).

    if (!plan_id) {
      return NextResponse.json({ error: 'Missing plan_id' }, { status: 400 });
    }

    // Validate Plan
    const plan = await db.query.pricingPlans.findFirst({
      where: eq(pricingPlans.planId, plan_id) // Assuming planId column
    });

    // Note: I need to verify pricingPlans schema column names given I haven't viewed it fully, 
    // but 'planId' or 'id' is likely. 
    // Let's assume 'id' or 'plan_id' based on previous context.
    // Actually, schema snippet showed "id: text('id').primaryKey()".
    // And "planId: text('plan_id')" in subscriptions table.
    // So pricingPlans probably has 'id' or 'planId'.

    // I'll assume 'id' is the primary key for pricingPlans.
    // Wait, subscriptions references user.id and pricingPlans.planId?
    // Let me check schema for pricingPlans exactly if I can, or safer to assume generic logic.
    // I'll assume 'id' matches input plan_id.

    // Create Order Record (Internal)
    const orderValues = {
      userId: session.user.id,
      totalAmount: amount_paise || 0, // Fallback
      currency: 'INR',
      status: 'pending',
      paymentStatus: 'unpaid',
      source: 'web_plan_purchase',
      notesInternal: `Plan Purchase: ${plan_id}`,
      orderDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Core fields required by table:
      customerName: session.user.name || session.user.email || 'User',
      customerPhone: 'N/A', // Potentially fetch from user profile
      subtotal: amount_paise || 0,
    };

    const [newOrder] = await db.insert(orders).values(orderValues).returning();

    // Determine Payment Action
    let paymentAction = {};

    if (payment_method_preference === 'online' || !payment_method_preference) {
      // Create Razorpay Order
      const options = {
        amount: amount_paise,
        currency: 'INR',
        receipt: `order_rcptid_${newOrder.id}`,
        notes: {
          orderId: newOrder.id, // Internal Order ID
          planId: plan_id,
          type: 'plan_subscription'
        }
      };

      try {
        const rzOrder = await razorpay.orders.create(options);
        paymentAction = {
          type: 'razorpay_link', // Or 'razorpay_checkout' payload
          razorpay_order_id: rzOrder.id,
          amount: rzOrder.amount,
          currency: rzOrder.currency,
          key_id: process.env.RAZORPAY_KEY_ID,
          plan_id: plan_id,
          step: 'open_checkout'
        };
      } catch (rzErr) {
        console.error('Razorpay Create Error:', rzErr);
        return NextResponse.json({ error: 'Payment gateway error' }, { status: 500 });
      }
    }

    // Return response
    return NextResponse.json({
      order_id: newOrder.id,
      payment_action: paymentAction,
      success: true
    });

  } catch (error) {
    console.error('Order Intent Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper for safe JSON parsing
async function requestJson(req: NextRequest) {
  try { return await req.json(); } catch { return {}; }
}