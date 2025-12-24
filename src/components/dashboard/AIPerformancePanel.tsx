"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Bot, MessageSquare, UserCheck, Zap } from "lucide-react";

interface AIPerformancePanelProps {
    data: any[];
}

export function AIPerformancePanel({ data }: AIPerformancePanelProps) {
    // Mock data if real data is empty (for visualization)
    const chartData = data.length > 0 ? data : [
        { name: "Mon", ai: 45, human: 12 },
        { name: "Tue", ai: 52, human: 8 },
        { name: "Wed", ai: 48, human: 15 },
        { name: "Thu", ai: 61, human: 5 },
        { name: "Fri", ai: 55, human: 10 },
        { name: "Sat", ai: 38, human: 4 },
        { name: "Sun", ai: 42, human: 6 },
    ];

    return (
        <div className="glass-card p-8 rounded-xl border border-border h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-3">
                        <Bot className="w-6 h-6 text-primary" />
                        AI Performance
                    </h3>
                    <p className="text-base text-muted-foreground mt-1">Efficiency & Resolution Metrics</p>
                </div>
                <span className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-lg uppercase">
                    Live
                </span>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-base text-muted-foreground font-medium">Resolution Rate</span>
                        <Zap className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="text-4xl font-bold">92%</div>
                    <div className="text-sm text-green-500 font-medium flex items-center gap-1 mt-1">
                        ↑ 2.4% <span className="text-muted-foreground">vs last week</span>
                    </div>
                </div>
                <div className="p-6 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-base text-muted-foreground font-medium">Human Takeover</span>
                        <UserCheck className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-4xl font-bold">8%</div>
                    <div className="text-sm text-green-500 font-medium flex items-center gap-1 mt-1">
                        ↓ 1.2% <span className="text-muted-foreground">efficiency gain</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={14}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={14}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                        />
                        <Bar
                            dataKey="ai"
                            name="AI Replies"
                            fill="currentColor"
                            className="fill-primary"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="human"
                            name="Human Intervention"
                            fill="currentColor"
                            className="fill-muted-foreground/30"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-primary rounded-sm" />
                    <span>AI Automated</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-muted-foreground/30 rounded-sm" />
                    <span>Manual</span>
                </div>
            </div>
        </div>
    );
}
