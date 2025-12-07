"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Users } from "lucide-react";

interface TreeNode {
    name: string;
    id: string;
    description?: string;
    children?: TreeNode[];
}

interface TreeNodeProps {
    node: TreeNode;
    level: number;
}

function TreeNodeComponent({ node, level }: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="select-none">
            <div
                className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer`}
                style={{ marginLeft: `${level * 24}px` }}
                onClick={() => hasChildren && setIsExpanded(!isExpanded)}
            >
                {hasChildren ? (
                    isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )
                ) : (
                    <div className="w-4" />
                )}

                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{node.name}</div>
                    {node.description && (
                        <div className="text-xs text-muted-foreground truncate">
                            {node.description}
                        </div>
                    )}
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="mt-1">
                    {node.children!.map((child) => (
                        <TreeNodeComponent
                            key={child.id}
                            node={child}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function RoleTreeView() {
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTree() {
            try {
                setLoading(true);
                const res = await fetch("/api/roles/tree");

                if (!res.ok) {
                    throw new Error("Failed to fetch role tree");
                }

                const data = await res.json();
                setTreeData(data);
            } catch (err) {
                console.error("Error fetching role tree:", err);
                setError(err instanceof Error ? err.message : "Failed to load tree");
            } finally {
                setLoading(false);
            }
        }

        fetchTree();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px] border border-border rounded-lg bg-card">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading role hierarchy...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[400px] border border-border rounded-lg bg-card">
                <div className="text-center">
                    <p className="text-destructive mb-2">Error loading role tree</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    if (!treeData || treeData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[400px] border border-border rounded-lg bg-card">
                <p className="text-muted-foreground">No roles found</p>
            </div>
        );
    }

    return (
        <div className="border border-border rounded-lg bg-card p-4">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Role Hierarchy</h3>
                <p className="text-sm text-muted-foreground">
                    Visual representation of your team structure
                </p>
            </div>

            <div className="space-y-1">
                {treeData.map((node) => (
                    <TreeNodeComponent key={node.id} node={node} level={0} />
                ))}
            </div>
        </div>
    );
}
