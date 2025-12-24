
"use client";

import { MessageSquare, Users, ShoppingBag, TrendingUp, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatItem {
    label: string;
    value: string;
    trend: string;
    trendUp: boolean;
    trendValue: number;
    icon: any;
    colorClass: string;
    insight?: string;
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
    };
    mode?: "basic" | "advanced";
}

export function StatCards({ stats, trends, mode = "basic" }: StatCardsProps) {
    // Default trends if not provided
    const safeTrends = trends || { messages: 12.5, leads: 8.2, orders: 23.1, revenue: -2.4 };

    const items: StatItem[] = [
        {
            label: "Today's Messages",
            value: stats.messages,
            trend: `${safeTrends.messages >= 0 ? '+' : ''}${safeTrends.messages}%`,
            trendUp: safeTrends.messages >= 0,
            trendValue: safeTrends.messages,
            icon: MessageSquare,
            colorClass: "bg-indigo-50 text-indigo-600",
            insight: "AI handled 85% of queries automatically."
        },
        {
            label: "New Leads Today",
            value: stats.leads,
            trend: `${safeTrends.leads >= 0 ? '+' : ''}${safeTrends.leads}%`,
            trendUp: safeTrends.leads >= 0,
            trendValue: safeTrends.leads,
            icon: Users,
            colorClass: "bg-blue-50 text-blue-600",
            insight: "Most leads came from Instagram DMs."
        },
        {
            label: "Orders Today",
            value: stats.orders,
            trend: `${safeTrends.orders >= 0 ? '+' : ''}${safeTrends.orders}%`,
            trendUp: safeTrends.orders >= 0,
            trendValue: safeTrends.orders,
            icon: ShoppingBag,
            colorClass: "bg-amber-50 text-amber-600",
            insight: "Pending confirmation for 3 COD orders."
        },
        {
            label: "Revenue Today",
            value: stats.revenue,
            trend: `${safeTrends.revenue >= 0 ? '+' : ''}${safeTrends.revenue}%`,
            trendUp: safeTrends.revenue >= 0,
            trendValue: safeTrends.revenue,
            icon: TrendingUp,
            colorClass: "bg-emerald-50 text-emerald-600",
            insight: "₹2,400 pending in unconfirmed orders."
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-zinc-200 p-6 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200 group relative min-h-[160px]">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-2">{item.label}</p>
                            <h3 className="text-4xl font-extrabold text-zinc-900 tracking-tight">{item.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${item.colorClass} group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center text-sm font-bold px-2.5 py-1 rounded-full ${item.trendUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                {item.trendUp ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                                {item.trend}
                            </div>
                            <span className="text-zinc-400 text-sm font-medium">vs yesterday</span>
                        </div>

                        {mode === "advanced" && item.insight && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-5 h-5 text-zinc-400 hover:text-zinc-600 transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-sm font-medium">{item.insight}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>

                    {/* Advanced Mode: Bottom border indicator of health */}
                    {mode === "advanced" && (
                        <div className={`absolute bottom-0 left-0 right-0 h-1.5 rounded-b-xl ${item.trendValue < 0 ? 'bg-rose-500/50' : 'bg-emerald-500/50'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    )}
                </div>
            ))}
        </div>
    );
}
