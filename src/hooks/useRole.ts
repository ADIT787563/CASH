"use client";

import { useSession } from "@/lib/auth-client";
import { useMemo } from "react";

export type UserRole = "owner" | "admin" | "manager" | "agent" | "viewer";

export interface PermissionMap {
    [key: string]: UserRole[];
}

const PERMISSIONS: PermissionMap = {
    "manage:billing": ["owner"],
    "manage:settings": ["owner", "admin"],
    "manage:team": ["owner", "admin"],
    "manage:chatbot": ["owner", "admin", "manager"],
    "manage:catalog": ["owner", "admin", "manager"],
    "manage:leads": ["owner", "admin", "manager", "agent"],
    "delete:product": ["owner", "admin"],
    "delete:lead": ["owner", "admin"],
    "view:analytics": ["owner", "admin", "manager"],
};

export function useRole() {
    const { data: session, isPending } = useSession();

    const role = useMemo(() => {
        return ((session?.user as any)?.role as UserRole) || "viewer";
    }, [session]);

    const checkPermission = (permission: keyof typeof PERMISSIONS) => {
        if (isPending) return false;
        const allowedRoles = PERMISSIONS[permission];
        return allowedRoles?.includes(role) || false;
    };

    return {
        role,
        isPending,
        isOwner: role === "owner",
        isAdmin: role === "admin" || role === "owner",
        isManager: ["owner", "admin", "manager"].includes(role),
        isAgent: ["owner", "admin", "manager", "agent"].includes(role),
        checkPermission,
        // Helper to get allowed roles for a specific action (useful for UI tooltips)
        getAllowedRoles: (permission: keyof typeof PERMISSIONS) => PERMISSIONS[permission] || [],
    };
}
