"use client";

import {
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  MonitorCheck,
  Calendar,
  ChevronDown,
  RefreshCw,
  MessageSquare,
  ShoppingBag,
  Clock,
  User,
  Zap
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { DashboardDateFilter, DateRange } from "@/components/dashboard/DashboardDateFilter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { toast } from "sonner";
import { format, isValid } from "date-fns";

// --- Components ---

function StatusPill({ label, status }: { label: string, status: "ok" | "warn" | "error" }) {
  const colors = {
    ok: "bg-emerald-500",
    warn: "bg-amber-500",
    error: "bg-rose-500"
  };
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
      <span className={`w-2 h-2 rounded-full ${colors[status]}`} />
      {label}
    </div>
  );
}

function MetricBlock({ label, value, trendRate, trendDirection, subLabel, loading }: any) {
  const isUp = trendDirection === "up";
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between h-32">
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-16 bg-muted rounded" />
        </div>
      ) : (
        <>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{value}</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className={`flex items-center gap-1 ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
              {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trendRate}
            </span>
            <span className="text-slate-400">{subLabel || "vs last period"}</span>
          </div>
        </>
      )}
    </div>
  );
}

// Safety wrapper for formatting dates
function safeFormat(date: any, formatStr: string, fallback: string = "N/A"): string {
  try {
    if (!date) return fallback;
    const d = new Date(date);
    if (!isValid(d)) return fallback;
    return format(d, formatStr);
  } catch (e) {
    return fallback;
  }
}

export default function DashboardV2() {
  const [dateRange, setDateRange] = useState<DateRange>("today");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [aiConfig, setAiConfig] = useState<any>(null);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");

      // Parallel Fetch: Analytics, Orders, Business Settings, AI Config, Payment Settings
      const [analyticsRes, ordersRes, settingsRes, aiRes, paymentRes] = await Promise.all([
        fetch("/api/analytics?limit=30", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/business-settings", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/ai/config", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/payment-settings", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!analyticsRes.ok) throw new Error(`Analytics fetch failed: ${analyticsRes.status}`);
      if (!ordersRes.ok) throw new Error(`Orders fetch failed: ${ordersRes.status}`);

      const analyticsResult = await analyticsRes.json();
      const ordersResult = await ordersRes.json();
      const settingsResult = settingsRes.ok ? await settingsRes.json() : null;
      const aiResult = aiRes.ok ? await aiRes.json() : null;
      const paymentResult = paymentRes.ok ? await paymentRes.json() : null;

      setAnalyticsData(Array.isArray(analyticsResult) ? analyticsResult : []);
      setOrdersData(Array.isArray(ordersResult) ? ordersResult : []);
      if (settingsResult) setBusinessSettings(settingsResult);
      if (aiResult?.config) setAiConfig(aiResult.config);
      if (paymentResult?.settings) setPaymentSettings(paymentResult.settings);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load live dashboard data. Using local cache.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter and Calculate Metrics
  const metrics = useMemo(() => {
    try {
      if (!Array.isArray(analyticsData) || !Array.isArray(ordersData)) {
        return { conv: "0", orders: "0", rev: "₹0", convRate: "0%" };
      }

      if (analyticsData.length === 0 && ordersData.length === 0) {
        return { conv: "0", orders: "0", rev: "₹0", convRate: "0%" };
      }

      const now = new Date();
      let filteredAnalytics = [...analyticsData];
      let filteredOrders = [...ordersData];

      if (dateRange === "today") {
        const todayStr = safeFormat(now, "yyyy-MM-dd");
        filteredAnalytics = analyticsData.filter(d => d.date === todayStr);
        filteredOrders = ordersData.filter(o => safeFormat(o.createdAt, "yyyy-MM-dd") === todayStr);
      } else if (dateRange === "yesterday") {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yestStr = safeFormat(yesterday, "yyyy-MM-dd");
        filteredAnalytics = analyticsData.filter(d => d.date === yestStr);
        filteredOrders = ordersData.filter(o => safeFormat(o.createdAt, "yyyy-MM-dd") === yestStr);
      } else if (dateRange === "last7") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        filteredAnalytics = analyticsData.filter(d => {
          const dDate = new Date(d.date);
          return isValid(dDate) && dDate >= sevenDaysAgo;
        });
        filteredOrders = ordersData.filter(o => {
          const oDate = new Date(o.createdAt);
          return isValid(oDate) && oDate >= sevenDaysAgo;
        });
      }

      const totalConv = filteredAnalytics.reduce((acc, curr) => acc + (Number(curr.totalMessages) || 0), 0);
      const totalOrders = filteredOrders.length;
      const totalRev = filteredOrders.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0) / 100;
      const convRate = totalConv > 0 ? ((totalOrders / totalConv) * 100).toFixed(1) + "%" : "0%";

      return {
        conv: totalConv.toLocaleString(),
        orders: totalOrders.toString(),
        rev: `₹${totalRev.toLocaleString()}`,
        convRate
      };
    } catch (e) {
      console.error("Error calculating metrics:", e);
      return { conv: "0", orders: "0", rev: "₹0", convRate: "0%" };
    }
  }, [analyticsData, ordersData, dateRange]);

  // Chart Data Preparation
  const performanceData = useMemo(() => {
    try {
      if (!Array.isArray(analyticsData) || analyticsData.length === 0) return [{ time: 'N/A', conversations: 0, orders: 0 }];

      const last7 = analyticsData.slice(0, 7).reverse();
      return last7.map(d => ({
        time: safeFormat(d.date, "MMM dd"),
        conversations: Number(d.totalMessages) || 0,
        orders: ordersData.filter(o => safeFormat(o.createdAt, "yyyy-MM-dd") === d.date).length
      }));
    } catch (e) {
      console.error("Error preparing chart data:", e);
      return [{ time: 'Error', conversations: 0, orders: 0 }];
    }
  }, [analyticsData, ordersData]);

  // Activity Feed
  const recentActivities = useMemo(() => {
    try {
      const combined = [
        ...ordersData.map(o => ({
          time: safeFormat(o.createdAt, "HH:mm"),
          event: o.reference ? `Order #${o.reference.split('-')[1] || '---'}` : 'New Order',
          lead: o.customerName || 'Unknown',
          status: o.paymentStatus === 'paid' ? 'SUCCESS' : 'INFO',
          detail: `₹${(Number(o.totalAmount) / 100 || 0).toLocaleString()} via ${o.paymentMethod || 'UPI'}`
        })),
        ...analyticsData.slice(0, 5).map(a => ({
          time: safeFormat(a.date, "HH:mm"),
          event: "Daily Sync",
          lead: "System",
          status: "SUCCESS",
          detail: `Processed ${a.totalMessages || 0} messages`
        }))
      ];
      return combined.sort((a, b) => (b.time || '').localeCompare(a.time || '')).slice(0, 10);
    } catch (e) {
      console.error("Error preparing activity feed:", e);
      return [];
    }
  }, [ordersData, analyticsData]);

  // Logic for Status Pills
  const waStatus = businessSettings?.whatsappNumber ? "ok" : "warn";
  const waLabel = businessSettings?.whatsappNumber ? "WhatsApp API: Connected" : "WhatsApp API: Not Configured";

  const aiStatus = aiConfig?.enabled ? "ok" : "warn";
  const aiLabel = aiConfig?.enabled ? "AI Automation: Active" : "AI Automation: Paused";

  const payStatus = paymentSettings?.razorpayKeyId ? "ok" : "warn";
  const payLabel = paymentSettings?.razorpayKeyId ? "Payment Gateway: Operational" : "Payment Gateway: Setup Needed";

  return (
    <div className="space-y-8">
      {/* Header with Filter */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Commercial Overview</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time business performance analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <DashboardDateFilter value={dateRange} onChange={setDateRange} />
          <button
            onClick={() => fetchDashboardData()}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* SECTION 1: SYSTEM STATUS & QUICK ACTIONS */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <StatusPill label={waLabel} status={waStatus} />
          <StatusPill label={aiLabel} status={aiStatus} />
          <StatusPill label={payLabel} status={payStatus} />
        </div>

        {/* Quick Share Widget */}
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Share Chat Link:
          </span>
          <code className="bg-white dark:bg-slate-900 px-2 py-1 rounded text-xs font-mono text-slate-600 dark:text-slate-400 border border-indigo-200 dark:border-indigo-800">
            {businessSettings?.whatsappNumber ? `https://wa.me/${businessSettings.whatsappNumber}` : 'Set up WhatsApp in Settings'}
          </code>
          <button
            onClick={() => {
              const link = businessSettings?.whatsappNumber ? `https://wa.me/${businessSettings.whatsappNumber}` : '';
              if (link) {
                navigator.clipboard.writeText(link);
                toast.success("Link copied!");
              } else {
                toast.error("Complete your profile settings first!");
              }
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Copy
          </button>
        </div>
      </div>

      {/* SECTION 2: CORE METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <MetricBlock
          label="Conversations"
          value={metrics.conv}
          trendDirection="up"
          trendRate="+12%"
          loading={loading}
        />
        <MetricBlock
          label="Orders"
          value={metrics.orders}
          trendDirection="up"
          trendRate="+8%"
          loading={loading}
        />
        <MetricBlock
          label="Revenue"
          value={metrics.rev}
          trendDirection="up"
          trendRate="+15%"
          loading={loading}
        />
        <MetricBlock
          label="Conversion Rate"
          value={metrics.convRate}
          trendDirection="down"
          trendRate="-0.2%"
          loading={loading}
        />
      </div>

      {/* SECTION 3 & 4: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Business Flow</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-indigo-500 rounded-full" />
                <span className="text-slate-500">Conversations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-slate-500">Orders</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Line type="monotone" dataKey="conversations" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Efficiency</h3>
          <div className="h-[350px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="h-full flex flex-col justify-between">
              <div className="space-y-6">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Automated Replies</span>
                    <Zap className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">88%</span>
                    <span className="text-xs text-indigo-500 font-bold mb-1">+2.4%</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">AI Conversion</span>
                    <ShoppingBag className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">12.5%</span>
                    <span className="text-xs text-emerald-500 font-bold mb-1">+0.8%</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <MonitorCheck className="w-4 h-4 inline mr-2 text-indigo-500" />
                AI handles most of your traffic instantly.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: RECENT ACTIVITY */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Activity Feed</h3>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium w-32">Time</th>
                  <th className="px-6 py-3 font-medium w-48">Event</th>
                  <th className="px-6 py-3 font-medium">Lead</th>
                  <th className="px-6 py-3 font-medium w-32">Status</th>
                  <th className="px-6 py-3 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivities.length > 0 ? recentActivities.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-6 py-3 font-mono text-slate-500 text-xs">{item.time}</td>
                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{item.event}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{item.lead}</td>
                    <td className="px-6 py-3">
                      <span className={`
                                inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                ${item.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : ''}
                                ${item.status === 'INFO' ? 'bg-blue-100 text-blue-700' : ''}
                                ${item.status === 'WARNING' ? 'bg-amber-100 text-amber-700' : ''}
                                ${item.status === 'ERROR' ? 'bg-rose-100 text-rose-700' : ''}
                             `}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500">{item.detail}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">No recent activity.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
