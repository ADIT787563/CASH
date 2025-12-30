"use client";

import { AlertTriangle, Info, BellRing, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface ActionItem {
    type: "warning" | "info" | "urgent";
    message: string;
    link: string;
}

interface ActionCenterProps {
    actions: ActionItem[];
}

export function ActionCenter({ actions }: ActionCenterProps) {
    const [dismissed, setDismissed] = useState<number[]>([]);

    const visibleActions = actions.filter((_, i) => !dismissed.includes(i));

    if (visibleActions.length === 0) return null;

    return (
        <div className="bg-card border rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-yellow-500/10 rounded-md">
                    <BellRing className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-lg">Action Center</h3>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {visibleActions.length} New
                </span>
            </div>

            <div className="space-y-3">
                {visibleActions.map((action, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted border border-transparent hover:border-border rounded-lg transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            {action.type === "urgent" && <AlertTriangle className="w-5 h-5 text-red-500" />}
                            {action.type === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                            {action.type === "info" && <Info className="w-5 h-5 text-blue-500" />}

                            <span className="text-sm font-medium">{action.message}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href={action.link}>
                                <Button size="sm" variant="ghost" className="h-8 gap-1 text-primary hover:text-primary/80">
                                    Take Action <ChevronRight className="w-3 h-3" />
                                </Button>
                            </Link>
                            <button
                                onClick={() => setDismissed(prev => [...prev, index])}
                                aria-label="Dismiss"
                                className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
