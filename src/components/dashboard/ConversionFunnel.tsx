"use client";

import { TrendingUp, ArrowRight } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/CollapsibleCard";

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

    const HeaderStats = (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground hidden sm:inline">Conversion Rate:</span>
            <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">15%</span>
        </div>
    );

    return (
        <CollapsibleCard
            title="Conversion Funnel"
            subtitle="Chat to Order Journey"
            icon={<TrendingUp className="w-5 h-5" />}
            storageKey="conversion_funnel"
            headerAction={HeaderStats}
            className="h-fit"
        >
            <div className="space-y-5">
                {steps.map((step, idx) => (
                    <div key={idx} className="relative">
                        {idx > 0 && (
                            <div className="absolute left-7 -top-5 h-5 w-0.5 bg-border -z-10" />
                        )}
                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors border border-transparent hover:border-border">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${idx === 3 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-primary/10 text-primary"
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

                <div className="mt-6 pt-4 border-t border-border">
                    <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-[15%]" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        15% of total chats resulted in a confirmed order.
                    </p>
                </div>
            </div>
        </CollapsibleCard>
    );
}
