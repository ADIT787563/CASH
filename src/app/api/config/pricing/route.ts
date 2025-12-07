import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pricingPlans } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/config/pricing - Fetch all active pricing plans
export async function GET() {
    try {
        const plans = await db
            .select()
            .from(pricingPlans)
            .where(eq(pricingPlans.isActive, true))
            .orderBy(pricingPlans.sortOrder);

        // Transform prices from paise to rupees for frontend
        const transformedPlans = plans.map(plan => ({
            ...plan,
            monthlyPrice: plan.monthlyPrice / 100,
            yearlyPrice: plan.yearlyPrice ? plan.yearlyPrice / 100 : null,
        }));

        return NextResponse.json(transformedPlans, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('Error fetching pricing plans:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pricing plans' },
            { status: 500 }
        );
    }
}

// PUT /api/config/pricing/:id - Update pricing plan (admin only)
export async function PUT(request: NextRequest) {
    try {
        // TODO: Add admin authentication check
        // const session = await auth.api.getSession({ headers: await headers() });
        // if (!session || session.user.role !== 'admin') {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
        }

        // Convert prices from rupees to paise for storage
        if (updateData.monthlyPrice !== undefined) {
            updateData.monthlyPrice = Math.round(updateData.monthlyPrice * 100);
        }
        if (updateData.yearlyPrice !== undefined && updateData.yearlyPrice !== null) {
            updateData.yearlyPrice = Math.round(updateData.yearlyPrice * 100);
        }

        updateData.updatedAt = new Date();

        await db
            .update(pricingPlans)
            .set(updateData)
            .where(eq(pricingPlans.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating pricing plan:', error);
        return NextResponse.json(
            { error: 'Failed to update pricing plan' },
            { status: 500 }
        );
    }
}
