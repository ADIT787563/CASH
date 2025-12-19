import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// POST /api/invoices/generate
export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        // Basic auth check - though strictly for P0 we might relax if called from webhooks
        // For now, assume called from Dashboard UI
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // 1. Fetch Order
        const orderRecord = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
        });

        if (!orderRecord) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // 2. Check if Invoice already exists
        if (orderRecord.invoiceUrl && orderRecord.invoiceNumber) {
            return NextResponse.json({
                success: true,
                invoiceUrl: orderRecord.invoiceUrl,
                invoiceNumber: orderRecord.invoiceNumber
            });
        }

        // 3. Generate Invoice Number
        // Format: INV-{YYYYMMDD}-{ORDER_ID}
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const invoiceNumber = `INV-${dateStr}-${orderId}`;
        const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.wavegroww.online'}/invoices/${orderId}`;

        // 4. Update Order
        await db.update(orders)
            .set({
                invoiceNumber,
                invoiceUrl,
                updatedAt: new Date().toISOString()
            })
            .where(eq(orders.id, orderId));

        return NextResponse.json({
            success: true,
            invoiceUrl,
            invoiceNumber
        });

    } catch (error) {
        console.error('Invoice Generation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
