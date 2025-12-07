import { NextRequest } from 'next/server';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';

/**
 * Audit Logger Utility
 * 
 * Provides functions for logging various types of actions:
 * - Authentication events (login, logout, failed attempts)
 * - User actions (CRUD operations on products, leads, orders, etc.)
 * - Message tracking (WhatsApp message status changes)
 * - Admin actions (team management, role changes, billing)
 */

// Log severity levels
export const SEVERITY = {
    INFO: 'info',
    WARNING: 'warning',
    CRITICAL: 'critical',
} as const;

// Log categories
export const CATEGORY = {
    AUTH: 'auth',
    USER_ACTION: 'user_action',
    MESSAGE: 'message',
    ADMIN: 'admin',
} as const;

export type Severity = typeof SEVERITY[keyof typeof SEVERITY];
export type Category = typeof CATEGORY[keyof typeof CATEGORY];

interface LogParams {
    userId?: string;
    action: string;
    description: string;
    itemType?: string;
    itemId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    severity?: Severity;
    category: Category;
}

/**
 * Extract client information from request
 */
export function getClientInfo(request: NextRequest | Request): { ipAddress: string; userAgent: string } {
    // Get IP address
    let ipAddress = 'unknown';

    if ('headers' in request) {
        // Try various headers for IP address
        ipAddress =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            request.headers.get('cf-connecting-ip') || // Cloudflare
            'unknown';
    }

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    return { ipAddress, userAgent };
}

/**
 * Main logging function
 */
export async function logAction(params: LogParams): Promise<void> {
    try {
        const now = new Date().toISOString();

        await db.insert(auditLogs).values({
            userId: params.userId || null,
            action: params.action,
            description: params.description,
            itemType: params.itemType || null,
            itemId: params.itemId || null,
            metadata: params.metadata || null,
            ipAddress: params.ipAddress || null,
            userAgent: params.userAgent || null,
            severity: params.severity || SEVERITY.INFO,
            category: params.category,
            createdAt: now,
        });

        console.log(`📝 [${params.category}] ${params.action}: ${params.description}`);
    } catch (error) {
        // Don't throw errors from logging - just log to console
        console.error('Failed to write audit log:', error);
    }
}

/**
 * Log authentication events
 */
export async function logAuth(
    userId: string | null,
    action: string,
    success: boolean,
    metadata?: Record<string, any>,
    request?: NextRequest | Request
): Promise<void> {
    const clientInfo = request ? getClientInfo(request) : { ipAddress: undefined, userAgent: undefined };

    const descriptions: Record<string, string> = {
        login_success: 'User logged in successfully',
        login_failed: 'Failed login attempt',
        logout: 'User logged out',
        password_reset: 'Password reset requested',
        password_changed: 'Password changed successfully',
        session_expired: 'Session expired',
    };

    await logAction({
        userId: userId || undefined,
        action,
        description: descriptions[action] || action,
        metadata,
        severity: success ? SEVERITY.INFO : SEVERITY.WARNING,
        category: CATEGORY.AUTH,
        ...clientInfo,
    });
}

/**
 * Log user actions (CRUD operations)
 */
export async function logUserAction(
    userId: string,
    action: string,
    description: string,
    itemType?: string,
    itemId?: string,
    metadata?: Record<string, any>,
    request?: NextRequest | Request
): Promise<void> {
    const clientInfo = request ? getClientInfo(request) : { ipAddress: undefined, userAgent: undefined };

    await logAction({
        userId,
        action,
        description,
        itemType,
        itemId,
        metadata,
        severity: SEVERITY.INFO,
        category: CATEGORY.USER_ACTION,
        ...clientInfo,
    });
}

/**
 * Log message tracking
 */
export async function logMessage(
    userId: string,
    messageId: string,
    direction: 'inbound' | 'outbound',
    status: string,
    metadata?: Record<string, any>
): Promise<void> {
    await logAction({
        userId,
        action: `message_${direction}_${status}`,
        description: `Message ${messageId} ${direction} - ${status}`,
        itemType: 'message',
        itemId: messageId,
        metadata,
        severity: SEVERITY.INFO,
        category: CATEGORY.MESSAGE,
    });
}

/**
 * Log admin actions (sensitive operations)
 */
export async function logAdmin(
    userId: string,
    action: string,
    description: string,
    targetUserId?: string,
    metadata?: Record<string, any>,
    request?: NextRequest | Request
): Promise<void> {
    const clientInfo = request ? getClientInfo(request) : { ipAddress: undefined, userAgent: undefined };

    // Admin actions are always critical severity
    await logAction({
        userId,
        action,
        description,
        itemType: targetUserId ? 'user' : undefined,
        itemId: targetUserId,
        metadata,
        severity: SEVERITY.CRITICAL,
        category: CATEGORY.ADMIN,
        ...clientInfo,
    });
}

/**
 * Log product operations with before/after values
 */
export async function logProductAction(
    userId: string,
    action: 'create' | 'update' | 'delete',
    productId: string,
    productName: string,
    changes?: Record<string, { old: any; new: any }>,
    request?: NextRequest | Request
): Promise<void> {
    const descriptions = {
        create: `Created product "${productName}"`,
        update: `Updated product "${productName}"`,
        delete: `Deleted product "${productName}"`,
    };

    await logUserAction(
        userId,
        `product_${action}`,
        descriptions[action],
        'product',
        productId,
        changes ? { changes } : undefined,
        request
    );
}

/**
 * Log campaign operations
 */
export async function logCampaignAction(
    userId: string,
    action: 'create' | 'send' | 'update' | 'delete',
    campaignId: string,
    campaignName: string,
    metadata?: Record<string, any>,
    request?: NextRequest | Request
): Promise<void> {
    const descriptions = {
        create: `Created campaign "${campaignName}"`,
        send: `Started campaign "${campaignName}"`,
        update: `Updated campaign "${campaignName}"`,
        delete: `Deleted campaign "${campaignName}"`,
    };

    await logUserAction(
        userId,
        `campaign_${action}`,
        descriptions[action],
        'campaign',
        campaignId,
        metadata,
        request
    );
}

/**
 * Log lead operations
 */
export async function logLeadAction(
    userId: string,
    action: 'create' | 'update' | 'delete' | 'status_change',
    leadId: string,
    leadName: string,
    metadata?: Record<string, any>,
    request?: NextRequest | Request
): Promise<void> {
    const descriptions = {
        create: `Created lead "${leadName}"`,
        update: `Updated lead "${leadName}"`,
        delete: `Deleted lead "${leadName}"`,
        status_change: `Changed status of lead "${leadName}"`,
    };

    await logUserAction(
        userId,
        `lead_${action}`,
        descriptions[action],
        'lead',
        leadId,
        metadata,
        request
    );
}

/**
 * Log template operations
 */
export async function logTemplateAction(
    userId: string,
    action: 'create' | 'update' | 'delete' | 'approve' | 'reject',
    templateId: string,
    templateName: string,
    metadata?: Record<string, any>,
    request?: NextRequest | Request
): Promise<void> {
    const descriptions = {
        create: `Created template "${templateName}"`,
        update: `Updated template "${templateName}"`,
        delete: `Deleted template "${templateName}"`,
        approve: `Approved template "${templateName}"`,
        reject: `Rejected template "${templateName}"`,
    };

    await logUserAction(
        userId,
        `template_${action}`,
        descriptions[action],
        'template',
        templateId,
        metadata,
        request
    );
}
