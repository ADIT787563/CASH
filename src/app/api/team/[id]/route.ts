import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { rbacTeamMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const body = await request.json();
        const { roleId, status } = body;

        // Update team member
        const updated = await db
            .update(rbacTeamMembers)
            .set({
                ...(roleId && { roleId }),
                ...(status && { status }),
                updatedAt: new Date(),
            })
            .where(eq(rbacTeamMembers.id, id))
            .returning();

        if (!updated || updated.length === 0) {
            return NextResponse.json(
                { error: "Team member not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            teamMember: updated[0]
        });
    } catch (error) {
        console.error("Error updating team member:", error);
        return NextResponse.json(
            { error: "Failed to update team member" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        // Delete team member
        await db
            .delete(rbacTeamMembers)
            .where(eq(rbacTeamMembers.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting team member:", error);
        return NextResponse.json(
            { error: "Failed to delete team member" },
            { status: 500 }
        );
    }
}
