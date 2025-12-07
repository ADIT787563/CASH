import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { lt, and, eq } from 'drizzle-orm';
import { CATEGORY } from '../audit-logger';

/**
 * Cleanup Audit Logs
 * 
 * Deletes old audit logs based on retention policies:
 * - Normal logs (auth, user_action, message): 90 days
 * - Admin/security logs: 365 days
 */

export async function cleanupAuditLogs(): Promise<{
    normalLogsDeleted: number;
    adminLogsDeleted: number;
    totalDeleted: number;
}> {
    try {
        const now = new Date();

        // Calculate cutoff dates
        const normalLogsCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
        const adminLogsCutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 365 days ago

        console.log('🧹 Starting audit log cleanup...');
        console.log(`Normal logs cutoff: ${normalLogsCutoff.toISOString()}`);
        console.log(`Admin logs cutoff: ${adminLogsCutoff.toISOString()}`);

        // Delete normal logs older than 90 days
        const normalLogsResult = await db
            .delete(auditLogs)
            .where(
                and(
                    lt(auditLogs.createdAt, normalLogsCutoff.toISOString()),
                    eq(auditLogs.category, CATEGORY.AUTH)
                )
            );

        const userActionLogsResult = await db
            .delete(auditLogs)
            .where(
                and(
                    lt(auditLogs.createdAt, normalLogsCutoff.toISOString()),
                    eq(auditLogs.category, CATEGORY.USER_ACTION)
                )
            );

        const messageLogsResult = await db
            .delete(auditLogs)
            .where(
                and(
                    lt(auditLogs.createdAt, normalLogsCutoff.toISOString()),
                    eq(auditLogs.category, CATEGORY.MESSAGE)
                )
            );

        // Delete admin logs older than 365 days
        const adminLogsResult = await db
            .delete(auditLogs)
            .where(
                and(
                    lt(auditLogs.createdAt, adminLogsCutoff.toISOString()),
                    eq(auditLogs.category, CATEGORY.ADMIN)
                )
            );

        const normalLogsDeleted =
            (normalLogsResult as any).rowsAffected || 0 +
            (userActionLogsResult as any).rowsAffected || 0 +
            (messageLogsResult as any).rowsAffected || 0;

        const adminLogsDeleted = (adminLogsResult as any).rowsAffected || 0;
        const totalDeleted = normalLogsDeleted + adminLogsDeleted;

        console.log(`✅ Cleanup complete:`);
        console.log(`   - Normal logs deleted: ${normalLogsDeleted}`);
        console.log(`   - Admin logs deleted: ${adminLogsDeleted}`);
        console.log(`   - Total deleted: ${totalDeleted}`);

        return {
            normalLogsDeleted,
            adminLogsDeleted,
            totalDeleted,
        };
    } catch (error) {
        console.error('❌ Audit log cleanup error:', error);
        throw error;
    }
}
