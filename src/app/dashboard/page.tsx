"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { DashboardBasic } from "@/components/dashboard/DashboardBasic";
import { DashboardAdvanced } from "@/components/dashboard/DashboardAdvanced";

export default function DashboardPage() {
  const { data: session } = useSession();

  // Determine Plan (Mock logic for now, or use real plan from session)
  // Default to Basic for new users, assume "pro" or "growth" keywords in plan name mean Advanced
  const userPlan = (session?.user as any)?.plan || "basic";
  const isAdvanced = ["pro", "growth", "enterprise", "advanced"].includes(userPlan.toLowerCase());

  const [stats, setStats] = useState({
    messages: "0",
    leads: "0",
    orders: "0",
    revenue: "₹0",
  });

  const [inboxStats, setInboxStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Parallel fetch for efficiency
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/dashboard/stats").catch(() => null),
        fetch("/api/orders?limit=5").catch(() => null)
      ]);

      if (statsRes?.ok) {
        const data = await statsRes.json();
        // data structure: { topStats: {...}, inboxStats: {...}, chartData: [...] }

        if (data.topStats) {
          setStats({
            messages: (data.topStats.messages || 0).toString(),
            leads: (data.topStats.leads || 0).toString(),
            orders: (data.topStats.orders || 0).toString(),
            revenue: data.topStats.revenue ? `₹${data.topStats.revenue.toLocaleString()}` : "₹0"
          });
        }

        if (data.inboxStats) {
          setInboxStats(data.inboxStats);
        }

        if (data.chartData) {
          setChartData(data.chartData);
        }
      }

      if (ordersRes?.ok) {
        const ordersData = await ordersRes.json();
        // Verify array
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        }
      }
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-zinc-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-zinc-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-zinc-900 font-sans h-[calc(100vh-80px)] overflow-y-auto p-1 custom-scrollbar">
      {/* Render appropriate dashboard based on plan */}
      {isAdvanced ? (
        <DashboardAdvanced
          stats={stats}
          inboxStats={inboxStats}
          orders={orders}
          chartData={chartData}
        />
      ) : (
        <DashboardBasic
          stats={stats}
          inboxStats={inboxStats}
          orders={orders}
          chartData={chartData}
        />
      )}
    </div>
  );
}
