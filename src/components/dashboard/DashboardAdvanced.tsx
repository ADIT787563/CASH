"use client";

import { MessageSquare, Zap, BarChart3, TrendingUp } from "lucide-react";
import { StatCards } from "./StatCards";
import InboxClient from "@/app/dashboard/inbox/InboxClient";
import { AIPerformancePanel } from "./AIPerformancePanel";
import { ConversionFunnel } from "./ConversionFunnel";
import { AlertsPanel } from "./AlertsPanel";
import { useSession } from "@/lib/auth-client";

interface DashboardAdvancedProps {
    stats: any;
    inboxStats: any;
    orders: any[];
    chartData: any[];
}

export function DashboardAdvanced({ stats, inboxStats, orders, chartData }: DashboardAdvancedProps) {
    const { data: session } = useSession();
    const userName = session?.user?.name || "Power User";

    return (
        <div className="flex flex-col h-full space-y-8">

            {/* Header - Command Center Style */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
                        Command Center <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
                    </h1>
                    <p className="text-zinc-500 text-base font-medium mt-1">
                        Real-time intelligence for {userName.split(' ')[0]}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* AI Status Pill - Advanced */}
                    <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-700 px-6 py-3 rounded-full shadow-lg relative overflow-hidden group hover:border-zinc-500 transition-colors cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-bold text-zinc-300 uppercase tracking-widest relative z-10">AI Engine</span>
                        <div className="flex items-center gap-2 relative z-10">
                            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse"></div>
                            <span className="text-emerald-400 font-black text-sm tracking-tighter">OPERATIONAL</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. Smart KPI Cards (Advanced Mode) */}
            <StatCards stats={stats} mode="advanced" />

            {/* Middle Row: AI Performance, Funnel, Alerts */}
            <div className="grid lg:grid-cols-3 gap-8 min-h-[450px]">

                {/* 2. AI Performance Panel */}
                <div className="lg:col-span-1 h-full">
                    <AIPerformancePanel data={chartData} />
                </div>

                {/* 3. Conversion Funnel */}
                <div className="lg:col-span-1 h-full">
                    <ConversionFunnel />
                </div>

                {/* 6. Alerts & Action Cards */}
                <div className="lg:col-span-1 h-full">
                    <AlertsPanel />
                </div>
            </div>

            {/* Bottom Row: Live Inbox Intelligence */}
            <div className="flex-1 min-h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Live Inbox Intelligence</h2>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-sm px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-bold flex items-center gap-1.5">
                            <Zap className="w-4 h-4" /> Priority Routing
                        </span>
                        <span className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-bold">
                            Pro Mode
                        </span>
                    </div>
                </div>
                <div className="flex-1 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden relative">
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
