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
            iconClass: "text-indigo-600 bg-indigo-50",
            trend: null
        },
        {
            label: "Messages Automated",
            value: data.messagesAutomated,
            icon: MessageSquare,
            iconClass: "text-emerald-600 bg-emerald-50",
            trend: null
        },
        {
            label: "Payments Received",
            value: data.paymentsReceived,
            icon: DollarSign,
            iconClass: "text-amber-600 bg-amber-50",
            trend: null
        },
        {
            label: "Conversion Rate",
            value: data.conversionRate,
            icon: TrendingUp,
            iconClass: "text-emerald-600 bg-emerald-50",
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {items.map((item, idx) => (
                <div key={idx} className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col justify-between shadow-sm min-h-[110px]">
                    <div className="flex items-start justify-between mb-3">
                        {item.icon ? (
                            <div className={`p-2.5 rounded-xl ${item.iconClass}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                        ) : (
                            <span className="text-base font-medium text-zinc-500">{item.label}</span>
                        )}
                        {item.trend === "up" && <TrendingUp className="w-5 h-5 text-emerald-500" />}
                        {item.trend === "verified" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </div>

                    <div>
                        {item.icon && <span className="text-sm text-zinc-500 block mb-1">{item.label}</span>}
                        <div className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                            {item.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
