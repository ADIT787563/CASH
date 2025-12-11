"use client";

import {
    AreaChart,
    Area,
    XAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface ChartData {
    name: string;
    earnings: number;
    sales: number;
}

interface TrafficData {
    name: string;
    value: number;
    color: string;
    [key: string]: any;
}

interface DashboardChartsProps {
    earningsData?: ChartData[];
    trafficData?: TrafficData[];
    totalEarnings?: number;
    totalSales?: number;
    loading?: boolean;
}

const defaultData = [
    { name: "Jan", earnings: 40, sales: 24 },
    { name: "Feb", earnings: 30, sales: 13 },
    { name: "Mar", earnings: 20, sales: 98 },
    { name: "Apr", earnings: 27, sales: 39 },
    { name: "May", earnings: 18, sales: 48 },
    { name: "Jun", earnings: 23, sales: 38 },
    { name: "Jul", earnings: 34, sales: 43 },
];

const defaultTrafficData = [
    { name: "YouTube", value: 55, color: "#e91e63" },
    { name: "Facebook", value: 33, color: "#673ab7" },
    { name: "Direct Search", value: 12, color: "#ffc107" },
];

export function DashboardCharts({
    earningsData = defaultData,
    trafficData = defaultTrafficData,
    totalEarnings = 0,
    totalSales = 0,
    loading = false
}: DashboardChartsProps) {

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 h-[400px] bg-muted/20 animate-pulse rounded-3xl" />
                <div className="h-[400px] bg-muted/20 animate-pulse rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Earnings Chart */}
            <div className="lg:col-span-2 bg-card rounded-3xl p-6 shadow-sm border border-border">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold">Dashboard</h2>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-bold text-primary">₹{totalEarnings.toLocaleString()}</span>
                            <span className="text-sm text-muted-foreground mr-4">Total Earnings</span>

                            <span className="text-2xl font-bold ml-2">{totalSales}</span>
                            <span className="text-sm text-muted-foreground">Total Sales</span>
                        </div>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={earningsData}>
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
                                name="Earnings"
                            />
                            <Area
                                type="monotone"
                                dataKey="sales"
                                stroke="#ffc107"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorSales)"
                                name="Sales"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Traffic Pie Chart */}
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col items-center justify-center relative min-h-[400px]">
                <div className="w-full flex justify-between items-center mb-4 absolute top-6 px-6">
                    <h2 className="text-xl font-bold">Traffic</h2>
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
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mt-6 w-full">
                    {trafficData.map((item) => (
                        <div key={item.name} className="flex flex-col items-center min-w-[30%]">
                            <span className="text-lg font-bold">{item.value}%</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
