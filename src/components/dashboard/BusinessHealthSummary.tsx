"use client";

import { MessageSquare, Users, ShoppingBag, IndianRupee, TrendingUp, TrendingDown, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string;
    icon: any;
    trend: "up" | "down" | "neutral";
    trendValue: string;
    tooltip: string;
    onClick?: () => void;
}

function MetricCard({ title, value, icon: Icon, trend, trendValue, tooltip, onClick }: MetricCardProps) {
    return (
        <div
            onClick={onClick}
            className="group relative bg-card hover:bg-muted/50 border rounded-xl p-5 transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
                <p className="text-sm text-muted-foreground font-medium">{title}</p>
            </div>

            <div className={cn(
                "absolute bottom-5 right-5 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1",
                trend === "up" ? "bg-green-500/10 text-green-600" : trend === "down" ? "bg-red-500/10 text-red-600" : "bg-zinc-100 text-zinc-600"
            )}>
                {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
                {trendValue}
            </div>
        </div>
    );
}

interface BusinessHealthSummaryProps {
    stats: {
        messages: string;
        leads: string;
        orders: string;
        revenue: string;
    };
}

export function BusinessHealthSummary({ stats }: BusinessHealthSummaryProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MetricCard
                title="Messages Today"
                value={stats.messages}
                icon={MessageSquare}
                trend="up"
                trendValue="+12%"
                tooltip="Total unique conversations today"
            />
            <MetricCard
                title="New Leads"
                value={stats.leads}
                icon={Users}
                trend="up"
                trendValue="+5%"
                tooltip="Potential customers identified by AI"
            />
            <MetricCard
                title="Orders Today"
                value={stats.orders}
                icon={ShoppingBag}
                trend="down"
                trendValue="-2%"
                tooltip="Confirmed orders placed today"
            />
            <MetricCard
                title="Revenue Today"
                value={stats.revenue}
                icon={IndianRupee}
                trend="up"
                trendValue="+8%"
                tooltip="Total revenue from confirmed orders"
            />
        </div>
    );
}
