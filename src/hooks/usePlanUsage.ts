"use client";

import { useEffect, useState } from 'react';

export interface PlanInfo {
    id: 'free' | 'starter' | 'growth' | 'agency' | 'enterprise';
    name: string;
    limits: {
        catalogs: number;
        messages: number;
        templates: number;
        teamMembers: number;
        aiAssistant: boolean;
        productFields: 'basic' | 'advanced' | 'full';
        bulkUpload: boolean;
        aiDescriptions: boolean;
        roleBasedAccess: boolean;
        advancedAnalytics: boolean;
        apiAccess: boolean;
        [key: string]: any;
    };
}

export interface UsageInfo {
    catalogs: {
        used: number;
        limit: number;
        percentage: number;
        isUnlimited: boolean;
    };
}

export interface PlanUsageData {
    plan: PlanInfo;
    usage: UsageInfo;
}

/**
 * Hook to get current user's plan and usage information
 */
export function usePlanUsage() {
    const [data, setData] = useState<PlanUsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPlanUsage() {
            try {
                const response = await fetch('/api/plan/usage');
                if (!response.ok) {
                    throw new Error('Failed to fetch plan usage');
                }
                const planData = await response.json();
                setData(planData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchPlanUsage();
    }, []);

    return { data, loading, error };
}

/**
 * Hook to check if a feature is available
 */
export function useFeatureAccess(feature: string) {
    const { data, loading } = usePlanUsage();

    if (loading || !data) {
        return { hasAccess: false, loading };
    }

    const featureValue = data.plan.limits[feature];

    // Boolean features
    if (typeof featureValue === 'boolean') {
        return { hasAccess: featureValue, loading: false };
    }

    // -1 means unlimited
    if (featureValue === -1) {
        return { hasAccess: true, loading: false };
    }

    // If it exists and is truthy, allow access
    return { hasAccess: !!featureValue, loading: false };
}

/**
 * Hook to check catalog limit
 */
export function useCatalogLimit() {
    const { data, loading } = usePlanUsage();

    if (loading || !data) {
        return {
            canAdd: false,
            used: 0,
            limit: 0,
            percentage: 0,
            loading: true,
        };
    }

    const { used, limit, percentage, isUnlimited } = data.usage.catalogs;
    const canAdd = isUnlimited || used < limit;

    return {
        canAdd,
        used,
        limit: isUnlimited ? -1 : limit,
        percentage,
        isUnlimited,
        loading: false,
    };
}

/**
 * Hook to get plan name and ID
 */
export function usePlan() {
    const { data, loading } = usePlanUsage();

    return {
        planId: data?.plan.id || 'free',
        planName: data?.plan.name || 'Free',
        loading,
    };
}
