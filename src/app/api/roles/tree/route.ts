import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { roles, roleHierarchy } from "@/db/schema";
import { eq } from "drizzle-orm";

interface TreeNode {
    name: string;
    id: string;
    description?: string;
    children?: TreeNode[];
}

export async function GET(request: NextRequest) {
    try {
        // Fetch all roles
        const allRoles = await db.select().from(roles);

        // Fetch all hierarchy relationships
        const allHierarchy = await db.select().from(roleHierarchy);

        // Build tree recursively
        function buildTree(parentId: string | null): TreeNode[] {
            const children = allHierarchy
                .filter(h => h.parentRoleId === parentId)
                .sort((a, b) => a.orderPosition - b.orderPosition)
                .map(h => {
                    const role = allRoles.find(r => r.id === h.childRoleId);
                    if (!role) return null;

                    return {
                        name: role.roleName,
                        id: role.id,
                        description: role.description || undefined,
                        children: buildTree(role.id),
                    };
                })
                .filter((node) => node !== null) as TreeNode[];

            return children;
        }

        // Find the owner role as the root
        const ownerRole = allRoles.find(r => r.roleName === "Owner");

        if (!ownerRole) {
            return NextResponse.json(
                { error: "Owner role not found" },
                { status: 404 }
            );
        }

        // Build the complete tree
        const tree: TreeNode[] = [
            {
                name: ownerRole.roleName,
                id: ownerRole.id,
                description: ownerRole.description || undefined,
                children: buildTree(ownerRole.id),
            },
        ];

        return NextResponse.json(tree);
    } catch (error) {
        console.error("Error building role tree:", error);
        return NextResponse.json(
            { error: "Failed to build role tree" },
            { status: 500 }
        );
    }
}
