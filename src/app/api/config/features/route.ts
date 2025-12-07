import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { featureFlags } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/config/features - Fetch all feature flags
export async function GET() {
    try {
        const flags = await db
            .select()
            .from(featureFlags)
            .orderBy(featureFlags.featureKey);

        return NextResponse.json(flags, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        console.error('Error fetching feature flags:', error);
        return NextResponse.json(
            { error: 'Failed to fetch feature flags' },
            { status: 500 }
        );
    }
}

// PUT /api/config/features - Update feature flag (admin only)
export async function PUT(request: NextRequest) {
    try {
        // TODO: Add admin authentication check

        const body = await request.json();
        const { featureKey, isEnabled, config } = body;

        if (!featureKey) {
            return NextResponse.json({ error: 'Feature key required' }, { status: 400 });
        }

        await db
            .update(featureFlags)
            .set({
                isEnabled,
                config,
                updatedAt: new Date(),
            })
            .where(eq(featureFlags.featureKey, featureKey));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating feature flag:', error);
        return NextResponse.json(
            { error: 'Failed to update feature flag' },
            { status: 500 }
        );
    }
}
