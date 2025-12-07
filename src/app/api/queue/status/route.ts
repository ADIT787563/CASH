import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messageQueue, campaigns } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Queue Status API
 * URL: GET /api/queue/status
 * 
 * Returns queue statistics and campaign progress
 * Useful for monitoring dashboard
 */

// Helper to get current user
async function getCurrentUser(request: NextRequest) {
    const userId = request.headers.get('x-user-id');
    if (!userId) return null;
    return { id: userId };
}

export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate user
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // 2. Get query parameters
        const { searchParams } = new URL(request.url);
        const campaignId = searchParams.get('campaignId');

        // 3. Build base query
        let baseCondition = eq(messageQueue.userId, user.id);
        if (campaignId) {
            baseCondition = and(
                eq(messageQueue.userId, user.id),
                eq(messageQueue.campaignId, parseInt(campaignId))
            ) as any;
        }

        // 4. Get queue statistics
        const allMessages = await db
            .select()
            .from(messageQueue)
            .where(baseCondition);

        const stats = {
            pending: allMessages.filter(m => m.status === 'pending').length,
            processing: allMessages.filter(m => m.status === 'processing').length,
            sent: allMessages.filter(m => m.status === 'sent').length,
            failed: allMessages.filter(m => m.status === 'failed').length,
            delivered: allMessages.filter(m => m.deliveryStatus === 'delivered').length,
            read: allMessages.filter(m => m.deliveryStatus === 'read').length,
            total: allMessages.length,
        };

        // 5. Calculate average send rate (messages per second)
        const sentMessages = allMessages.filter(m => m.status === 'sent' && m.processedAt);
        let avgSendRate = '0 msg/sec';

        if (sentMessages.length > 1) {
            const times = sentMessages
                .map(m => new Date(m.processedAt!).getTime())
                .sort((a, b) => a - b);

            const duration = (times[times.length - 1] - times[0]) / 1000; // seconds
            if (duration > 0) {
                const rate = sentMessages.length / duration;
                avgSendRate = `${rate.toFixed(1)} msg/sec`;
            }
        }

        // 6. Get campaign details if specific campaign requested
        let campaignDetails = null;
        if (campaignId) {
            const campaign = await db
                .select()
                .from(campaigns)
                .where(and(
                    eq(campaigns.id, parseInt(campaignId)),
                    eq(campaigns.userId, user.id)
                ))
                .limit(1);

            if (campaign.length > 0) {
                const c = campaign[0];
                campaignDetails = {
                    id: c.id,
                    name: c.name,
                    status: c.status,
                    progress: c.targetCount > 0 ? Math.round((c.sentCount / c.targetCount) * 100) : 0,
                    total: c.targetCount,
                    sent: c.sentCount,
                    delivered: c.deliveredCount,
                    read: c.readCount,
                    failed: c.failedCount,
                };
            }
        }

        // 7. Get all user campaigns summary
        const userCampaigns = await db
            .select()
            .from(campaigns)
            .where(eq(campaigns.userId, user.id));

        const campaignsSummary = userCampaigns.map(c => ({
            id: c.id,
            name: c.name,
            status: c.status,
            progress: c.targetCount > 0 ? Math.round((c.sentCount / c.targetCount) * 100) : 0,
            total: c.targetCount,
            sent: c.sentCount,
            delivered: c.deliveredCount,
            read: c.readCount,
            failed: c.failedCount,
            clickedCount: c.clickedCount,
        }));

        // 8. Return response
        return NextResponse.json({
            stats,
            avgSendRate,
            campaign: campaignDetails,
            campaigns: campaignsSummary,
        });

    } catch (error) {
        console.error('❌ Queue status error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch queue status',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
