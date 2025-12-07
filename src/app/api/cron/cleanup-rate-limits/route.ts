import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldRateLimits } from '@/lib/rate-limiter';
import { cleanupOldWebhookEvents } from '@/lib/webhook-deduplication';
import { cleanupOldChatbotUsage } from '@/lib/chatbot-usage';

/**
 * Cron Job: Cleanup Rate Limits and Related Data
 * GET /api/cron/cleanup-rate-limits
 * 
 * Automated cleanup of old rate limit tracking data
 * Should be called daily via cron service
 * 
 * Protected by cron secret
 */

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            console.error('CRON_SECRET not configured');
            return NextResponse.json(
                { error: 'Cron job not configured' },
                { status: 500 }
            );
        }

        if (authHeader !== `Bearer ${cronSecret}`) {
            console.error('Invalid cron secret');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Run all cleanup tasks
        const [rateLimitsDeleted, webhookEventsDeleted, chatbotUsageDeleted] = await Promise.all([
            cleanupOldRateLimits(),
            cleanupOldWebhookEvents(),
            cleanupOldChatbotUsage(),
        ]);

        return NextResponse.json({
            success: true,
            message: 'Rate limit cleanup completed',
            rateLimitsDeleted,
            webhookEventsDeleted,
            chatbotUsageDeleted,
            totalDeleted: rateLimitsDeleted + webhookEventsDeleted + chatbotUsageDeleted,
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Cron cleanup error:', error);
        return NextResponse.json(
            {
                error: 'Failed to cleanup rate limits',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
