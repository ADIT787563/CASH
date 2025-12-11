import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, messages, leads } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { formatDistanceToNow } from 'date-fns';

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch recent orders (excluding self-subscription orders)
        const recentOrders = await db.query.orders.findMany({
            where: (orders, { and, eq, ne, isNull }) => and(
                eq(orders.userId, userId),
                // Exclude orders where the user is their own customer (Subscription payments)
                ne(orders.customerEmail, session.user.email)
            ),
            orderBy: [desc(orders.createdAt)],
            limit: 5,
        });

        // Fetch recent messages
        const recentMessages = await db.query.messages.findMany({
            where: eq(messages.userId, userId),
            orderBy: [desc(messages.createdAt)],
            limit: 5,
        });

        // Fetch recent leads
        const recentLeads = await db.query.leads.findMany({
            where: eq(leads.userId, userId),
            orderBy: [desc(leads.createdAt)],
            limit: 5,
        });

        // Normalize and merge activities
        const activities = [
            ...recentOrders.map(order => ({
                id: `order-${order.id}`,
                type: 'order',
                message: `New order from ${order.customerName} - ₹${(order.totalAmount / 100).toFixed(2)}`,
                time: new Date(order.createdAt),
                status: order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'pending' : 'error',
                original_status: order.status
            })),
            ...recentMessages.map(msg => ({
                id: `msg-${msg.id}`,
                type: 'message',
                message: `${msg.direction === 'inbound' ? 'Received' : 'Sent'} message: "${msg.content.substring(0, 30)}${msg.content.length > 30 ? '...' : ''}"`,
                time: new Date(msg.createdAt),
                status: msg.status === 'read' || msg.status === 'delivered' ? 'success' : msg.status === 'failed' ? 'error' : 'pending',
                original_status: msg.status
            })),
            ...recentLeads.map(lead => ({
                id: `lead-${lead.id}`,
                type: 'lead',
                message: `New lead generated: ${lead.name} (${lead.source})`,
                time: new Date(lead.createdAt),
                status: 'success', // Leads are generally positive
                original_status: lead.status
            }))
        ];

        // Sort by time descending and take top 10
        const sortedActivities = activities
            .sort((a, b) => b.time.getTime() - a.time.getTime())
            .slice(0, 10)
            .map(activity => ({
                ...activity,
                time: formatDistanceToNow(activity.time, { addSuffix: true })
            }));

        return NextResponse.json(sortedActivities);

    } catch (error) {
        console.error('Error fetching dashboard activity:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
