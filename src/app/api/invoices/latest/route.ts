import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const latestInvoice = await db.query.invoices.findFirst({
            where: eq(invoices.userId, session.user.id),
            orderBy: [desc(invoices.createdAt)],
        });

        if (!latestInvoice) {
            return NextResponse.json({ invoiceId: null });
        }

        return NextResponse.json({ invoiceId: latestInvoice.id });

    } catch (error) {
        console.error("Error fetching latest invoice:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
