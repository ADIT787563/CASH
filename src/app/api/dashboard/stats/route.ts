import { NextResponse } from "next/server";

export async function GET() {
    // Simulate DB fetch
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Mock Dynamic Data
    return NextResponse.json({
        topStats: {
            messages: 142,
            leads: 28,
            orders: 12,
            revenue: 15400
        },
        inboxStats: {
            totalOrders: 45,
            messagesAutomated: 1289,
            paymentsReceived: 14,
            conversionRate: 3.2
        },
        chartData: [
            { name: "Mon", value: 4000 },
            { name: "Tue", value: 3000 },
            { name: "Wed", value: 2000 },
            { name: "Thu", value: 2780 },
            { name: "Fri", value: 1890 },
            { name: "Sat", value: 2390 },
            { name: "Sun", value: 3490 },
        ],
        // New Data for Redesign
        actionItems: [
            { type: "warning", message: "3 products are out of stock", link: "/catalog" },
            { type: "info", message: "12 unread messages", link: "/dashboard/inbox" },
            { type: "urgent", message: "No catalog shared today", link: "/dashboard/leads" },
            { type: "warning", message: "Automation disabled for 2 FAQs", link: "/dashboard/auto-replies" }
        ],
        funnelData: [
            { step: "Total Messages", count: 1240, dropoff: 0 },
            { step: "Leads Detected", count: 850, dropoff: 31 },
            { step: "Catalog Viewed", count: 620, dropoff: 27 },
            { step: "Added to Cart", count: 140, dropoff: 77 },
            { step: "Orders Placed", count: 45, dropoff: 68 }
        ],
        aiInsights: [
            { type: "trend", text: "Customers ask about 'price' 38% of the time", sentiment: "neutral" },
            { type: "suggestion", text: "Recommend increasing stock for 'Blue T-Shirt' based on demand", sentiment: "positive" },
            { type: "insight", text: "Discounts improved conversion by 12% last week", sentiment: "positive" }
        ]
    });
}
