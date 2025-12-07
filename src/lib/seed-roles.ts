import { eq, and } from 'drizzle-orm';
import { db } from "@/db";
import { roles, roleHierarchy } from "@/db/schema";

// Default system roles with permissions
const DEFAULT_ROLES = [
    {
        id: "role-owner",
        roleName: "Owner",
        description: "Full access to all features and settings",
        isSystemRole: true,
        permissions: {
            products: { view: true, edit: true, delete: true },
            orders: { view: true, edit: true, delete: true },
            whatsapp: { send: true, manage: true },
            billing: { access: true, manage: true },
            team: { manage: true, invite: true, remove: true },
            dashboard: { access: true },
            settings: { access: true, manage: true },
            campaigns: { view: true, create: true, manage: true },
            analytics: { access: true },
        },
    },
    {
        id: "role-manager",
        roleName: "Manager",
        description: "Manage operations, team, and most features",
        isSystemRole: true,
        parentRoleId: "role-owner",
        permissions: {
            products: { view: true, edit: true, delete: false },
            orders: { view: true, edit: true, delete: false },
            whatsapp: { send: true, manage: true },
            billing: { access: false, manage: false },
            team: { manage: true, invite: true, remove: false },
            dashboard: { access: true },
            settings: { access: true, manage: false },
            campaigns: { view: true, create: true, manage: true },
            analytics: { access: true },
        },
    },
    {
        id: "role-product-editor",
        roleName: "Product Editor",
        description: "Manage product catalog and inventory",
        isSystemRole: true,
        parentRoleId: "role-manager",
        permissions: {
            products: { view: true, edit: true, delete: false },
            orders: { view: true, edit: false, delete: false },
            whatsapp: { send: false, manage: false },
            billing: { access: false, manage: false },
            team: { manage: false, invite: false, remove: false },
            dashboard: { access: true },
            settings: { access: false, manage: false },
            campaigns: { view: false, create: false, manage: false },
            analytics: { access: false },
        },
    },
    {
        id: "role-catalog-manager",
        roleName: "Catalog Manager",
        description: "Full catalog management including deletions",
        isSystemRole: true,
        parentRoleId: "role-product-editor",
        permissions: {
            products: { view: true, edit: true, delete: true },
            orders: { view: true, edit: false, delete: false },
            whatsapp: { send: false, manage: false },
            billing: { access: false, manage: false },
            team: { manage: false, invite: false, remove: false },
            dashboard: { access: true },
            settings: { access: false, manage: false },
            campaigns: { view: false, create: false, manage: false },
            analytics: { access: false },
        },
    },
    {
        id: "role-support-staff",
        roleName: "Support Staff",
        description: "Handle customer support and WhatsApp messages",
        isSystemRole: true,
        parentRoleId: "role-manager",
        permissions: {
            products: { view: true, edit: false, delete: false },
            orders: { view: true, edit: true, delete: false },
            whatsapp: { send: true, manage: false },
            billing: { access: false, manage: false },
            team: { manage: false, invite: false, remove: false },
            dashboard: { access: true },
            settings: { access: false, manage: false },
            campaigns: { view: false, create: false, manage: false },
            analytics: { access: false },
        },
    },
    {
        id: "role-finance-manager",
        roleName: "Finance Manager",
        description: "Manage billing, finances, and view analytics",
        isSystemRole: true,
        parentRoleId: "role-owner",
        permissions: {
            products: { view: true, edit: false, delete: false },
            orders: { view: true, edit: false, delete: false },
            whatsapp: { send: false, manage: false },
            billing: { access: true, manage: true },
            team: { manage: false, invite: false, remove: false },
            dashboard: { access: true },
            settings: { access: false, manage: false },
            campaigns: { view: false, create: false, manage: false },
            analytics: { access: true },
        },
    },
];

/**
 * Seed default system roles
 * This should be run once during initial setup
 */
export async function seedDefaultRoles() {
    try {
        console.log("Seeding default roles...");

        // Insert all default roles
        for (const role of DEFAULT_ROLES) {
            const existing = await db
                .select()
                .from(roles)
                .where(eq(roles.id, role.id))
                .limit(1);

            if (existing.length === 0) {
                await db.insert(roles).values({
                    id: role.id,
                    businessId: null, // System roles don't belong to a specific business
                    roleName: role.roleName,
                    description: role.description,
                    permissions: role.permissions,
                    parentRoleId: role.parentRoleId || null,
                    isSystemRole: role.isSystemRole,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                console.log(`✓ Created role: ${role.roleName}`);
            } else {
                console.log(`- Role already exists: ${role.roleName}`);
            }
        }

        // Create role hierarchy relationships
        console.log("\nCreating role hierarchy...");

        const hierarchyRelations = [
            { parent: "role-owner", child: "role-manager", order: 0 },
            { parent: "role-manager", child: "role-product-editor", order: 0 },
            { parent: "role-product-editor", child: "role-catalog-manager", order: 0 },
            { parent: "role-manager", child: "role-support-staff", order: 1 },
            { parent: "role-owner", child: "role-finance-manager", order: 1 },
        ];

        for (const relation of hierarchyRelations) {
            const existing = await db
                .select()
                .from(roleHierarchy)
                .where(and(
                    eq(roleHierarchy.parentRoleId, relation.parent),
                    eq(roleHierarchy.childRoleId, relation.child)
                ))
                .limit(1);

            if (existing.length === 0) {
                await db.insert(roleHierarchy).values({
                    id: crypto.randomUUID(),
                    businessId: null as any, // System hierarchy
                    parentRoleId: relation.parent,
                    childRoleId: relation.child,
                    orderPosition: relation.order,
                    createdAt: new Date(),
                });
                console.log(`✓ Created hierarchy: ${relation.parent} → ${relation.child}`);
            }
        }

        console.log("\n✅ Default roles seeded successfully!");
        return { success: true };
    } catch (error) {
        console.error("❌ Error seeding default roles:", error);
        return { success: false, error };
    }
}

// Export role IDs for easy reference
export const ROLE_IDS = {
    OWNER: "role-owner",
    MANAGER: "role-manager",
    PRODUCT_EDITOR: "role-product-editor",
    CATALOG_MANAGER: "role-catalog-manager",
    SUPPORT_STAFF: "role-support-staff",
    FINANCE_MANAGER: "role-finance-manager",
} as const;
