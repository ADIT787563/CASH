"use client";

import { useState, useEffect } from "react";
import { AlertCircle, TrendingUp, X } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
    title?: string;
    message: string;
    currentLimit: number;
    maxLimit: number;
    feature?: string;
    showClose?: boolean;
    variant?: "banner" | "modal" | "inline";
}

export function UpgradePrompt({
    title = "Upgrade Required",
    message,
    currentLimit,
    maxLimit,
    feature = "catalogs",
    showClose = false,
    variant = "inline",
}: UpgradePromptProps) {
    const [isVisible, setIsVisible] = useState(true);
    const percentage = (currentLimit / maxLimit) * 100;

    if (!isVisible) return null;

    const content = (
        <div className="relative">
            {showClose && (
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 p-1 hover:bg-muted rounded-lg transition-colors"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{message}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>
                                {currentLimit} / {maxLimit} {feature}
                            </span>
                            <span>{percentage.toFixed(0)}% used</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${percentage >= 100
                                    ? "bg-destructive"
                                    : percentage >= 80
                                        ? "bg-yellow-500"
                                        : "bg-primary"
                                    }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }} // eslint-disable-line react-dom/no-unsafe-inline-style
                            />
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                            <TrendingUp className="w-4 h-4" />
                            View Plans & Upgrade
                        </Link>
                        <Link
                            href="/pricing#compare"
                            className="text-sm text-muted-foreground hover:text-foreground underline"
                        >
                            Compare features
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    if (variant === "banner") {
        return (
            <div className="bg-card border-b border-border p-4">
                <div className="container mx-auto">{content}</div>
            </div>
        );
    }

    if (variant === "modal") {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-lg">
                    {content}
                </div>
            </div>
        );
    }

    // Inline variant (default)
    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            {content}
        </div>
    );
}

interface CatalogLimitBadgeProps {
    current: number;
    limit: number;
    className?: string;
}

export function CatalogLimitBadge({
    current,
    limit,
    className = "",
}: CatalogLimitBadgeProps) {
    const percentage = (current / limit) * 100;
    const isNearLimit = percentage >= 80;
    const isAtLimit = percentage >= 100;

    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${isAtLimit
                ? "bg-destructive/10 text-destructive"
                : isNearLimit
                    ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500"
                    : "bg-muted text-muted-foreground"
                } ${className}`}
        >
            <span className="font-medium">
                {current} / {limit}
            </span>
            <span className="text-xs">catalogs</span>
        </div>
    );
}

interface UsageStatsCardProps {
    used: number;
    limit: number;
    isUnlimited?: boolean;
    label: string;
    description?: string;
}

export function UsageStatsCard({
    used,
    limit,
    isUnlimited = false,
    label,
    description,
}: UsageStatsCardProps) {
    const percentage = isUnlimited ? 0 : (used / limit) * 100;

    return (
        <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{label}</h3>
                {isUnlimited ? (
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                        Unlimited
                    </span>
                ) : (
                    <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(0)}% used
                    </span>
                )}
            </div>

            {description && (
                <p className="text-sm text-muted-foreground mb-3">{description}</p>
            )}

            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold">{used}</span>
                {!isUnlimited && (
                    <span className="text-muted-foreground">/ {limit}</span>
                )}
            </div>

            {!isUnlimited && (
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all ${percentage >= 100
                            ? "bg-destructive"
                            : percentage >= 80
                                ? "bg-yellow-500"
                                : "bg-primary"
                            }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
}
