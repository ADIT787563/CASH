import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analytics } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const conditions = [eq(analytics.userId, session.user.id)];
        if (startDate) conditions.push(gte(analytics.date, startDate));
        if (endDate) conditions.push(lte(analytics.date, endDate));

        const data = await db.select()
            .from(analytics)
            .where(and(...conditions))
            .orderBy(desc(analytics.date));

        if (data.length === 0) {
            return new Response("No data found for the selected range", { status: 404 });
        }

        // Generate CSV
        const headersArr = [
            "Date",
            "Total Messages",
            "Inbound",
            "Outbound",
            "New Leads",
            "Converted Leads",
            "Total Orders",
            "Paid Orders",
            "Revenue (INR)",
            "Unique Conversations"
        ];

        const rows = data.map(item => [
            item.date,
            item.totalMessages,
            item.inboundMessages,
            item.outboundMessages,
            item.newLeads,
            item.convertedLeads,
            item.totalOrders,
            item.paidOrders,
            (item.totalRevenue || 0) / 100,
            item.uniqueConversations
        ]);

        const csvContent = [
            headersArr.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        return new Response(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="analytics_export_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

    } catch (error) {
        console.error("Export failed:", error);
        return new Response("Export failed", { status: 500 });
    }
}
