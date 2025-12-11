"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import ProtectedPage from "@/components/ProtectedPage";
import { Footer } from "@/components/home/Footer";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { OrderTable } from "@/components/dashboard/OrderTable";

interface ActivityItem {
  id: string | number;
  type: string;
  message: string;
  time: string;
  status: "success" | "pending" | "error";
  title?: string; // Mapped for UI
  desc?: string; // Mapped for UI
}

function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({ earningsData: [], trafficData: [] });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("bearer_token");
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, ordersRes, chartsRes, activityRes] = await Promise.all([
          fetch("/api/dashboard/stats", { headers }),
          fetch("/api/dashboard/orders", { headers }),
          fetch("/api/dashboard/charts", { headers }),
          fetch("/api/dashboard/activity", { headers })
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (chartsRes.ok) setChartData(await chartsRes.json());
        if (activityRes.ok) setActivities(await activityRes.json());

      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <main className="container mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            Stats Overview
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {user?.name}
          </p>
        </div>

        {/* Top Charts Row */}
        <DashboardCharts
          earningsData={chartData.earningsData}
          trafficData={chartData.trafficData}
          totalEarnings={chartData.totalEarnings}
          totalSales={chartData.totalSales}
          loading={isLoading}
        />

        {/* Stat Cards Row */}
        <StatCards stats={stats} loading={isLoading} />

        {/* Bottom Row: Activity & Orders */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 h-full">
            <RecentActivity activities={activities.length > 0 ? activities : undefined} />
          </div>
          <div className="xl:col-span-2 h-full">
            <OrderTable orders={orders} />
          </div>
        </div>
      </main>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedPage>
      <DashboardContent />
    </ProtectedPage>
  );
}
