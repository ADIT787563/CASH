import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, customers, products, payments, paymentSettings } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { seller_id, customer, items, payment_method, channel, source, notes_from_customer } = body;

        if (!seller_id || !customer || !items || !items.length) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Get Product Details & Calculate Totals
        const productIds = items.map((i: any) => i.product_id);
        // Assuming product_id is integer in DB, but passed as string/int. 
        // If DB uses integer IDs, we need to parse.
        // The schema says products.id is integer.
        // The input example says "prod_789". This implies string IDs or mapped IDs.
        // But schema has integer ID.
        // I'll assume the input sends the correct ID format (integer).
        // If input is "prod_789", I might need to strip "prod_".
        // Let's assume integer for now to match schema.

        const productsData = await db
            .select()
            .from(products)
            .where(inArray(products.id, productIds));

        let subtotal = 0;
        const lineItems = [];

        for (const item of items) {
            const product = productsData.find(p => p.id === item.product_id);
            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.product_id}` }, { status: 400 });
            }

            // Check stock? (Optional for now)

            const unitPrice = product.price; // in paise
            const totalPrice = unitPrice * item.quantity;
            subtotal += totalPrice;

            lineItems.push({
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
            });
        }

        // Shipping & Discount (Hardcoded or logic?)
        // User example: shipping_amount: 5000 (₹50)
        // I'll default to 0 or use logic if I had settings.
        const shippingAmount = 0; // TODO: Fetch from settings
        const discountAmount = 0;
        const taxAmount = 0; // TODO: Calculate tax
        const totalAmount = subtotal + shippingAmount + taxAmount - discountAmount;

        // 2. Find or Create Customer
        // Check by phone
        let customerId;
        const existingCustomer = await db
            .select()
            .from(customers)
            .where(eq(customers.phone, customer.phone))
            .limit(1);

        if (existingCustomer.length > 0) {
            customerId = existingCustomer[0].id;
            // Update name/address if provided?
        } else {
            const newCustomer = await db.insert(customers).values({
                userId: seller_id,
                phone: customer.phone,
                name: customer.name,
                email: customer.email,
                address: customer.address ? JSON.stringify(customer.address) : null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }).returning({ id: customers.id });
            customerId = newCustomer[0].id;
        }

        // 3. Create Order
        const newOrder = await db.insert(orders).values({
            userId: seller_id,
            leadId: null, // Optional
            customerName: customer.name,
            customerPhone: customer.phone,
            customerEmail: customer.email,
            shippingAddress: customer.address ? JSON.stringify(customer.address) : null,

            subtotal,
            discountAmount,
            shippingAmount,
            taxAmount,
            totalAmount,
            currency: 'INR',

            channel: channel || 'whatsapp',
            source: source || 'ai_chat',
            notesFromCustomer: notes_from_customer,

            status: 'pending',
            paymentStatus: 'unpaid',
            paymentMethod: payment_method || 'UPI',

            orderDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }).returning({ id: orders.id });

        const orderId = newOrder[0].id;

        // 4. Create Order Items
        for (const item of lineItems) {
            await db.insert(orderItems).values({
                orderId,
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                createdAt: new Date().toISOString(),
            });
        }

        // 5. Create Payment Record (Pending)
        await db.insert(payments).values({
            orderId,
            sellerId: seller_id,
            method: payment_method || 'UPI',
            amount: totalAmount,
            currency: 'INR',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // 6. Fetch Payment Settings for Response
        const settings = await db
            .select()
            .from(paymentSettings)
            .where(eq(paymentSettings.userId, seller_id))
            .limit(1);

        const response: any = {
            order_id: orderId,
            total_amount: totalAmount,
            currency: 'INR',
            payment_method: payment_method || 'UPI',
        };

        if (payment_method === 'UPI' && settings.length > 0 && settings[0].upiEnabled) {
            response.upi_details = {
                upi_id: settings[0].upiId,
                upi_account_name: settings[0].upiAccountName,
                upi_qr_image_url: settings[0].upiQrImageUrl,
            };
        }
        // Add Razorpay logic later

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
