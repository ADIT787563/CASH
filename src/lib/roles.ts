/**
 * Role definitions - Client-safe constants
 * Can be imported in both client and server components
 */
export const ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MANAGER: 'manager',
    AGENT: 'agent',
    VIEWER: 'viewer',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
