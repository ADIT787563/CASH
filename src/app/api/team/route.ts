import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { rbacTeamMembers, roles } from "@/db/schema";
import { eq } from "drizzle-orm";

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

        // Get all team members for this business
        const teamMembers = await db
            .select({
                id: rbacTeamMembers.id,
                email: rbacTeamMembers.email,
                name: rbacTeamMembers.name,
                status: rbacTeamMembers.status,
                roleId: rbacTeamMembers.roleId,
                roleName: roles.roleName,
                roleDescription: roles.description,
                createdAt: rbacTeamMembers.createdAt,
                userId: rbacTeamMembers.userId,
            })
            .from(rbacTeamMembers)
            .leftJoin(roles, eq(rbacTeamMembers.roleId, roles.id))
            .where(eq(rbacTeamMembers.businessId, session.user.id));

        return NextResponse.json({ teamMembers });
    } catch (error) {
        console.error("Error fetching team members:", error);
        return NextResponse.json(
            { error: "Failed to fetch team members" },
            { status: 500 }
        );
    }
}
