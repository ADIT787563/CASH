import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ROLES, Role } from './roles';
export { ROLES, type Role };

// Feature permissions mapping
export const PERMISSIONS = {
    // WhatsApp API
    CONNECT_WHATSAPP: [ROLES.OWNER],

    // Templates
    MANAGE_TEMPLATES: [ROLES.OWNER, ROLES.ADMIN],
    VIEW_TEMPLATES: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],

    // Campaigns
    RUN_CAMPAIGNS: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER],
    VIEW_CAMPAIGNS: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],

    // Chat Support
    CHAT_SUPPORT: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT],

    // Analytics
    VIEW_ANALYTICS: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],

    // Team Management
    MANAGE_TEAM: [ROLES.OWNER, ROLES.ADMIN],

    // Billing
    MANAGE_BILLING: [ROLES.OWNER],

    // Products
    MANAGE_PRODUCTS: [ROLES.OWNER, ROLES.ADMIN],
    VIEW_PRODUCTS: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],

    // Leads
    MANAGE_LEADS: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT],
    VIEW_LEADS: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],
    DELETE_LEADS: [ROLES.OWNER, ROLES.ADMIN],

    // Messages
    SEND_MESSAGES: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT],
    VIEW_MESSAGES: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],

    // Orders
    MANAGE_ORDERS: [ROLES.OWNER, ROLES.ADMIN],
    VIEW_ORDERS: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],

    // Chatbot Settings
    MANAGE_CHATBOT: [ROLES.OWNER, ROLES.ADMIN],

    // Business Settings
    MANAGE_BUSINESS_SETTINGS: [ROLES.OWNER, ROLES.ADMIN],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if a user role has permission for a specific feature
 */
export function hasPermission(userRole: Role, permission: Permission): boolean {
    const allowedRoles = PERMISSIONS[permission];
    return (allowedRoles as readonly Role[]).includes(userRole);
}

/**
 * Get current user from request with role information
 */
export async function getCurrentUserWithRole(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return null;
        }

        // The user object from session should include the role field
        return {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: (session.user as any).role || ROLES.VIEWER, // Default to viewer if role not set
        };
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Middleware factory to require specific roles for API routes
 * Usage: const handler = requireRole([ROLES.OWNER, ROLES.ADMIN])(async (req, user) => { ... });
 */
export function requireRole(allowedRoles: Role[]) {
    return function (
        handler: (request: NextRequest, user: { id: string; email: string; name: string; role: Role }) => Promise<NextResponse>
    ) {
        return async function (request: NextRequest): Promise<NextResponse> {
            // Get current user with role
            const user = await getCurrentUserWithRole(request);

            if (!user) {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }

            // Check if user's role is allowed
            if (!allowedRoles.includes(user.role)) {
                return NextResponse.json(
                    {
                        error: 'Permission denied',
                        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
                        userRole: user.role
                    },
                    { status: 403 }
                );
            }

            // Call the actual handler with user info
            return handler(request, user);
        };
    };
}

/**
 * Middleware factory to require specific permission for API routes
 * Usage: const handler = requirePermission('MANAGE_PRODUCTS')(async (req, user) => { ... });
 */
export function requirePermission(permission: Permission) {
    return function (
        handler: (request: NextRequest, user: { id: string; email: string; name: string; role: Role }) => Promise<NextResponse>
    ) {
        return async function (request: NextRequest): Promise<NextResponse> {
            // Get current user with role
            const user = await getCurrentUserWithRole(request);

            if (!user) {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }

            // Check if user has permission
            if (!hasPermission(user.role, permission)) {
                return NextResponse.json(
                    {
                        error: 'Permission denied',
                        message: `You don't have permission to ${permission.toLowerCase().replace(/_/g, ' ')}`,
                        userRole: user.role,
                        requiredPermission: permission
                    },
                    { status: 403 }
                );
            }

            // Call the actual handler with user info
            return handler(request, user);
        };
    };
}

/**
 * Check if user can manage another user based on roles
 * Owner can manage everyone
 * Admin can manage everyone except Owner
 */
export function canManageUser(managerRole: Role, targetRole: Role): boolean {
    if (managerRole === ROLES.OWNER) {
        return true; // Owner can manage everyone
    }

    if (managerRole === ROLES.ADMIN) {
        return targetRole !== ROLES.OWNER; // Admin can't manage Owner
    }

    return false; // Other roles can't manage users
}
