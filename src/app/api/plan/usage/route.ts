import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserPlanLimits, getCatalogUsageStats } from '@/lib/plan-limits';

/**
 * GET /api/plan/usage
 * Get current user's plan and usage statistics
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get plan details and limits
        const planInfo = await getUserPlanLimits(user.id);

        // Get catalog usage stats
        const catalogStats = await getCatalogUsageStats(user.id);

        return NextResponse.json({
            plan: {
                id: planInfo.planId,
                name: planInfo.planName,
                limits: planInfo.limits,
            },
            usage: {
                catalogs: catalogStats,
                // Add more usage stats here as needed
            },
        });

    } catch (error: any) {
        console.error('Error fetching plan usage:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
