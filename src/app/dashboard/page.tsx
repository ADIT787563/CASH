"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { StatCards } from "@/components/dashboard/StatCards";
import InboxClient from "./inbox/InboxClient";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Aditya";

  const [stats, setStats] = useState({
    messages: "0",
    leads: "0",
    orders: "0",
    revenue: "₹0",
  });

  const [inboxStats, setInboxStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      // Parallel fetch for efficiency
      const [analyticsRes, ordersRes] = await Promise.all([
        fetch("/api/analytics?mode=dashboard").catch(() => null),
        fetch("/api/orders?limit=5").catch(() => null)
      ]);

      if (analyticsRes?.ok) {
        const data = await analyticsRes.json();
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
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="text-zinc-900 font-sans h-[calc(100vh-80px)] flex flex-col">

      {/* HEADER SECTION */}
      <div className="flex-none mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 mb-1 tracking-tight">
              Welcome back, {userName.split(' ')[0]}! 👋
            </h1>
            <p className="text-zinc-500 text-sm flex items-center gap-2">
              Here is your daily activity and performance. <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Status Pill */}
            <div className="flex items-center gap-3 bg-white border border-zinc-200 px-4 py-2 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-zinc-600">AI Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></div>
                <span className="text-emerald-600 font-bold text-sm tracking-wide">ON</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS CARDS (Clickable summary) */}
      <div className="flex-none mb-8">
        <StatCards stats={stats} />
      </div>

      {/* INBOX SECTION (Takes remaining height) */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Live Inbox</h2>
        </div>
        <div className="flex-1 min-h-0 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden relative">
          <InboxClient
            inboxStats={inboxStats}
            orders={orders}
            chartData={chartData}
          />
        </div>
      </div>

    </div>
  );
}
