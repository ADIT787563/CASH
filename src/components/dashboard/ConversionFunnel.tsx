"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { TrendingUp, ArrowRight } from "lucide-react";

export function ConversionFunnel() {
    // Mock funnel data
    const data = [
        { stage: "Chats", value: 1200 },
        { stage: "Interest", value: 850 },
        { stage: "Checkout Link", value: 420 },
        { stage: "Ordered", value: 180 },
    ];

    // Calculate conversion rates
    const steps = [
        { label: "Total Chats", value: "1.2k", drop: null },
        { label: "Product Interest", value: "850", drop: "70%" },
        { label: "Checkout Sent", value: "420", drop: "49%" },
        { label: "Confirmed Orders", value: "180", drop: "42%" },
    ];

    return (
        <div className="glass-card p-8 rounded-xl border border-border h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-accent" />
                        Conversion Funnel
                    </h3>
                    <p className="text-base text-muted-foreground mt-1">Chat to Order Journey</p>
                </div>
            </div>

            <div className="flex-1 space-y-5">
                {steps.map((step, idx) => (
                    <div key={idx} className="relative">
                        {idx > 0 && (
                            <div className="absolute left-7 -top-5 h-5 w-0.5 bg-border -z-10" />
                        )}
                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${idx === 3 ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"
                                    }`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <div className="text-base font-semibold">{step.label}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {idx === 0 ? "Top of funnel" : `${step.drop} conversion rate`}
                                    </div>
                                </div>
                            </div>
                            <div className="text-xl font-bold">{step.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center justify-between text-base">
                    <span className="text-muted-foreground">Overall Conversion Rate</span>
                    <span className="font-bold text-xl text-primary">15%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                    <div className="bg-primary h-2 rounded-full w-[15%]" />
                </div>
            </div>
        </div>
    );
}
