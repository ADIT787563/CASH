import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { auditLogs, user } from '@/db/schema';
import { requirePermission } from '@/lib/rbac';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

/**
 * Audit Logs Export API
 * GET /api/audit-logs/export
 * 
 * Export audit logs to CSV format
 * Requires: Owner or Admin role
 */

export const GET = requirePermission('MANAGE_TEAM')(async (request: NextRequest, currentUser) => {
    try {
        const { searchParams } = new URL(request.url);

        // Filters (same as main endpoint)
        const userId = searchParams.get('userId');
        const action = searchParams.get('action');
        const category = searchParams.get('category');
        const itemType = searchParams.get('itemType');
        const severity = searchParams.get('severity');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build query conditions
        const conditions: any[] = [];

        if (userId) conditions.push(eq(auditLogs.userId, userId));
        if (action) conditions.push(eq(auditLogs.action, action));
        if (category) conditions.push(eq(auditLogs.category, category));
        if (itemType) conditions.push(eq(auditLogs.itemType, itemType));
        if (severity) conditions.push(eq(auditLogs.severity, severity));
        if (startDate) conditions.push(gte(auditLogs.createdAt, startDate));
        if (endDate) conditions.push(lte(auditLogs.createdAt, endDate));

        // Execute query (limit to 10,000 records for export)
        const query = db
            .select({
                id: auditLogs.id,
                userId: auditLogs.userId,
                userName: user.name,
                userEmail: user.email,
                action: auditLogs.action,
                description: auditLogs.description,
                itemType: auditLogs.itemType,
                itemId: auditLogs.itemId,
                metadata: auditLogs.metadata,
                ipAddress: auditLogs.ipAddress,
                userAgent: auditLogs.userAgent,
                severity: auditLogs.severity,
                category: auditLogs.category,
                createdAt: auditLogs.createdAt,
            })
            .from(auditLogs)
            .leftJoin(user, eq(auditLogs.userId, user.id))
            .orderBy(desc(auditLogs.createdAt))
            .limit(10000);

        const logs = conditions.length > 0
            ? await query.where(and(...conditions))
            : await query;

        // Generate CSV
        const csvHeaders = [
            'ID',
            'Timestamp',
            'User Email',
            'User Name',
            'Action',
            'Description',
            'Category',
            'Severity',
            'Item Type',
            'Item ID',
            'IP Address',
            'User Agent',
            'Metadata'
        ].join(',');

        const csvRows = logs.map(log => [
            log.id,
            log.createdAt,
            log.userEmail || 'System',
            log.userName || 'System',
            log.action,
            `"${(log.description || '').replace(/"/g, '""')}"`, // Escape quotes
            log.category,
            log.severity,
            log.itemType || '',
            log.itemId || '',
            log.ipAddress || '',
            `"${(log.userAgent || '').replace(/"/g, '""')}"`,
            log.metadata ? `"${JSON.stringify(log.metadata).replace(/"/g, '""')}"` : ''
        ].join(','));

        const csv = [csvHeaders, ...csvRows].join('\n');

        // Return CSV file
        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });

    } catch (error) {
        console.error('❌ Audit logs export error:', error);
        return NextResponse.json(
            {
                error: 'Failed to export audit logs',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
});
