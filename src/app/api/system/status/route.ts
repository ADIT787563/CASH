import { NextRequest, NextResponse } from 'next/server';
import { getSystemStatus } from '@/lib/kill-switch';

/**
 * System Status API
 * GET /api/system/status
 * 
 * Returns current system status including maintenance mode
 */

export async function GET(request: NextRequest) {
    try {
        const status = await getSystemStatus();

        return NextResponse.json(status);
    } catch (error) {
        console.error('Error getting system status:', error);
        return NextResponse.json(
            {
                locked: false,
                lockMode: 'none',
            },
            { status: 500 }
        );
    }
}
