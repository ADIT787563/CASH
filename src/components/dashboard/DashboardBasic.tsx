"use client";

import { MessageSquare, ShoppingBag, ArrowRight, TrendingUp } from "lucide-react";
import { StatCards } from "./StatCards";
import InboxClient from "@/app/dashboard/inbox/InboxClient";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

interface DashboardBasicProps {
    stats: any;
    inboxStats: any;
    orders: any[];
    chartData: any[];
}

export function DashboardBasic({ stats, inboxStats, orders, chartData }: DashboardBasicProps) {
    const { data: session } = useSession();
    const userName = session?.user?.name || "Seller";

    return (
        <div className="flex flex-col h-full space-y-8">
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-6 mb-6">
                <div>
                    <h1 className="text-5xl font-extrabold text-zinc-900 mb-2 tracking-tight">
                        Welcome back, {userName.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-zinc-500 text-lg font-medium flex items-center justify-center gap-2 italic">
                        Your business overview for today.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* AI Status Pill - Basic */}
                    <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 px-8 py-3 rounded-full shadow-lg">
                        <span className="text-base font-bold text-zinc-300 uppercase tracking-widest">AI Engine</span>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></div>
                            <span className="text-emerald-400 font-black text-base tracking-tighter">OPERATIONAL</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. High Level KPIs */}
            <StatCards stats={stats} mode="basic" />

            <div className="grid lg:grid-cols-3 gap-8 flex-1 min-h-0">

                {/* 2. Left Column: Activity & Orders */}
                <div className="space-y-8 lg:col-span-1 flex flex-col">

                    {/* Simple Activity Widgets */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2 text-zinc-500">
                                <ShoppingBag className="w-5 h-5" />
                                <span className="text-sm font-bold uppercase">Total Orders</span>
                            </div>
                            <div className="text-3xl font-bold text-zinc-900">
                                {stats.orders} <span className="text-sm text-zinc-400 font-normal">/ 30 days</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2 text-zinc-500">
                                <MessageSquare className="w-5 h-5" />
                                <span className="text-sm font-bold uppercase">Automated</span>
                            </div>
                            <div className="text-3xl font-bold text-zinc-900">
                                85% <span className="text-sm text-zinc-400 font-normal">of chats</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders List */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-zinc-900">Recent Orders</h3>
                            <Link href="/dashboard/orders" className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="overflow-y-auto flex-1 p-3 custom-scrollbar">
                            {orders.length > 0 ? (
                                <div className="space-y-3">
                                    {orders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 hovering:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                    #{order.id.toString().slice(-3)}
                                                </div>
                                                <div>
                                                    <div className="text-base font-semibold text-zinc-900">{order.customer?.name || "Guest"}</div>
                                                    <div className="text-sm text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-base font-bold text-zinc-900">₹{order.totalAmount}</div>
                                                <div className={`text-xs uppercase font-bold px-2 py-0.5 rounded-full inline-block ${order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {order.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-2">
                                    <ShoppingBag className="w-10 h-10 opacity-50" />
                                    <span className="text-base">No recent orders</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Live Inbox (Basic) - Takes remaining space */}
                <div className="lg:col-span-2 flex flex-col min-h-[600px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-indigo-600" />
                            <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Live Inbox</h2>
                        </div>
                        <span className="text-sm px-3 py-1 bg-zinc-100 text-zinc-500 rounded font-medium">Basic Mode</span>
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
        </div>
    );
}
