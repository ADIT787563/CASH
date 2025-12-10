import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { WhatsAppClient } from '@/lib/whatsapp';

// POST /api/orders/[id]/resend-link
// Button 10: Resend payment link/options to buyer
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orderId = parseInt(id);

        // Fetch order
        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Verify ownership (Seller can resend)
        if (order.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Logic to construct the link message again
        // In a real system, we might regenerate a Razorpay link if expired.
        // For now, we resend the message via WhatsApp System Client (or Email).

        // This assumes we stored info or reconstruct it.
        // Simple placeholder logic:
        const link = order.invoiceUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}`;
        const message = `Payment Reminder: Please complete your payment for Order #${orderId}. Link: ${link}`;

        // Send via WhatsApp
        // TODO: Ensure we have buyer phone. 'customerPhone'.
        if (order.customerPhone) {
            const systemClient = WhatsAppClient.getSystemClient();
            await systemClient.sendTextMessage(order.customerPhone, message);
        }

        return NextResponse.json({
            success: true,
            message: 'Payment link resent successfully'
        });

    } catch (error) {
        console.error('Resend Link Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
