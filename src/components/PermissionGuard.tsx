"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Permissions, checkPermission } from "@/lib/rbac-permissions";
import { Shield, Lock } from "lucide-react";

interface PermissionGuardProps {
    resource: keyof Permissions;
    action: string;
    children: ReactNode;
    fallback?: ReactNode;
    showMessage?: boolean;
}

export function PermissionGuard({
    resource,
    action,
    children,
    fallback,
    showMessage = true,
}: PermissionGuardProps) {
    const { data: session } = useSession();
    const [permissions, setPermissions] = useState<Permissions | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPermissions() {
            if (!session?.user?.id) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/permissions/me");
                if (res.ok) {
                    const data = await res.json();
                    setPermissions(data.permissions);
                }
            } catch (error) {
                console.error("Error fetching permissions:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchPermissions();
    }, [session?.user?.id]);

    if (loading) {
        return null; // or a loading skeleton
    }

    const hasPermission = checkPermission(permissions, resource, action);

    if (!hasPermission) {
        if (fallback) {
            return <>{fallback}</>;
        }

        if (showMessage) {
            return (
                <div className="flex items-center justify-center p-8 border border-border rounded-lg bg-muted/20">
                    <div className="text-center max-w-md">
                        <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                        <p className="text-sm text-muted-foreground">
                            You don't have permission to {action} {resource}. Please contact your administrator if you need access.
                        </p>
                    </div>
                </div>
            );
        }

        return null;
    }

    return <>{children}</>;
}

interface PermissionCheckProps {
    resource: keyof Permissions;
    action: string;
    children: (hasPermission: boolean) => ReactNode;
}

/**
 * Render prop version for more flexible permission checking
 */
export function PermissionCheck({
    resource,
    action,
    children,
}: PermissionCheckProps) {
    const { data: session } = useSession();
    const [permissions, setPermissions] = useState<Permissions | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPermissions() {
            if (!session?.user?.id) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/permissions/me");
                if (res.ok) {
                    const data = await res.json();
                    setPermissions(data.permissions);
                }
            } catch (error) {
                console.error("Error fetching permissions:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchPermissions();
    }, [session?.user?.id]);

    if (loading) {
        return null;
    }

    const hasPermission = checkPermission(permissions, resource, action);
    return <>{children(hasPermission)}</>;
}
