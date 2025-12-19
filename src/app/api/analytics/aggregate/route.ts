import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { aggregateDailyStats } from "@/lib/analytics-aggregator";

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { date, startDate, endDate } = body;

        // Mode 1: Single Date
        if (date) {
            const result = await aggregateDailyStats(session.user.id, date);
            return NextResponse.json(result);
        }

        // Mode 2: Range (Backfill)
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const results = [];

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const res = await aggregateDailyStats(session.user.id, dateStr);
                results.push(res);
            }

            return NextResponse.json({ success: true, count: results.length, results });
        }

        // Default: Today
        const today = new Date().toISOString().split('T')[0];
        const result = await aggregateDailyStats(session.user.id, today);
        return NextResponse.json(result);

    } catch (error) {
        console.error("Aggregation API error:", error);
        return NextResponse.json({ error: "Aggregation failed", details: (error as Error).message }, { status: 500 });
    }
}
