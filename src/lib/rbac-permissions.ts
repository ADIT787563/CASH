import { db } from "@/db";
import { roles, rbacTeamMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Permission type definition
export interface Permissions {
    products?: { view?: boolean; edit?: boolean; delete?: boolean };
    orders?: { view?: boolean; edit?: boolean; delete?: boolean };
    whatsapp?: { send?: boolean; manage?: boolean };
    billing?: { access?: boolean; manage?: boolean };
    team?: { manage?: boolean; invite?: boolean; remove?: boolean };
    dashboard?: { access?: boolean };
    settings?: { access?: boolean; manage?: boolean };
    campaigns?: { view?: boolean; create?: boolean; manage?: boolean };
    analytics?: { access?: boolean };
}

/**
 * Get user's permissions based on their role
 * @param userId - The user ID to get permissions for
 * @returns Permissions object or null if not found
 */
export async function getUserPermissions(userId: string): Promise<Permissions | null> {
    try {
        // First, check if user is a business owner (has full permissions)
        const teamMember = await db
            .select()
            .from(rbacTeamMembers)
            .where(eq(rbacTeamMembers.userId, userId))
            .limit(1);

        if (!teamMember || teamMember.length === 0) {
            // User is not a team member, check if they're the business owner
            // Business owners have full permissions
            return getOwnerPermissions();
        }

        const member = teamMember[0];

        // Get the role and its permissions
        const role = await db
            .select()
            .from(roles)
            .where(eq(roles.id, member.roleId))
            .limit(1);

        if (!role || role.length === 0) {
            return null;
        }

        return role[0].permissions as Permissions;
    } catch (error) {
        console.error("Error getting user permissions:", error);
        return null;
    }
}

/**
 * Check if user has a specific permission
 * @param permissions - User's permissions object
 * @param resource - Resource name (e.g., 'products', 'orders')
 * @param action - Action name (e.g., 'view', 'edit', 'delete')
 * @returns true if user has permission, false otherwise
 */
export function checkPermission(
    permissions: Permissions | null,
    resource: keyof Permissions,
    action: string
): boolean {
    if (!permissions) return false;

    const resourcePermissions = permissions[resource];
    if (!resourcePermissions || typeof resourcePermissions !== 'object') {
        return false;
    }

    return (resourcePermissions as any)[action] === true;
}

/**
 * Check if user has any of the specified permissions
 * @param permissions - User's permissions object
 * @param checks - Array of permission checks [{resource, action}]
 * @returns true if user has at least one permission
 */
export function hasAnyPermission(
    permissions: Permissions | null,
    checks: Array<{ resource: keyof Permissions; action: string }>
): boolean {
    return checks.some(check =>
        checkPermission(permissions, check.resource, check.action)
    );
}

/**
 * Check if user has all of the specified permissions
 * @param permissions - User's permissions object
 * @param checks - Array of permission checks [{resource, action}]
 * @returns true if user has all permissions
 */
export function hasAllPermissions(
    permissions: Permissions | null,
    checks: Array<{ resource: keyof Permissions; action: string }>
): boolean {
    return checks.every(check =>
        checkPermission(permissions, check.resource, check.action)
    );
}

/**
 * Get owner permissions (full access)
 * @returns Full permissions object
 */
export function getOwnerPermissions(): Permissions {
    return {
        products: { view: true, edit: true, delete: true },
        orders: { view: true, edit: true, delete: true },
        whatsapp: { send: true, manage: true },
        billing: { access: true, manage: true },
        team: { manage: true, invite: true, remove: true },
        dashboard: { access: true },
        settings: { access: true, manage: true },
        campaigns: { view: true, create: true, manage: true },
        analytics: { access: true },
    };
}

/**
 * Middleware function to require specific permission
 * Throws error if permission not granted
 */
export async function requirePermission(
    userId: string,
    resource: keyof Permissions,
    action: string
): Promise<void> {
    const permissions = await getUserPermissions(userId);

    if (!checkPermission(permissions, resource, action)) {
        throw new Error(`Permission denied: ${resource}.${action}`);
    }
}

/**
 * Get user's role information
 * @param userId - The user ID
 * @returns Role information or null
 */
export async function getUserRole(userId: string) {
    try {
        const teamMember = await db
            .select({
                roleId: rbacTeamMembers.roleId,
                roleName: roles.roleName,
                description: roles.description,
                permissions: roles.permissions,
            })
            .from(rbacTeamMembers)
            .leftJoin(roles, eq(rbacTeamMembers.roleId, roles.id))
            .where(eq(rbacTeamMembers.userId, userId))
            .limit(1);

        return teamMember[0] || null;
    } catch (error) {
        console.error("Error getting user role:", error);
        return null;
    }
}
