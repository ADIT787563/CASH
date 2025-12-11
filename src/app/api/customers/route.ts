
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, desc, like, or, and } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const limit = 50;

        const conditions = [eq(customers.userId, session.user.id)];

        if (search) {
            conditions.push(or(
                like(customers.name, `%${search}%`),
                like(customers.phone, `%${search}%`),
                like(customers.email, `%${search}%`)
            )!);
        }

        const data = await db.select()
            .from(customers)
            .where(and(...conditions))
            .orderBy(desc(customers.updatedAt))
            .limit(limit);

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
