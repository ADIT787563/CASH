"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const data = [
    { name: "Jan", earnings: 40, sales: 24 },
    { name: "Feb", earnings: 30, sales: 13 },
    { name: "Mar", earnings: 20, sales: 98 },
    { name: "Apr", earnings: 27, sales: 39 },
    { name: "May", earnings: 18, sales: 48 },
    { name: "Jun", earnings: 23, sales: 38 },
    { name: "Jul", earnings: 34, sales: 43 },
];

const trafficData = [
    { name: "YouTube", value: 55, color: "#e91e63" },
    { name: "Facebook", value: 33, color: "#673ab7" },
    { name: "Direct Search", value: 12, color: "#ffc107" },
];

export function DashboardCharts() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Earnings Chart */}
            <div className="lg:col-span-2 bg-card rounded-3xl p-6 shadow-sm border border-border">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Dashboard</h2>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-bold text-primary">$6468.96</span>
                            <span className="text-sm text-muted-foreground">Current Month Earnings</span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold">82</span>
                            <span className="text-sm text-muted-foreground">Current Month Sales</span>
                        </div>
                        <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity">
                            Last Month Summary
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium cursor-pointer">Daily</span>
                        <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium cursor-pointer">Weekly</span>
                        <span className="px-3 py-1 bg-background border border-border rounded-full text-xs font-medium shadow-sm cursor-pointer">Yearly</span>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#e91e63" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#e91e63" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffc107" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ffc107" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="earnings"
                                stroke="#e91e63"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorEarnings)"
                            />
                            <Area
                                type="monotone"
                                dataKey="sales"
                                stroke="#ffc107"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorSales)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Traffic Pie Chart */}
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col items-center justify-center relative">
                <div className="w-full flex justify-between items-center mb-4 absolute top-6 px-6">
                    <h2 className="text-xl font-bold">Traffic</h2>
                    <span className="text-xs text-primary font-medium cursor-pointer">View More</span>
                </div>

                <div className="h-[200px] w-full mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={trafficData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {trafficData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex justify-center gap-6 mt-4 w-full">
                    {trafficData.map((item) => (
                        <div key={item.name} className="flex flex-col items-center">
                            <span className="text-lg font-bold">{item.value}%</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] text-muted-foreground">{item.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
