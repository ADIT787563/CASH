import { NextRequest, NextResponse } from 'next/server';
import { cleanupAuditLogs } from '@/lib/cron/cleanup-logs';

/**
 * Cron Job: Cleanup Audit Logs
 * GET /api/cron/cleanup-logs
 * 
 * Automated cleanup of old audit logs
 * Should be called daily via cron service (e.g., Vercel Cron, GitHub Actions)
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

        // Run cleanup
        const result = await cleanupAuditLogs();

        return NextResponse.json({
            success: true,
            message: 'Audit logs cleanup completed',
            ...result,
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Cron cleanup error:', error);
        return NextResponse.json(
            {
                error: 'Failed to cleanup audit logs',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
