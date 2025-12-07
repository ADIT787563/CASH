import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { auditLogs, user } from '@/db/schema';
import { requirePermission } from '@/lib/rbac';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

/**
 * Audit Logs API
 * GET /api/audit-logs
 * 
 * Retrieve audit logs with filtering and pagination
 * Requires: Owner or Admin role
 */

export const GET = requirePermission('MANAGE_TEAM')(async (request: NextRequest, currentUser) => {
    try {
        const { searchParams } = new URL(request.url);

        // Pagination
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const offset = parseInt(searchParams.get('offset') || '0');

        // Filters
        const userId = searchParams.get('userId');
        const action = searchParams.get('action');
        const category = searchParams.get('category');
        const itemType = searchParams.get('itemType');
        const severity = searchParams.get('severity');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build query conditions
        const conditions: any[] = [];

        if (userId) {
            conditions.push(eq(auditLogs.userId, userId));
        }

        if (action) {
            conditions.push(eq(auditLogs.action, action));
        }

        if (category) {
            conditions.push(eq(auditLogs.category, category));
        }

        if (itemType) {
            conditions.push(eq(auditLogs.itemType, itemType));
        }

        if (severity) {
            conditions.push(eq(auditLogs.severity, severity));
        }

        if (startDate) {
            conditions.push(gte(auditLogs.createdAt, startDate));
        }

        if (endDate) {
            conditions.push(lte(auditLogs.createdAt, endDate));
        }

        // Execute query
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
            .limit(limit)
            .offset(offset);

        // Apply conditions if any
        const logs = conditions.length > 0
            ? await query.where(and(...conditions))
            : await query;

        // Get total count for pagination
        const countQuery = conditions.length > 0
            ? db.select({ count: sql<number>`count(*)` }).from(auditLogs).where(and(...conditions))
            : db.select({ count: sql<number>`count(*)` }).from(auditLogs);

        const [{ count }] = await countQuery;

        return NextResponse.json({
            logs,
            pagination: {
                total: count,
                limit,
                offset,
                hasMore: offset + limit < count,
            },
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Audit logs fetch error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch audit logs',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
});
