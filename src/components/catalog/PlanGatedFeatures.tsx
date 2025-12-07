"use client";

import { CatalogLimitBadge, UpgradePrompt } from '@/components/UpgradePrompt';
import { useCatalogLimit, useFeatureAccess } from '@/hooks/usePlanUsage';
import { FeatureGate, PlanBadge } from '@/components/FeatureGate';
import { Upload, Sparkles } from 'lucide-react';
import Link from 'next/link';

/**
 * Catalog Header with Plan Limits
 * To be added at the top of the catalog page
 */
export function CatalogHeader() {
    const { canAdd, used, limit, isUnlimited, loading } = useCatalogLimit();

    if (loading) {
        return <div className="h-20 bg-muted animate-pulse rounded-xl mb-6" />;
    }

    const isNearLimit = !isUnlimited && used >= limit * 0.8;
    const isAtLimit = !isUnlimited && used >= limit;

    return (
        <div className="mb-6">
            {/* Limit Badge and Progress */}
            <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Catalog Usage</h3>
                        <p className="text-sm text-muted-foreground">
                            {isUnlimited
                                ? 'Unlimited products on your plan'
                                : `${used} of ${limit} products used`}
                        </p>
                    </div>
                    <CatalogLimitBadge current={used} limit={limit} />
                </div>

                {!isUnlimited && (
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all ${isAtLimit
                                    ? 'bg-destructive'
                                    : isNearLimit
                                        ? 'bg-yellow-500'
                                        : 'bg-primary'
                                }`}
                            style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
                        />
                    </div>
                )}

                {isNearLimit && !isAtLimit && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-500">
                            ⚠️ You're approaching your limit. Consider upgrading to add more products.
                        </p>
                    </div>
                )}

                {isAtLimit && (
                    <div className="mt-4">
                        <UpgradePrompt
                            message="You've reached your catalog limit. Upgrade your plan to add more products!"
                            currentLimit={used}
                            maxLimit={limit}
                            feature="catalogs"
                            showClose={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Add Product Button with Limit Check
 */
export function AddProductButton() {
    const { canAdd, used, limit, loading } = useCatalogLimit();

    if (loading) {
        return (
            <div className="px-6 py-3 bg-muted animate-pulse rounded-lg">
                <div className="w-24 h-5" />
            </div>
        );
    }

    if (!canAdd) {
        return (
            <button
                disabled
                className="px-6 py-3 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed opacity-50 flex items-center gap-2"
                title={`You've reached your limit of ${limit} products. Upgrade to add more.`}
            >
                <span>Add Product</span>
                <span className="text-xs">({used}/{limit})</span>
            </button>
        );
    }

    return (
        <Link
            href="/catalog/products/new"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
            <span>+</span>
            Add Product
        </Link>
    );
}

/**
 * Bulk Upload Feature (Agency+ only)
 */
export function BulkUploadButton() {
    return (
        <FeatureGate
            feature="bulkUpload"
            upgradeMessage="Bulk upload is available on Agency plan and above"
        >
            <Link
                href="/catalog/bulk-upload"
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
                <Upload className="w-5 h-5" />
                Bulk Upload
                <PlanBadge requiredPlan="agency" className="ml-2" />
            </Link>
        </FeatureGate>
    );
}

/**
 * AI Features Section
 */
export function AIFeaturesSection() {
    const { hasAccess: hasAI } = useFeatureAccess('aiAssistant');

    // Always show the section, but gate the actual functionality
    return (
        <div className="mt-8 glass-card p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10 relative">
            <FeatureGate
                feature="aiAssistant"
                fallback={
                    // Show as locked for non-AI plans
                    <div className="opacity-50 blur-sm pointer-events-none">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-2xl">
                                <Sparkles className="w-12 h-12 text-white" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-bold mb-2">
                                    AI <span className="gradient-text">Catalog Builder</span>
                                </h3>
                                <p className="text-muted-foreground">
                                    Upload CSV or images and let AI generate beautiful product cards
                                </p>
                            </div>
                        </div>
                    </div>
                }
                showUpgradePrompt
                upgradeMessage="AI features are available on Growth plan and above"
            >
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-2xl">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold mb-2">
                            AI <span className="gradient-text">Catalog Builder</span>
                        </h3>
                        <p className="text-muted-foreground">
                            Upload CSV or images and let AI generate beautiful product cards automatically
                        </p>
                    </div>
                    <Link
                        href="/catalog/ai-builder"
                        className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <Upload className="w-5 h-5" />
                        Upload & Generate
                    </Link>
                </div>
            </FeatureGate>
        </div>
    );
}
