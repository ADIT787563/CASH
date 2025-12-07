import { NextRequest, NextResponse } from 'next/server';
import { lockSystem, unlockSystem } from '@/lib/kill-switch';
import { getCurrentUserWithRole } from '@/lib/rbac';
import { logUserAction } from '@/lib/audit-logger';

/**
 * System Lock API
 * POST /api/system/lock
 * 
 * Toggle system maintenance mode (Owner only)
 */

export async function POST(request: NextRequest) {
    try {
        // Get current user
        const user = await getCurrentUserWithRole(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Only Owner can lock/unlock system
        if (user.role !== 'owner') {
            return NextResponse.json(
                { error: 'Only owners can toggle maintenance mode' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { action, reason } = body;

        if (action === 'lock') {
            await lockSystem(reason || 'Manual maintenance', user.id);

            await logUserAction(
                user.id,
                'system_locked',
                `System locked: ${reason || 'Manual maintenance'}`,
                'system',
                undefined,
                { reason },
                request
            );

            return NextResponse.json({
                success: true,
                message: 'System locked successfully',
            });
        } else if (action === 'unlock') {
            await unlockSystem(user.id);

            await logUserAction(
                user.id,
                'system_unlocked',
                'System unlocked',
                'system',
                undefined,
                {},
                request
            );

            return NextResponse.json({
                success: true,
                message: 'System unlocked successfully',
            });
        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use "lock" or "unlock"' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error toggling system lock:', error);
        return NextResponse.json(
            { error: 'Failed to toggle system lock' },
            { status: 500 }
        );
    }
}
