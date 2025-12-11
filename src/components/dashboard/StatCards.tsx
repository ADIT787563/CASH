"use client";

import { BarChart3, TrendingUp, Users, RefreshCcw, MessageSquare, ShoppingBag } from "lucide-react";

interface StatCardsProps {
    stats?: {
        totalMessages: number;
        totalLeads: number;
        totalProducts: number;
        conversionRate: number;
        totalRevenue?: number;
        revenueChange?: number;
    };
    loading?: boolean;
}

export function StatCards({ stats, loading }: StatCardsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-40 rounded-3xl bg-muted/50 animate-pulse" />
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: "Total Revenue",
            value: stats?.totalRevenue ? `₹${stats.totalRevenue.toLocaleString()}` : "₹0",
            date: "Lifetime",
            gradient: "from-[#ec4899] to-[#8b5cf6]", // Pink to Purple
            icon: BarChart3,
        },
        {
            title: "Total Messages",
            value: stats?.totalMessages?.toString() || "0",
            date: "All time",
            gradient: "from-[#8b5cf6] to-[#6366f1]", // Purple to Indigo
            icon: MessageSquare,
            curve: true
        },
        {
            title: "Total Leads",
            value: stats?.totalLeads?.toString() || "0",
            date: "All time",
            gradient: "from-[#3b82f6] to-[#0ea5e9]", // Blue to Sky
            icon: Users,
            curve: true
        },
        {
            title: "Conversion Rate",
            value: `${stats?.conversionRate?.toFixed(1) || 0}%`,
            date: "Leads / Messages",
            gradient: "from-[#f59e0b] to-[#ea580c]", // Orange to Red
            icon: TrendingUp,
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`rounded-3xl p-6 text-white shadow-lg bg-gradient-to-r ${card.gradient} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
                >
                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
                        <div>
                            <p className="text-sm font-medium opacity-90">{card.title}</p>
                        </div>

                        <div className="flex items-end justify-between mt-4">
                            {/* Visual Bars */}
                            <div className="h-10 w-20 flex items-end gap-1">
                                {[40, 70, 50, 90, 60, 80].map((h, i) => (
                                    <div key={i} className="w-1.5 bg-white/40 rounded-t-sm" style={{ height: `${h}%` }} />
                                ))}
                            </div>

                            <div className="text-right">
                                <h3 className="text-2xl font-bold">{card.value}</h3>
                                <p className="text-xs opacity-80 mt-1">{card.date}</p>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Circle */}
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                </div>
            ))}
        </div>
    );
}
