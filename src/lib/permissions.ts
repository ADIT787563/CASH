import { ROLES, Role } from './roles';

/**
 * Detailed permission matrix for WhatsApp SaaS
 * Maps each feature to the roles that can access it
 */
export const PERMISSION_MATRIX = {
    // WhatsApp Integration
    connectWhatsApp: {
        allowed: [ROLES.OWNER],
        description: 'Connect WhatsApp API and manage phone number',
    },

    // Template Management
    createTemplate: {
        allowed: [ROLES.OWNER, ROLES.ADMIN],
        description: 'Create new WhatsApp message templates',
    },
    editTemplate: {
        allowed: [ROLES.OWNER, ROLES.ADMIN],
        description: 'Edit existing templates',
    },
    deleteTemplate: {
        allowed: [ROLES.OWNER, ROLES.ADMIN],
        description: 'Delete templates',
    },
    viewTemplate: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],
        description: 'View templates',
    },

    // Campaign Management
    createCampaign: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER],
        description: 'Create and run bulk campaigns',
    },
    viewCampaign: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],
        description: 'View campaign details and statistics',
    },

    // Chat & Messaging
    replyToChat: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT],
        description: 'Reply to customer chats',
    },
    sendMessage: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT],
        description: 'Send messages to customers',
    },
    viewMessages: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],
        description: 'View message history',
    },

    // Lead Management
    createLead: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT],
        description: 'Create new leads',
    },
    editLead: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT],
        description: 'Edit lead information and status',
    },
    deleteLead: {
        allowed: [ROLES.OWNER, ROLES.ADMIN],
        description: 'Delete leads',
    },
    viewLead: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],
        description: 'View lead information',
    },

    // Product Management
    createProduct: {
        allowed: [ROLES.OWNER, ROLES.ADMIN],
        description: 'Create new products',
    },
    editProduct: {
        allowed: [ROLES.OWNER, ROLES.ADMIN],
        description: 'Edit product details',
    },
    deleteProduct: {
        allowed: [ROLES.OWNER, ROLES.ADMIN],
        description: 'Delete products',
    },
    viewProduct: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],
        description: 'View product catalog',
    },

    // Analytics
    viewAnalytics: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],
        description: 'View dashboard analytics and reports',
    },
    exportAnalytics: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER],
        description: 'Export analytics data',
    },

    // Team Management
    inviteTeamMember: {
        allowed: [ROLES.OWNER, ROLES.ADMIN],
        description: 'Invite new team members',
    },
    removeTeamMember: {
        allowed: [ROLES.OWNER, ROLES.ADMIN],
        description: 'Remove team members (with restrictions)',
    },
    changeTeamMemberRole: {
        allowed: [ROLES.OWNER],
        description: 'Change team member roles',
    },
    viewTeamMembers: {
        allowed: [ROLES.OWNER, ROLES.ADMIN],
        description: 'View team member list',
    },

    // Billing & Subscription
    manageBilling: {
        allowed: [ROLES.OWNER],
        description: 'Manage billing and subscription',
    },
    viewBilling: {
        allowed: [ROLES.OWNER],
        description: 'View billing information',
    },

    // Chatbot Settings
    editChatbot: {
        allowed: [ROLES.OWNER, ROLES.ADMIN],
        description: 'Edit chatbot logic and settings',
    },
    viewChatbot: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],
        description: 'View chatbot settings',
    },

    // Business Settings
    editBusinessSettings: {
        allowed: [ROLES.OWNER, ROLES.ADMIN],
        description: 'Edit business profile and settings',
    },
    viewBusinessSettings: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER],
        description: 'View business settings',
    },

    // Orders
    manageOrders: {
        allowed: [ROLES.OWNER, ROLES.ADMIN],
        description: 'Manage orders and fulfillment',
    },
    viewOrders: {
        allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT, ROLES.VIEWER],
        description: 'View order history',
    },
} as const;

export type PermissionKey = keyof typeof PERMISSION_MATRIX;

/**
 * Check if a role has access to a specific feature
 */
export function hasFeatureAccess(role: Role, feature: PermissionKey): boolean {
    return (PERMISSION_MATRIX[feature].allowed as readonly Role[]).includes(role);
}

/**
 * Get all features accessible by a role
 */
export function getAccessibleFeatures(role: Role): PermissionKey[] {
    return Object.keys(PERMISSION_MATRIX).filter((feature) =>
        (PERMISSION_MATRIX[feature as PermissionKey].allowed as readonly Role[]).includes(role)
    ) as PermissionKey[];
}

/**
 * Get role display information
 */
export const ROLE_INFO = {
    [ROLES.OWNER]: {
        label: 'Owner',
        description: 'Full access to all features including billing and team management',
        color: 'purple',
    },
    [ROLES.ADMIN]: {
        label: 'Admin',
        description: 'Manage daily operations, products, leads, and campaigns',
        color: 'blue',
    },
    [ROLES.MANAGER]: {
        label: 'Manager',
        description: 'Run campaigns, manage leads, and view analytics',
        color: 'green',
    },
    [ROLES.AGENT]: {
        label: 'Agent',
        description: 'Handle customer chats and update lead status',
        color: 'yellow',
    },
    [ROLES.VIEWER]: {
        label: 'Viewer',
        description: 'Read-only access to dashboard and analytics',
        color: 'gray',
    },
} as const;
