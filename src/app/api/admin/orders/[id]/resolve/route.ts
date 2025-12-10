import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// POST /api/admin/orders/[id]/resolve
// Button 12: Admin Manual Resolve
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

        // TODO: Strict Admin Role Check
        // if (session.user.role !== 'admin') return 403...

        const orderId = parseInt(id);
        const body = await request.json();
        const { action, note } = body;

        const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        let updates: any = {
            notesInternal: `${order.notesInternal || ''} | ADMIN RESOLVE: ${action} - ${note || ''}`,
            updatedAt: new Date().toISOString()
        };

        if (action === 'mark_paid') {
            updates.paymentStatus = 'paid';
            updates.status = 'confirmed';
        } else if (action === 'mark_failed') {
            updates.paymentStatus = 'failed';
        } else if (action === 'request_info') {
            // Just adds note, maybe status 'on_hold'
            updates.status = 'on_hold';
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await db.update(orders).set(updates).where(eq(orders.id, orderId));

        return NextResponse.json({ success: true, action, order_id: orderId });

    } catch (error) {
        console.error('Admin Resolve Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
