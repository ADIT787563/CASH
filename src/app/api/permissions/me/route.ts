import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserPermissions, getOwnerPermissions } from "@/lib/rbac-permissions";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user permissions
        let permissions = await getUserPermissions(session.user.id);

        // If no permissions found, user might be the business owner
        if (!permissions) {
            permissions = getOwnerPermissions();
        }

        return NextResponse.json({
            permissions,
            userId: session.user.id,
        });
    } catch (error) {
        console.error("Error fetching user permissions:", error);
        return NextResponse.json(
            { error: "Failed to fetch permissions" },
            { status: 500 }
        );
    }
}
