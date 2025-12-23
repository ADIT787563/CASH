"use client";

import { ReactNode } from 'react';
import { useFeatureAccess, usePlan } from '@/hooks/usePlanUsage';
import { UpgradePrompt } from './UpgradePrompt';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
    feature: string;
    children: ReactNode;
    fallback?: ReactNode;
    showUpgradePrompt?: boolean;
    upgradeMessage?: string;
}

/**
 * Component to gate features based on user's plan
 * Usage:
 * <FeatureGate feature="bulkUpload">
 *   <BulkUploadButton />
 * </FeatureGate>
 */
export function FeatureGate({
    feature,
    children,
    fallback,
    showUpgradePrompt = true,
    upgradeMessage,
}: FeatureGateProps) {
    const { hasAccess, loading } = useFeatureAccess(feature);
    const { planName } = usePlan();

    if (loading) {
        return (
            <div className="animate-pulse bg-muted h-10 rounded-lg" />
        );
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
        const message = upgradeMessage || `This feature is not available on your current plan (${planName}).`;

        return (
            <div className="relative">
                <div className="opacity-50 pointer-events-none blur-sm select-none">
                    {children}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-lg max-w-md">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Lock className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-semibold">Premium Feature</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{message}</p>
                        <a
                            href="/pricing"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                            Upgrade to Access
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

interface FeatureButtonProps {
    feature: string;
    onClick?: () => void;
    children: ReactNode;
    className?: string;
    disabled?: boolean;
}

/**
 * Button that's automatically disabled if feature is not available
 */
export function FeatureButton({
    feature,
    onClick,
    children,
    className = '',
    disabled = false,
}: FeatureButtonProps) {
    const { hasAccess, loading } = useFeatureAccess(feature);

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading || !hasAccess}
            className={`${className} ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!hasAccess ? 'This feature requires a plan upgrade' : ''}
        >
            {children}
            {!hasAccess && (
                <Lock className="w-4 h-4 ml-2 inline" />
            )}
        </button>
    );
}

interface PlanBadgeProps {
    requiredPlan: 'starter' | 'growth' | 'agency' | 'enterprise';
    className?: string;
}

/**
 * Badge showing which plan is required for a feature
 */
export function PlanBadge({ requiredPlan, className = '' }: PlanBadgeProps) {
    const colors = {
        starter: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
        growth: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20',
        agency: 'bg-stone-500/10 text-stone-600 border-stone-500/20',
        enterprise: 'bg-white/10 text-white border-white/20',
    };

    const names = {
        starter: 'Starter',
        growth: 'Growth',
        agency: 'Agency',
        enterprise: 'Enterprise',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors[requiredPlan]} ${className}`}
        >
            <Lock className="w-3 h-3" />
            {names[requiredPlan]}+
        </span>
    );
}
