"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface PricingPlan {
    id: number;
    planId: string;
    planName: string;
    monthlyPrice: number;
    yearlyPrice: number | null;
    features: string[];
    limits: {
        messages?: number;
        whatsappNumbers?: number;
        templates?: number;
        leads?: number;
        [key: string]: any;
    };
    icon?: string;
    color?: string;
    bgColor?: string;
    isPopular?: boolean;
    isActive: boolean;
    sortOrder: number;
}

export interface ContentSettings {
    [key: string]: any;
}

// Hook to fetch pricing plans
export function usePricing() {
    return useQuery<PricingPlan[]>({
        queryKey: ["config", "pricing"],
        queryFn: async () => {
            const res = await fetch("/api/config/pricing");
            if (!res.ok) throw new Error("Failed to fetch pricing");
            return res.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

// Hook to fetch content settings
export function useContent() {
    return useQuery<ContentSettings>({
        queryKey: ["config", "content"],
        queryFn: async () => {
            const res = await fetch("/api/config/content");
            if (!res.ok) throw new Error("Failed to fetch content");
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

// Hook to get a specific plan by planId
export function usePlan(planId: string) {
    const { data: plans, ...rest } = usePricing();
    const plan = plans?.find((p) => p.planId === planId);
    return { data: plan, ...rest };
}

// Hook to update pricing (admin only)
export function useUpdatePricing() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<PricingPlan> & { id: number }) => {
            const res = await fetch("/api/config/pricing", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update pricing");
            return res.json();
        },
        onSuccess: () => {
            // Invalidate pricing cache to refetch
            queryClient.invalidateQueries({ queryKey: ["config", "pricing"] });
        },
    });
}

// Hook to update content (admin only)
export function useUpdateContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { key: string; value: any }) => {
            const res = await fetch("/api/config/content", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update content");
            return res.json();
        },
        onSuccess: () => {
            // Invalidate content cache to refetch
            queryClient.invalidateQueries({ queryKey: ["config", "content"] });
        },
    });
}

export interface FeatureFlag {
    id: number;
    featureKey: string;
    isEnabled: boolean;
    config?: Record<string, any>;
    description?: string;
}

// Hook to fetch feature flags
export function useFeatureFlags() {
    return useQuery<FeatureFlag[]>({
        queryKey: ["config", "features"],
        queryFn: async () => {
            const res = await fetch("/api/config/features");
            if (!res.ok) throw new Error("Failed to fetch feature flags");
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

// Hook to update feature flag
export function useUpdateFeatureFlag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { featureKey: string; isEnabled: boolean; config?: any }) => {
            const res = await fetch("/api/config/features", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update feature flag");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["config", "features"] });
        },
    });
}

// Combined hook for all config
export function useConfig() {
    const pricing = usePricing();
    const content = useContent();
    const features = useFeatureFlags();

    return {
        pricing: pricing.data || [],
        content: content.data || {},
        features: features.data || [],
        isLoading: pricing.isLoading || content.isLoading || features.isLoading,
        isError: pricing.isError || content.isError || features.isError,
    };
}
