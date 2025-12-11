
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, customers, orders, orderItems, products, payments } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Helper to sanitize logic
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { slug, items, customer } = body;

        // 1. Validation
        if (!slug || !items || !Array.isArray(items) || items.length === 0 || !customer) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }
        if (!customer.phone || !customer.name) {
            return NextResponse.json({ error: "Customer name and phone are required" }, { status: 400 });
        }

        // 2. Find Business (Seller)
        const businessFn = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
        if (businessFn.length === 0) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }
        const seller = businessFn[0];
        const sellerId = seller.ownerId; // orders.userId = sellerId

        // 3. Find Products & Calculate Total
        const productIds = items.map((i: any) => i.id);
        const productsList = await db.select().from(products)
            .where(inArray(products.id, productIds));

        let subtotal = 0;
        const finalItems = [];

        // Map items to latest prices
        for (const item of items) {
            const product = productsList.find(p => p.id === item.id);
            if (!product) continue;

            if (product.stock < item.quantity) {
                return NextResponse.json({ error: `Product ${product.name} is out of stock` }, { status: 400 });
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            finalItems.push({
                productId: product.id,
                price: product.price,
                quantity: item.quantity,
                totalPrice: itemTotal
            });
        }

        if (subtotal === 0) {
            return NextResponse.json({ error: "Invalid order items" }, { status: 400 });
        }

        // 4. Upsert Customer
        // Check if customer exists for this seller
        // Ideally match by Phone
        // For SQLite simple approach: Select by phone, if not insert.
        // Schema: customers.userId is Seller.
        const existingCust = await db.select().from(customers)
            .where(eq(customers.phone, customer.phone)) // This might find other seller's customer if not filtered by userId? 
        // Schema has `userId` as seller ref. We should filter by both.
        // But lets keep it simple: if phone exists for this seller.
        // Wait, schema check: customers table has userId (seller). 
        // Let's filter: .where(and(eq(customers.userId, sellerId), eq(customers.phone, customer.phone)))

        // For now, simple insert or update logic:
        // We will create a fresh customer or update existing.
        let customerId;
        // Since we don't have composite keys or complex lookup, let's just create a new one for specificity of this order
        // or try to reuse to keep history.
        // Check if customer exists for this seller
        const existingCustList = await db.select().from(customers)
            .where(
                and(
                    eq(customers.userId, sellerId),
                    eq(customers.phone, customer.phone)
                )
            )
            .limit(1);

        if (existingCustList.length > 0) {
            customerId = existingCustList[0].id;
            // Update address
            await db.update(customers).set({
                name: customer.name,
                address: customer.address,
                email: customer.email,
                updatedAt: new Date().toISOString()
            }).where(eq(customers.id, customerId));
        } else {
            const res = await db.insert(customers).values({
                userId: sellerId,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }).returning();
            customerId = res[0].id;
        }

        // 5. Create Order
        const [newOrder] = await db.insert(orders).values({
            userId: sellerId, // Seller
            customerId: customerId,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerEmail: customer.email,
            shippingAddress: customer.address,

            subtotal: subtotal,
            totalAmount: subtotal, // Add tax/shipping logic here if needed
            status: 'pending',
            paymentStatus: 'unpaid',
            source: 'storefront',

            orderDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }).returning();

        // 6. Create Order Items
        for (const fi of finalItems) {
            await db.insert(orderItems).values({
                orderId: newOrder.id,
                productId: fi.productId,
                quantity: fi.quantity,
                unitPrice: fi.price,
                totalPrice: fi.totalPrice,
                createdAt: new Date().toISOString()
            });
        }

        // 7. Initialize Razorpay Order
        const amountInPaise = Math.round(subtotal * 100);
        const rzOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `ord_${newOrder.id}`,
            notes: {
                wavegroww_order_id: newOrder.id.toString(), // CRITICAL for Webhook
                store_slug: slug,
                type: 'store_order'
            }
        });

        // 8. Create Payment Record (Pending)
        await db.insert(payments).values({
            orderId: newOrder.id,
            sellerId: sellerId,
            method: 'RAZORPAY',
            amount: amountInPaise,
            currency: 'INR',
            status: 'created',
            gatewayOrderId: rzOrder.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            orderId: newOrder.id,
            razorpayOrderId: rzOrder.id,
            amount: amountInPaise,
            currency: 'INR',
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        });

    } catch (error: any) {
        console.error("Checkout Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process checkout" }, { status: 500 });
    }
}
