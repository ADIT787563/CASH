import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, customers, products, payments, sellerPaymentMethods } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { seller_id, customer, items, payment_method, channel, source, notes_from_customer } = body;

        if (!seller_id || !customer || !items || !items.length) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Get Seller's Payment Preferences FIRST
        const sellerPayment = await db
            .select()
            .from(sellerPaymentMethods)
            .where(eq(sellerPaymentMethods.sellerId, seller_id))
            .limit(1);

        const paymentPreference = sellerPayment[0]?.paymentPreference || 'both';
        const razorpayLink = sellerPayment[0]?.razorpayLink;
        const upiId = sellerPayment[0]?.upiId;
        const sellerPhone = sellerPayment[0]?.phoneNumber;
        const qrImageUrl = sellerPayment[0]?.qrImageUrl;
        const codNotes = sellerPayment[0]?.codNotes;
        const webhookConsent = sellerPayment[0]?.webhookConsent;

        // 2. Get Product Details & Calculate Totals
        const productIds = items.map((i: any) => i.product_id);
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

            const unitPrice = product.price;
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

        const shippingAmount = 0;
        const discountAmount = 0;
        const taxAmount = 0;
        const totalAmount = subtotal + shippingAmount + taxAmount - discountAmount;

        // 3. Find or Create Customer
        let customerId;
        const existingCustomer = await db
            .select()
            .from(customers)
            .where(eq(customers.phone, customer.phone))
            .limit(1);

        if (existingCustomer.length > 0) {
            customerId = existingCustomer[0].id;
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

        // 4. Determine payment method and status based on seller preference
        let finalPaymentMethod = payment_method;
        let orderStatus = 'pending';
        let paymentStatus = 'unpaid';

        // Validate payment method against seller preference
        if (payment_method === 'cod') {
            if (paymentPreference === 'online') {
                return NextResponse.json({ error: 'Seller does not accept COD' }, { status: 400 });
            }
            orderStatus = 'pending';
            paymentStatus = 'pending_cod';
        } else if (payment_method === 'razorpay' || payment_method === 'upi') {
            if (paymentPreference === 'cod') {
                return NextResponse.json({ error: 'Seller accepts COD only' }, { status: 400 });
            }
        }

        // 5. Create Order
        const newOrder = await db.insert(orders).values({
            userId: seller_id,
            leadId: null,
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
            status: orderStatus,
            paymentStatus: paymentStatus,
            paymentMethod: finalPaymentMethod || null,
            orderDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }).returning({ id: orders.id });

        const orderId = newOrder[0].id;

        // 6. Create Order Items
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

        // 7. Create Payment Record
        await db.insert(payments).values({
            orderId,
            sellerId: seller_id,
            method: finalPaymentMethod || 'PENDING',
            amount: totalAmount,
            currency: 'INR',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // 8. Build Payment Options Response
        const paymentOptions: any = {
            preference: paymentPreference,
            available: [],
        };

        // Online payment options
        if (paymentPreference === 'online' || paymentPreference === 'both') {
            // Razorpay
            if (razorpayLink) {
                paymentOptions.available.push({
                    method: 'razorpay',
                    type: 'online',
                    link: razorpayLink,
                    autoVerify: webhookConsent === true,
                    instructions: 'Pay securely online. Payment will be confirmed automatically.',
                });
            }

            // UPI
            if (upiId || qrImageUrl) {
                const upiDeepLink = upiId
                    ? `upi://pay?pa=${upiId}&pn=Order${orderId}&am=${(totalAmount / 100).toFixed(2)}&cu=INR&tn=Order_${orderId}`
                    : null;

                paymentOptions.available.push({
                    method: 'upi',
                    type: 'online',
                    upiId: upiId || null,
                    deepLink: upiDeepLink,
                    qrImageUrl: qrImageUrl || null,
                    autoVerify: false,
                    requiresManualConfirmation: true,
                    instructions: 'Pay via UPI (GPay/PhonePe/Paytm). After payment, upload screenshot for seller confirmation.',
                });
            }
        }

        // COD option
        if (paymentPreference === 'cod' || paymentPreference === 'both') {
            paymentOptions.available.push({
                method: 'cod',
                type: 'offline',
                autoVerify: false,
                notes: codNotes || 'Pay cash on delivery',
                instructions: 'Pay when you receive your order. No advance payment needed.',
            });
        }

        // Verification policy
        paymentOptions.verificationPolicy = {
            razorpay: 'Automatic verification via Razorpay webhook',
            upi: 'Manual confirmation required - upload payment proof, seller confirms',
            cod: 'Confirmed on delivery by seller/delivery person',
        };

        return NextResponse.json({
            success: true,
            order_id: orderId,
            status: orderStatus,
            payment_status: paymentStatus,
            total_amount: totalAmount,
            total_amount_display: `₹${(totalAmount / 100).toFixed(2)}`,
            currency: 'INR',
            payment_options: paymentOptions,
            items: lineItems.map(item => ({
                name: item.productName,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total: item.totalPrice,
            })),
        });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
