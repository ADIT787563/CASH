"use client";

import { BrainCircuit, Lightbulb, TrendingUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/ui/CollapsibleCard";

interface AIInsight {
    type: "trend" | "suggestion" | "insight";
    text: string;
    sentiment: "positive" | "neutral" | "negative";
}

interface AIInsightsPanelProps {
    insights: AIInsight[];
    isLocked?: boolean;
}

export function AIInsightsPanel({ insights, isLocked = false }: AIInsightsPanelProps) {
    if (isLocked) {
        return (
            <div className="relative overflow-hidden rounded-xl border bg-muted/20 p-8 text-center animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <BrainCircuit className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">AI Business Insights</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                        Unlock powerful AI-driven insights to grow your business faster. Get trends, stock predictions, and smart suggestions.
                    </p>
                    <Button className="gap-2">
                        <Lock className="w-4 h-4" /> Upgrade to Advanced
                    </Button>
                </div>
            </div>
        );
    }

    const hasInsights = insights.length > 0;

    return (
        <CollapsibleCard
            title="AI Business Insights"
            subtitle={hasInsights ? "Real-time analysis of your store performance" : "No insights available yet"}
            icon={<BrainCircuit className="w-5 h-5" />}
            storageKey="ai_insights"
            defaultExpanded={hasInsights}
            className="bg-gradient-to-br from-primary/5 via-card to-card border-none ring-1 ring-border shadow-sm h-fit"
        >
            {hasInsights ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insights.map((insight, idx) => (
                        <div key={idx} className="bg-card/50 border p-4 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                                {insight.type === "trend" && <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />}
                                {insight.type === "suggestion" && <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />}
                                {insight.type === "insight" && <BrainCircuit className="w-5 h-5 text-purple-500 mt-0.5" />}

                                <div>
                                    <p className="text-sm font-medium leading-normal">{insight.text}</p>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider mt-2 block ${insight.sentiment === "positive" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                                        }`}>
                                        {insight.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 text-muted-foreground">
                    <BrainCircuit className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>AI is analyzing your data. Check back later.</p>
                </div>
            )}
        </CollapsibleCard>
    );
}
