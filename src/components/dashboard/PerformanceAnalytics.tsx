"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Calendar, BarChart3 } from "lucide-react";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/ui/CollapsibleCard";

interface PerformanceAnalyticsProps {
    chartData: any[];
    funnelData?: any[];
}

export function PerformanceAnalytics({ chartData, funnelData }: PerformanceAnalyticsProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Performance Analytics</h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs">Last 7 Days</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">30 Days</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Revenue/Activity Chart */}
                <CollapsibleCard
                    title="Revenue & Activity"
                    subtitle="Daily revenue and order volume"
                    icon={<BarChart3 className="w-5 h-5" />}
                    storageKey="revenue_chart"
                    className="h-fit"
                >
                    <div className="h-[300px] w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    dx={-10}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px',
                                        color: 'hsl(var(--foreground))'
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CollapsibleCard>

                {/* Conversion Funnel - Internally collapsible */}
                <div className="h-fit">
                    <ConversionFunnel />
                </div>
            </div>
        </div>
    );
}
