
"use client";

import { MessageSquare, Users, ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatItem {
    label: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: any;
    colorClass: string; // e.g., "text-emerald-500 bg-emerald-500/10"
}

interface StatCardsProps {
    stats: {
        messages: string;
        leads: string;
        orders: string;
        revenue: string;
    };
    trends?: {
        messages: number;
        leads: number;
        orders: number;
        revenue: number;
    }
}

export function StatCards({ stats, trends }: StatCardsProps) {
    // Default trends if not provided
    const safeTrends = trends || { messages: 12.5, leads: 8.2, orders: 23.1, revenue: -2.4 };

    const items: StatItem[] = [
        {
            label: "Total Messages",
            value: stats.messages,
            trend: `+${Math.abs(safeTrends.messages)}%`,
            trendUp: safeTrends.messages >= 0,
            icon: MessageSquare,
            colorClass: "text-emerald-500 bg-emerald-500/10"
        },
        {
            label: "Active Leads",
            value: stats.leads,
            trend: `+${Math.abs(safeTrends.leads)}%`,
            trendUp: safeTrends.leads >= 0,
            icon: Users,
            colorClass: "text-blue-500 bg-blue-500/10"
        },
        {
            label: "Orders Today",
            value: stats.orders,
            trend: `+${Math.abs(safeTrends.orders)}%`,
            trendUp: safeTrends.orders >= 0,
            icon: ShoppingCart,
            colorClass: "text-amber-500 bg-amber-500/10"
        },
        {
            label: "Revenue",
            value: stats.revenue,
            trend: `${safeTrends.revenue >= 0 ? '+' : '-'}${Math.abs(safeTrends.revenue)}%`,
            trendUp: safeTrends.revenue >= 0,
            icon: TrendingUp,
            colorClass: "text-rose-500 bg-rose-500/10"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, idx) => (
                <div key={idx} className="bg-[#0F1115] border border-slate-800 rounded-xl p-6 flex flex-col justify-between min-h-[160px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-2">{item.label}</p>
                            <h3 className="text-2xl font-bold text-white">{item.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${item.colorClass}`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <span className={`text-sm font-medium flex items-center ${item.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {item.trendUp ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                            {item.trend}
                        </span>
                        <span className="text-slate-500 text-sm">vs last week</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
