import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, sellerPaymentMethods } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const orderId = parseInt(id);

        if (isNaN(orderId)) {
            return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
        }

        // Fetch Order
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Fetch Items
        const items = await db.query.orderItems.findMany({
            where: eq(orderItems.orderId, orderId),
        });

        // Fetch Seller Payment Methods (for UPI ID / QR)
        const paymentInfo = await db.query.sellerPaymentMethods.findFirst({
            where: eq(sellerPaymentMethods.sellerId, order.userId),
        });

        // Construct safe response
        return NextResponse.json({
            order: {
                id: order.id,
                reference: order.reference,
                totalAmount: order.totalAmount,
                status: order.status,
                paymentStatus: order.paymentStatus,
                customerName: order.customerName,
                createdAt: order.createdAt,
            },
            items: items.map(i => ({
                id: i.id,
                productName: i.productName,
                quantity: i.quantity,
                unitPrice: i.unitPrice
            })),
            sellerPayment: paymentInfo ? {
                upiId: paymentInfo.upiId,
                qrImageUrl: paymentInfo.qrImageUrl,
                razorpayEnabled: !!paymentInfo.razorpayKeyId,
            } : null
        });

    } catch (error) {
        console.error('Error fetching public order details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
