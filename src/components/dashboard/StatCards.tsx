"use client";

import { BarChart3, TrendingUp, Users, RefreshCcw } from "lucide-react";

const cards = [
    {
        title: "Revenue Status",
        value: "$432",
        date: "Jan 01 - Jan 10",
        gradient: "from-[#ec4899] to-[#8b5cf6]", // Pink to Purple
        icon: BarChart3,
    },
    {
        title: "Page View",
        value: "60236",
        date: "Viewed", // Custom label
        gradient: "from-[#8b5cf6] to-[#6366f1]", // Purple to Indigo
        icon: TrendingUp, // Using curve
        curve: true
    },
    {
        title: "Bounce Rate",
        value: "432",
        date: "Monthly",
        gradient: "from-[#3b82f6] to-[#0ea5e9]", // Blue to Sky
        icon: RefreshCcw,
        curve: true
    },
    {
        title: "Revenue Status",
        value: "$800",
        date: "Jan 07 - Jan 10",
        gradient: "from-[#f59e0b] to-[#ea580c]", // Orange to Red
        icon: BarChart3,
    }
];

export function StatCards() {
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
                            {/* Mock Chart/Visual */}
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
