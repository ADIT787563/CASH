"use client";

import {
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  MonitorCheck,
  Calendar,
  ChevronDown,
  RefreshCw
} from "lucide-react";
import { useState, useMemo } from "react";
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

// --- Mock Data ---
const performanceData = [
  { time: "09:00", conversations: 12, orders: 2 },
  { time: "10:00", conversations: 18, orders: 4 },
  { time: "11:00", conversations: 25, orders: 8 },
  { time: "12:00", conversations: 45, orders: 12 },
  { time: "13:00", conversations: 30, orders: 9 },
  { time: "14:00", conversations: 22, orders: 5 },
  { time: "15:00", conversations: 35, orders: 11 },
];

const aiPerformanceData = [
  { name: "Replies", auto: 850, manual: 120 },
  { name: "Orders", auto: 45, manual: 5 },
];

const recentActivity = [
  { time: "15:02", event: "New Order #2938", lead: "Rahul S.", status: "SUCCESS", detail: "₹2,499 via UPI" },
  { time: "14:58", event: "Lead Qualified", lead: "Priya M.", status: "INFO", detail: "High Intent" },
  { time: "14:45", event: "Automated Reply", lead: "+91 98...22", status: "SUCCESS", detail: "Price Inquiry" },
  { time: "14:30", event: "Payment Failed", lead: "Amit K.", status: "ERROR", detail: "Bank Timeout" },
  { time: "14:15", event: "Human Handover", lead: "+91 76...11", status: "WARNING", detail: "Complex Query" },
];

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

function MetricBlock({ label, value, trend, subLabel }: any) {
  const isUp = trend === "up";
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between h-32">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{value}</h3>
      </div>
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className={`flex items-center gap-1 ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {subLabel}
        </span>
        <span className="text-slate-400">vs yesterday</span>
      </div>
    </div>
  );
}

export default function DashboardV2() {
  const [dateRange, setDateRange] = useState<DateRange>("today");

  // Mock adaptive data based on dateRange
  const metrics = useMemo(() => {
    switch (dateRange) {
      case "last7": return { conv: "8.4k", orders: "412", rev: "₹7.5L", convRate: "4.9%" };
      case "last30": return { conv: "32.1k", orders: "1.2k", rev: "₹22.4L", convRate: "4.2%" };
      case "yesterday": return { conv: "1.1k", orders: "58", rev: "₹1.1L", convRate: "5.1%" };
      default: return { conv: "1,284", orders: "64", rev: "₹1.2L", convRate: "4.8%" };
    }
  }, [dateRange]);

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
            onClick={() => window.location.reload()}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* SECTION 1: SYSTEM STATUS */}
      <div className="flex flex-wrap gap-4 items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">System Status</span>
        <StatusPill label="WhatsApp API: Connected" status="ok" />
        <StatusPill label="AI Automation: Active" status="ok" />
        <StatusPill label="Payment Gateway: Operational" status="ok" />
        <StatusPill label="Webhooks: 99.9% Uptime" status="ok" />
      </div>

      {/* SECTION 2: CORE METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <MetricBlock label="Conversations" value={metrics.conv} trend="up" subLabel="+12%" />
        <MetricBlock label="Orders" value={metrics.orders} trend="up" subLabel="+8%" />
        <MetricBlock label="Revenue" value={metrics.rev} trend="up" subLabel="+15%" />
        <MetricBlock label="Conversion Rate" value={metrics.convRate} trend="down" subLabel="-0.2%" />
      </div>

      {/* SECTION 3 & 4: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Line Chart: Business Flow */}
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

        {/* Bar Chart: AI Performance */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Efficiency</h3>
          <div className="h-[350px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="auto" name="Automated" stackId="a" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={30} />
                <Bar dataKey="manual" name="Manual" stackId="a" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <MonitorCheck className="w-4 h-4 inline mr-2 text-indigo-500" />
              AI handled <strong>88%</strong> of traffic today without human intervention.
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: RECENT ACTIVITY */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Activity Feed</h3>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
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
              {recentActivity.map((item, i) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
