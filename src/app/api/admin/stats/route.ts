import { NextResponse } from 'next/server';
import { db } from '@/db';
import { user, payments } from '@/db/schema';
import { count, eq, sql, sum } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Hardcoded list of super admins
const SUPER_ADMINS = ['admin@wavegroww.com', 'a2max@example.com']; // Replace with actual admin emails

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.email || !SUPER_ADMINS.includes(session.user.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 1. Total Users
        const totalUsersResult = await db.select({ value: count() }).from(user);
        const totalUsers = totalUsersResult[0].value;

        // 2. Active Subscriptions (Users not on 'starter' plan)
        const activeSubsResult = await db.select({ value: count() }).from(user).where(sql`${user.plan} != 'starter'`);
        const activeSubs = activeSubsResult[0].value;

        // 3. Total Revenue (Sum of captured payments)
        const revenueResult = await db.select({ value: sum(payments.amount) }).from(payments).where(eq(payments.status, 'captured'));
        const totalRevenue = revenueResult[0].value ? Number(revenueResult[0].value) / 100 : 0;

        return NextResponse.json({
            totalUsers,
            activeSubs,
            totalRevenue,
            formattedRevenue: `₹${totalRevenue.toFixed(2)}`
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
