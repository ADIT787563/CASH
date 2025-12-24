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
        ]
    });
}
