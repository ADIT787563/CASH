
"use client";

import { useEffect, useState, useMemo } from "react";
import { MessageSquare, RefreshCw } from "lucide-react";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentConversations } from "@/components/dashboard/RecentConversations";
import { UsageCard } from "@/components/dashboard/UsageCard";
import { AiStatusCard } from "@/components/dashboard/AiStatusCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";

// Mock Chart Data if real data is empty
const MOCK_CHART_DATA = Array.from({ length: 7 }).map((_, i) => ({
  date: format(subDays(new Date(), 6 - i), "MMM dd"),
  messages: Math.floor(Math.random() * 100) + 50,
  leads: Math.floor(Math.random() * 30) + 10,
}));

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Aditya"; // Fallback as per design request

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    messages: "0",
    leads: "0",
    orders: "0",
    revenue: "₹0",
  });
  const [recentConvos, setRecentConvos] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>(MOCK_CHART_DATA);

  // Settings for Sidebar Widgets
  const [usage, setUsage] = useState({ used: 1450, limit: 2000 });
  const [aiStatus, setAiStatus] = useState({ active: true, replies: 142, avgTime: "2.3s", satisfaction: "98%" });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch core stats and recent conversations
      // Note: Adjust API endpoints as per actual backend implementation
      const [analyticsRes, ordersRes] = await Promise.all([
        fetch("/api/analytics?limit=30").catch(() => null),
        fetch("/api/orders").catch(() => null)
      ]);

      if (analyticsRes?.ok) {
        const data = await analyticsRes.json();
        // Process analytics for stats & chart
        // For now, using mock or simple summation if structure matches
      }

      // MOCK DATA for Visual Confirmation as requested
      setStats({
        messages: "2,847",
        leads: "156",
        orders: "24",
        revenue: "₹45,200"
      });

      setRecentConvos([
        { name: "Vikram Singh", message: "Price kya hai bhai?", time: new Date().toISOString(), unreadCount: 2, initials: "VS" },
        { name: "Priya Sharma", message: "Thanks! I will order tomorrow", time: new Date(Date.now() - 3600000).toISOString(), initials: "PS" },
        { name: "Amit Kumar", message: "COD available hai kya?", time: new Date(Date.now() - 7200000).toISOString(), unreadCount: 1, initials: "AK" },
      ]);

    } catch (error) {
      console.error("Dashboard data load error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="text-white font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1">
            Welcome back, {userName.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Here's what's happening with your WhatsApp business today.
          </p>
        </div>
        <Link
          href="/inbox"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(192,132,252,0.4)]"
        >
          <MessageSquare className="w-5 h-5" />
          Open Inbox
        </Link>
      </div>

      {/* STATS GRID */}
      <StatCards stats={stats} />

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

        {/* LEFT COLUMN (2/3) */}
        <div className="lg:col-span-2 space-y-8">

          {/* CHART */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold">Message Analytics</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="text-muted-foreground">Messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-muted-foreground">Leads</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#a78bfa', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#a78bfa', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a0b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    stroke="#c084fc"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMessages)"
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT CONVERSATIONS */}
          <RecentConversations conversations={recentConvos} />

        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="space-y-6">
          <UsageCard used={usage.used} limit={usage.limit} />
          <AiStatusCard
            active={aiStatus.active}
            repliesToday={aiStatus.replies}
            avgResponseTime={aiStatus.avgTime}
            satisfaction={aiStatus.satisfaction}
          />
          <QuickActions />
        </div>

      </div>
    </div>
  );
}
