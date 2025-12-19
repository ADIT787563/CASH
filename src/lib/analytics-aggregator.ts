import { db } from "@/db";
import { analytics, orders, messages, leads, messageQueue, orderItems } from "@/db/schema";
import { eq, and, sql, like, desc } from "drizzle-orm";

/**
 * Aggregates business data for a specific user and date into the analytics table.
 * @param userId - The ID of the user (business owner)
 * @param date - The date in YYYY-MM-DD format
 */
export async function aggregateDailyStats(userId: string, date: string) {
    try {
        const datePattern = `${date}%`;

        // 1. Inbound Messages
        const inboundRes = await db.select({ count: sql<number>`count(*)` })
            .from(messages)
            .where(and(
                eq(messages.userId, userId),
                eq(messages.direction, 'inbound'),
                like(messages.createdAt, datePattern)
            ));

        // 2. Outbound Messages
        const outboundRes = await db.select({ count: sql<number>`count(*)` })
            .from(messages)
            .where(and(
                eq(messages.userId, userId),
                eq(messages.direction, 'outbound'),
                like(messages.createdAt, datePattern)
            ));

        // 3. New Leads
        const leadsRes = await db.select({ count: sql<number>`count(*)` })
            .from(leads)
            .where(and(
                eq(leads.userId, userId),
                like(leads.createdAt, datePattern)
            ));

        // 4. Converted Leads (Leads that have at least one order)
        // This is a bit complex for a single utility, let's stick to status 'converted' if available
        const convertedLeadsRes = await db.select({ count: sql<number>`count(*)` })
            .from(leads)
            .where(and(
                eq(leads.userId, userId),
                eq(leads.status, 'converted'),
                like(leads.updatedAt, datePattern)
            ));

        // 5. Total Orders & Revenue & Paid Orders
        const ordersRes = await db.select({
            count: sql<number>`count(*)`,
            paidCount: sql<number>`count(CASE WHEN ${orders.paymentStatus} = 'paid' THEN 1 END)`,
            revenue: sql<number>`sum(${orders.totalAmount})`
        })
            .from(orders)
            .where(and(
                eq(orders.userId, userId),
                sql`${orders.status} != 'cancelled'`,
                like(orders.createdAt, datePattern)
            ));

        // 6. Unique Conversations (Unique Customers)
        const uniqueConvRes = await db.select({ count: sql<number>`count(DISTINCT ${messages.customerId})` })
            .from(messages)
            .where(and(
                eq(messages.userId, userId),
                like(messages.createdAt, datePattern)
            ));

        const inbound = inboundRes[0]?.count || 0;
        const outbound = outboundRes[0]?.count || 0;
        const newLeadsCount = leadsRes[0]?.count || 0;
        const convertedLeads = convertedLeadsRes[0]?.count || 0;
        const totalOrders = ordersRes[0]?.count || 0;
        const paidOrders = ordersRes[0]?.paidCount || 0;
        const totalRevenue = ordersRes[0]?.revenue || 0;
        const uniqueConversations = uniqueConvRes[0]?.count || 0;

        // 7. Failure Reasons Categorization
        const failuresRes = await db.select({
            errorCode: messageQueue.errorCode,
            count: sql<number>`count(*)`
        })
            .from(messageQueue)
            .where(and(
                eq(messageQueue.userId, userId),
                eq(messageQueue.status, 'failed'),
                like(messageQueue.updatedAt, datePattern)
            ))
            .groupBy(messageQueue.errorCode);

        const failureReasons: Record<string, number> = {
            'RATE_LIMIT': 0,
            'RECIPIENT_ERROR': 0,
            'TEMPLATE_REJECTED': 0,
            'SYSTEM_FAILURE': 0,
            'OTHER': 0
        };

        failuresRes.forEach(f => {
            const code = f.errorCode || '';
            if (code.includes('RATE') || code.includes('THROTTLING')) {
                failureReasons['RATE_LIMIT'] += f.count;
            } else if (code.includes('BLOCKED') || code.includes('1006')) {
                failureReasons['RECIPIENT_ERROR'] += f.count;
            } else if (code.includes('TEMPLATE') || code.includes('470')) {
                failureReasons['TEMPLATE_REJECTED'] += f.count;
            } else if (code.includes('NETWORK') || code.includes('DOWN') || code.includes('TIMEOUT') || code.includes('API')) {
                failureReasons['SYSTEM_FAILURE'] += f.count;
            } else {
                failureReasons['OTHER'] += f.count;
            }
        });

        // 8. Top Performing Products
        const productsRes = await db.select({
            id: orderItems.productId,
            name: orderItems.productName,
            sales: sql<number>`count(*)`,
            revenue: sql<number>`sum(${orderItems.totalPrice})`
        })
            .from(orderItems)
            .innerJoin(orders, eq(orderItems.orderId, orders.id))
            .where(and(
                eq(orders.userId, userId),
                like(orders.createdAt, datePattern)
            ))
            .groupBy(orderItems.productId, orderItems.productName)
            .orderBy(desc(sql`revenue`))
            .limit(10);

        const topProducts = productsRes.map(p => ({
            id: p.id,
            name: p.name,
            sales: p.sales,
            revenue: p.revenue
        }));

        // Upsert into analytics table
        // SQLite onConflictDoUpdate
        await db.insert(analytics)
            .values({
                userId,
                date,
                totalMessages: inbound + outbound,
                inboundMessages: inbound,
                outboundMessages: outbound,
                newLeads: newLeadsCount,
                convertedLeads,
                totalOrders,
                paidOrders,
                totalRevenue,
                uniqueConversations,
                failureReasons,
                topProducts,
                createdAt: new Date().toISOString()
            })
            .onConflictDoUpdate({
                target: [analytics.userId, analytics.date], // Requires unique index on (userId, date)
                set: {
                    totalMessages: inbound + outbound,
                    inboundMessages: inbound,
                    outboundMessages: outbound,
                    newLeads: newLeadsCount,
                    convertedLeads,
                    totalOrders,
                    paidOrders,
                    totalRevenue,
                    uniqueConversations,
                    failureReasons,
                    topProducts,
                }
            });

        return { success: true, date, userId };
    } catch (error) {
        console.error(`Error aggregating stats for ${userId} on ${date}:`, error);
        throw error;
    }
}
