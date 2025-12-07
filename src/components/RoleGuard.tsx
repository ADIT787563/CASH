"use client";

import { ReactNode } from 'react';
import { useSession } from '@/lib/auth-client';
import { Role } from '@/lib/rbac';

interface RoleGuardProps {
    allowedRoles: Role[];
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * RoleGuard Component
 * 
 * Conditionally renders children based on user's role
 * Usage: <RoleGuard allowedRoles={['owner', 'admin']}>...</RoleGuard>
 */
export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
    const { data: session, isPending } = useSession();

    // Show nothing while loading
    if (isPending) {
        return null;
    }

    // No session, hide content
    if (!session?.user) {
        return <>{fallback}</>;
    }

    // Check if user's role is in allowed roles
    const userRole = (session.user as any).role || 'viewer';
    const hasAccess = allowedRoles.includes(userRole);

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
