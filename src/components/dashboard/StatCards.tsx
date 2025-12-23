
"use client";

import { MessageSquare, Users, ShoppingBag, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatItem {
    label: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: any;
    colorClass: string;
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
            label: "Today's Messages",
            value: stats.messages,
            trend: `${safeTrends.messages >= 0 ? '+' : ''}${safeTrends.messages}%`,
            trendUp: safeTrends.messages >= 0,
            icon: MessageSquare,
            colorClass: "bg-indigo-50 text-indigo-600"
        },
        {
            label: "New Leads Today",
            value: stats.leads,
            trend: `${safeTrends.leads >= 0 ? '+' : ''}${safeTrends.leads}%`,
            trendUp: safeTrends.leads >= 0,
            icon: Users,
            colorClass: "bg-blue-50 text-blue-600"
        },
        {
            label: "Orders Today",
            value: stats.orders,
            trend: `${safeTrends.orders >= 0 ? '+' : ''}${safeTrends.orders}%`,
            trendUp: safeTrends.orders >= 0,
            icon: ShoppingBag,
            colorClass: "bg-amber-50 text-amber-600"
        },
        {
            label: "Revenue Today",
            value: stats.revenue,
            trend: `${safeTrends.revenue >= 0 ? '+' : ''}${safeTrends.revenue}%`,
            trendUp: safeTrends.revenue >= 0,
            icon: TrendingUp,
            colorClass: "bg-emerald-50 text-emerald-600"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-zinc-200 p-6 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">{item.label}</p>
                            <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">{item.value}</h3>
                        </div>
                        <div className={`p-2.5 rounded-lg ${item.colorClass}`}>
                            <item.icon className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${item.trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {item.trendUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                            {item.trend}
                        </div>
                        <span className="text-zinc-400 text-xs">vs yesterday</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
