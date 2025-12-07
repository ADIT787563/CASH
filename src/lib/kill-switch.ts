import { db } from '@/db';
import { businessSettings } from '@/db/schema';

/**
 * Kill Switch / Maintenance Mode
 * 
 * Emergency system controls to pause operations
 */

export type LockMode = 'full' | 'messages' | 'campaigns' | 'none';

interface SystemStatus {
    locked: boolean;
    lockMode: LockMode;
    lockReason?: string;
    lockedAt?: string;
    lockedBy?: string;
}

/**
 * Check if system is locked
 */
export async function isSystemLocked(): Promise<boolean> {
    try {
        const [settings] = await db
            .select()
            .from(businessSettings)
            .limit(1);

        if (!settings) return false;

        return settings.maintenanceMode === true;
    } catch (error) {
        console.error('Error checking system lock:', error);
        return false; // Fail open
    }
}

/**
 * Check specific lock mode
 */
export async function checkLockMode(mode: 'messages' | 'campaigns'): Promise<boolean> {
    try {
        const [settings] = await db
            .select()
            .from(businessSettings)
            .limit(1);

        if (!settings) return false;

        // Check if maintenance mode is enabled
        if (settings.maintenanceMode) {
            return true; // All operations locked
        }

        // Check specific lock modes (if you add these fields to schema)
        // For now, maintenance mode locks everything
        return false;
    } catch (error) {
        console.error('Error checking lock mode:', error);
        return false;
    }
}

/**
 * Enable system lock
 */
export async function lockSystem(
    reason: string,
    userId: string,
    mode: LockMode = 'full'
): Promise<void> {
    try {
        const now = new Date().toISOString();

        await db
            .update(businessSettings)
            .set({
                maintenanceMode: true,
                updatedAt: now,
            });

        console.log(`🔒 System locked by user ${userId}: ${reason}`);
    } catch (error) {
        console.error('Error locking system:', error);
        throw error;
    }
}

/**
 * Disable system lock
 */
export async function unlockSystem(userId: string): Promise<void> {
    try {
        const now = new Date().toISOString();

        await db
            .update(businessSettings)
            .set({
                maintenanceMode: false,
                updatedAt: now,
            });

        console.log(`🔓 System unlocked by user ${userId}`);
    } catch (error) {
        console.error('Error unlocking system:', error);
        throw error;
    }
}

/**
 * Get system status
 */
export async function getSystemStatus(): Promise<SystemStatus> {
    try {
        const [settings] = await db
            .select()
            .from(businessSettings)
            .limit(1);

        if (!settings) {
            return {
                locked: false,
                lockMode: 'none',
            };
        }

        const locked = settings.maintenanceMode === true;

        return {
            locked,
            lockMode: locked ? 'full' : 'none',
            lockReason: locked ? 'System maintenance' : undefined,
        };
    } catch (error) {
        console.error('Error getting system status:', error);
        return {
            locked: false,
            lockMode: 'none',
        };
    }
}

/**
 * Check if operation is allowed
 */
export async function isOperationAllowed(operation: 'message' | 'campaign' | 'api'): Promise<boolean> {
    const status = await getSystemStatus();

    if (!status.locked) {
        return true; // System not locked
    }

    // If system is locked, check lock mode
    if (status.lockMode === 'full') {
        return false; // Everything locked
    }

    if (status.lockMode === 'messages' && operation === 'message') {
        return false; // Messages locked
    }

    if (status.lockMode === 'campaigns' && operation === 'campaign') {
        return false; // Campaigns locked
    }

    return true;
}
