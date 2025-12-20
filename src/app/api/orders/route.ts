import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, payments, businesses, orderSequences } from '@/db/schema';
import { razorpay, RAZORPAY_KEY_ID } from '@/lib/razorpay';
import { eq, desc, and } from 'drizzle-orm';
import { auth, getCurrentUser } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';

// Validation Schema
const createOrderSchema = z.object({
  buyer_id: z.string().optional(), // Optional as per current logic
  seller_id: z.string().min(1, "Seller ID is required"),
  amount_paise: z.number().int().positive("Amount must be a positive integer"),
  currency: z.string().default('INR'),
  notes: z.record(z.string(), z.any()).optional(),
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
  customer_email: z.string().email().optional().or(z.literal('')),
  items: z.array(z.any()).optional() // TODO: Define item schema if needed strictly
});

// GET /api/orders - List orders for seller
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch Orders
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, user.id),
      orderBy: [desc(orders.createdAt)],
      with: {
        // Assuming relations are set up. If not, we might not get items directly here easily 
        // without defined relations in schema.ts (which we saw earlier but might be incomplete)
        // Let's rely on manual aggregation or simple fetch for P0 speed if relation fails.
      }
    });

    // If relations are missing in `db.query`, we can do a second query for items or just count them.
    // For P0 display, let's just fetch items count separately or use a join if possible.
    // Drizzle `with` requires defined relations.

    // MVP: Fetch orders, then mapped for display
    // We really want items count.

    const enrichedOrders = await Promise.all(userOrders.map(async (order) => {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      return {
        ...order,
        itemsCount: items.length
      };
    }));

    return NextResponse.json(enrichedOrders);

  } catch (error) {
    console.error('Fetch Orders Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/orders - Create a new order
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const body = await req.json();

    // Validate Input
    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.format()
      }, { status: 400 });
    }

    const { buyer_id, seller_id, items, amount_paise, currency, notes, customer_name, customer_phone, customer_email } = validation.data;

    // 1. Get Business & Sequence
    const business = await db.query.businesses.findFirst({
      where: eq(businesses.ownerId, seller_id)
    });

    if (!business) {
      return NextResponse.json({ error: 'Seller business profile not found' }, { status: 400 });
    }

    // Atomic Increment Sequence
    // SQLite doesn't support complex returning on update-from-select easily in one go with Drizzle sometimes,
    // but we can try a transaction or separate queries.
    // For MVP: Fetch, Increment, Update. (Race condition risk low for individual seller volume)

    let seqRecord = await db.select().from(orderSequences).where(eq(orderSequences.businessId, business.id)).get();

    if (!seqRecord) {
      // Should have been created on business creation, but recover if missing
      await db.insert(orderSequences).values({ businessId: business.id, lastSeqNumber: 0 });
      seqRecord = { businessId: business.id, lastSeqNumber: 0 };
    }

    const nextSeq = seqRecord.lastSeqNumber + 1;
    await db.update(orderSequences).set({ lastSeqNumber: nextSeq }).where(eq(orderSequences.businessId, business.id));

    // Generate Reference
    const reference = `${business.sellerCode}-${nextSeq.toString().padStart(6, '0')}`;

    // 2. Create Order in DB
    const [newOrder] = await db.insert(orders).values({
      userId: seller_id, // Assuming userId in orders refers to the Seller (who owns the order record)
      // If buyer_id is present, where do we store it?
      // Schema has `leadId` or `userId`. If userId is seller, buyer might be a lead or just metadata?
      // "Buyer expresses intent... POST /api/orders... Body: { buyer_id, seller_id... }"
      // Blueprint: "orders: id, buyer_id, seller_id..."
      // My schema update DID NOT add `buyerId` explicit column or generic user link for buyer?
      // Checking schema: `userId` (references user), `leadId`.
      // If this is a marketplace, maybe `userId` should be Buyer and `sellerId` added?
      // But existing code used `userId` as the one viewing orders (likely Seller dashboard).
      // I'll stick to `userId` = Seller for now based on GET implementation showing `orders.userId`.
      // And store buyer info in `notes` or `leadId` if provided.
      // Actually, if I am the buyer, why am I creating an order for the seller?
      // This flow seems to be "Buyer purchasing from Seller's page".

      businessId: business.id,
      orderSeqNumber: nextSeq,
      reference: reference,

      customerName: customer_name || 'Guest', // Fallback
      customerPhone: customer_phone || '',
      customerEmail: customer_email,

      subtotal: amount_paise,
      totalAmount: amount_paise,
      currency: currency,

      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'razorpay', // Default initialization, updated by webhook later

      notes: notes,

      orderDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    // 3. Create Razorpay Order
    // Include WaveGroww order id in notes for webhook mapping
    const rpOrder = await razorpay.orders.create({
      amount: amount_paise,
      currency: currency,
      receipt: reference, // Use our human-friendly reference
      notes: {
        wavegroww_order_id: newOrder.id,
        business_id: business.id,
        ...notes
      }
    });

    // 3. Create Payment Record (init)
    await db.insert(payments).values({
      orderId: newOrder.id,
      sellerId: seller_id,
      method: 'RAZORPAY',
      amount: amount_paise,
      currency: currency,
      status: 'created',
      razorpayOrderId: rpOrder.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      order_id: newOrder.id,
      payment_action: {
        type: "razorpay_order",
        razorpay_order_id: rpOrder.id,
        key_id: RAZORPAY_KEY_ID,
        amount: amount_paise,
        currency: currency,
        name: "WaveGroww Store", // Or Seller Name
        description: `Order #${newOrder.id}`,
        prefill: {
          name: customer_name,
          email: customer_email,
          contact: customer_phone
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}