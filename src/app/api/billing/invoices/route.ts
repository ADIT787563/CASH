import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // In a real app, you might have a separate table for SaaS invoices.
        // For now, we'll fetch from payments where the user is the payer (or related to subscription).
        // Mocking some data if empty to show the UI
        const invoices = await db.select()
            .from(payments)
            .where(eq(payments.userId, user.id)) // Assuming user pays here
            .orderBy(payments.createdAt);

        if (invoices.length === 0) {
            return NextResponse.json([
                {
                    id: 'inv_mock_1',
                    date: new Date().toISOString(),
                    amount: 0,
                    status: 'paid',
                    plan: 'Starter (Free)',
                    downloadUrl: '#'
                }
            ]);
        }

        return NextResponse.json(invoices.map(inv => ({
            id: inv.id,
            date: inv.createdAt,
            amount: inv.amount / 100,
            status: inv.status,
            plan: 'Subscription Payment',
            downloadUrl: `/api/billing/invoices/${inv.id}/download`
        })));

    } catch (error) {
        console.error('Invoices Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
