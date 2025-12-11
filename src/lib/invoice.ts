import { db } from '@/db';
import { invoices, orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function generateInvoice(orderId: number) {
    try {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: {
                // items: true // If we had relation set up
            }
        });

        if (!order) return;

        // TODO: Generate PDF
        const pdfUrl = `https://wavegroww.com/invoices/INV-${orderId}-${Date.now()}.pdf`; // Mock

        // Update DB
        await db.insert(invoices).values({
            orderId: orderId,
            userId: order.userId, // Seller
            invoiceNo: `INV-${orderId}`,
            amount: order.totalAmount,
            currency: order.currency || 'INR',
            status: 'paid',
            pdfUrl: pdfUrl,
            paidAt: new Date(),
            createdAt: new Date(),
        });

        // Update Order with Invoice URL
        await db.update(orders)
            .set({ invoiceUrl: pdfUrl, invoiceNumber: `INV-${orderId}` })
            .where(eq(orders.id, orderId));

        console.log(`✅ Invoice generated for Order #${orderId}: ${pdfUrl}`);

    } catch (error) {
        console.error('Invoice Generation Error:', error);
    }
}
