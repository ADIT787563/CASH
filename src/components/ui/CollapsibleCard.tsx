"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CollapsibleCardProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    storageKey: string; // Unique key for localStorage
    defaultExpanded?: boolean;
    headerAction?: React.ReactNode; // Extra content in header (e.g. Always visible stats)
}

export function CollapsibleCard({
    title,
    subtitle,
    icon,
    children,
    className,
    storageKey,
    defaultExpanded = true,
    headerAction
}: CollapsibleCardProps) {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        // Load state from local storage on mount
        const savedState = localStorage.getItem(`collapsible_${storageKey}`);
        if (savedState !== null) {
            setIsExpanded(savedState === "true");
        } else {
            // Default behavior: Expanded on desktop, collapsed on mobile (simple check)
            const isMobile = window.innerWidth < 768;
            setIsExpanded(isMobile ? false : defaultExpanded);
        }
    }, [storageKey, defaultExpanded]);

    const toggleExpand = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        localStorage.setItem(`collapsible_${storageKey}`, String(newState));
    };

    // Prevent hydration mismatch by rendering default state first, then updating after mount if needed for complex logic
    // But for simple "hidden/shown", we might want to avoid flash.
    // We'll trust the defaultExpanded for server/first render match if possible, or accept re-render.

    return (
        <div className={cn("bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-200", className)}>
            <div
                className="p-5 flex items-start justify-between cursor-pointer hover:bg-muted/30 transition-colors select-none"
                onClick={toggleExpand}
            >
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-lg leading-none">{title}</h3>
                        {subtitle && <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Header Action: Always visible content */}
                    {headerAction && (
                        <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
                            {headerAction}
                        </div>
                    )}

                    <button
                        className="p-1 hover:bg-muted rounded-full text-muted-foreground transition-colors"
                        aria-label={isExpanded ? "Collapse section" : "Expand section"}
                    >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <div className="px-5 pb-5 pt-0 border-t border-transparent">
                            {/* Small spacer/line if needed, or just content */}
                            <div className="pt-4">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
