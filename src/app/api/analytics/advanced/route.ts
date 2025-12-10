import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, campaigns, messages, user } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Plan Check (Gating)
        const userRecord = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
        const plan = userRecord[0]?.plan || 'starter';

        if (!['pro', 'enterprise'].includes(plan)) {
            return NextResponse.json({
                error: 'Upgrade required',
                upgrade: true,
                message: 'Advanced Analytics is available on Pro and Enterprise plans.'
            }, { status: 403 });
        }

        const userId = session.user.id;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isoDate = thirtyDaysAgo.toISOString();

        // 2. Revenue Metrics (Last 30 Days)
        const revenueData = await db
            .select({
                totalRevenue: sql<number>`sum(${orders.totalAmount})`,
                orderCount: sql<number>`count(${orders.id})`
            })
            .from(orders)
            .where(and(
                eq(orders.userId, userId),
                eq(orders.paymentStatus, 'paid'),
                gte(orders.createdAt, isoDate)
            ));

        // 3. Campaign Performance
        const campaignStats = await db
            .select({
                totalSent: sql<number>`sum(${campaigns.sentCount})`,
                totalRead: sql<number>`sum(${campaigns.readCount})`,
                totalClicked: sql<number>`sum(${campaigns.clickedCount})`,
                count: sql<number>`count(${campaigns.id})`
            })
            .from(campaigns)
            .where(and(
                eq(campaigns.userId, userId),
                gte(campaigns.createdAt, isoDate)
            ));

        // 4. Message Volume (Usage)
        const messageStats = await db
            .select({
                count: sql<number>`count(${messages.id})`
            })
            .from(messages)
            .where(and(
                eq(messages.userId, userId),
                gte(messages.createdAt, isoDate)
            ));

        return NextResponse.json({
            period: '30d',
            revenue: {
                total: revenueData[0]?.totalRevenue || 0,
                orders: revenueData[0]?.orderCount || 0
            },
            marketing: {
                campaignsSent: campaignStats[0]?.count || 0,
                messagesSent: campaignStats[0]?.totalSent || 0,
                readRate: campaignStats[0]?.totalSent ? Math.round((campaignStats[0]?.totalRead / campaignStats[0]?.totalSent) * 100) : 0,
                clickRate: campaignStats[0]?.totalSent ? Math.round((campaignStats[0]?.totalClicked / campaignStats[0]?.totalSent) * 100) : 0
            },
            usage: {
                totalMessages: messageStats[0]?.count || 0
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
