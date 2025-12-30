"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePlanUsage } from "@/hooks/usePlanUsage";
import { BusinessHealthSummary } from "@/components/dashboard/BusinessHealthSummary";
import { ActionCenter, ActionItem } from "@/components/dashboard/ActionCenter";
import { LiveOperations } from "@/components/dashboard/LiveOperations";
import { PerformanceAnalytics } from "@/components/dashboard/PerformanceAnalytics";
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: planData, loading: planLoading } = usePlanUsage();

  // Advanced feature check (Mock logic or use plan data)
  const isAdvanced = planData?.plan.id !== 'free' && planData?.plan.id !== 'starter';

  const [data, setData] = useState<{
    stats: any;
    inbox: any[];
    orders: any[];
    chartData: any[];
    actionItems: ActionItem[];
    funnelData: any[];
    aiInsights: any[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/dashboard/stats").catch(() => null),
        fetch("/api/orders?limit=5").catch(() => null)
      ]);

      let dashboardData: any = {};

      if (statsRes?.ok) {
        const statsJson = await statsRes.json();

        dashboardData = {
          stats: {
            messages: (statsJson.topStats?.messages || 0).toString(),
            leads: (statsJson.topStats?.leads || 0).toString(),
            orders: (statsJson.topStats?.orders || 0).toString(),
            revenue: statsJson.topStats?.revenue ? `₹${statsJson.topStats.revenue.toLocaleString()}` : "₹0"
          },
          inbox: [], // Would fetch real inbox messages here
          chartData: statsJson.chartData || [],
          actionItems: statsJson.actionItems || [],
          funnelData: statsJson.funnelData || [],
          aiInsights: statsJson.aiInsights || []
        };
      }

      if (ordersRes?.ok) {
        const ordersData = await ordersRes.json();
        if (Array.isArray(ordersData)) {
          dashboardData.orders = ordersData;
        } else {
          dashboardData.orders = [];
        }
      }

      setData(dashboardData);
    } catch (error) {
      console.error("Dashboard data load error", error);
      toast.error("Could not load latest stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading || planLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-6 pb-20 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's what's happening in your store.
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* 2. Business Health Summary */}
        {data?.stats && <BusinessHealthSummary stats={data.stats} />}

        {/* 3. Action Center */}
        {data?.actionItems && <ActionCenter actions={data.actionItems} />}

        {/* 4. Live Operations (Inbox & Orders) */}
        <LiveOperations
          inbox={data?.inbox || []}
          orders={data?.orders || []}
        />

        {/* 5. Performance Analytics */}
        <PerformanceAnalytics
          chartData={data?.chartData || []}
          funnelData={data?.funnelData || []}
        />

        {/* 6. AI Insights (Pro Only) */}
        <AIInsightsPanel
          insights={data?.aiInsights || []}
          isLocked={!isAdvanced}
        />
      </div>
    </div>
  );
}
