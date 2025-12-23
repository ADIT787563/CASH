'use client';

import React from 'react';
import { Package, MessageSquare, DollarSign, TrendingUp, CheckCircle2 } from 'lucide-react';

interface InboxStatsProps {
    stats?: {
        totalOrders: number;
        messagesAutomated: string;
        paymentsReceived: string;
        conversionRate: string;
        revenueLast7Days: string;
    };
}

export default function InboxStats({ stats }: InboxStatsProps) {
    // Default values if not provided (or loading state)
    const data = stats || {
        totalOrders: 0,
        messagesAutomated: "0",
        paymentsReceived: "0",
        conversionRate: "0%",
        revenueLast7Days: "0"
    };

    const items = [
        {
            label: "Total Orders",
            value: data.totalOrders.toLocaleString(),
            icon: Package,
            iconClass: "text-blue-400 bg-blue-400/10",
            trend: null
        },
        {
            label: "Messages Automated",
            value: data.messagesAutomated,
            icon: MessageSquare,
            iconClass: "text-emerald-400 bg-emerald-400/10",
            trend: null
        },
        {
            label: "Payments Received",
            value: data.paymentsReceived,
            icon: DollarSign,
            iconClass: "text-green-400 bg-green-400/10",
            trend: null
        },
        {
            label: "Conversion Rate",
            value: data.conversionRate,
            icon: TrendingUp,
            iconClass: "text-green-400 bg-green-400/10",
            trend: "up"
        },
        {
            label: "Last 7 Days",
            value: data.revenueLast7Days,
            icon: null, // Custom layout for last item
            iconClass: "",
            trend: "verified"
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            {items.map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between backdrop-blur-md">
                    <div className="flex items-start justify-between mb-2">
                        {item.icon ? (
                            <div className={`p-1.5 rounded-lg ${item.iconClass}`}>
                                <item.icon className="w-4 h-4" />
                            </div>
                        ) : (
                            <span className="text-sm font-medium text-white/60">{item.label}</span>
                        )}
                        {item.trend === "up" && <TrendingUp className="w-4 h-4 text-green-400" />}
                        {item.trend === "verified" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>

                    <div>
                        {item.icon && <span className="text-xs text-white/50 block mb-0.5">{item.label}</span>}
                        <div className="text-lg font-bold text-white flex items-center gap-2">
                            {item.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
