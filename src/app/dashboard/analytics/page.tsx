"use client";

import { useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    PieChart,
    Pie,
    Cell
} from "recharts";
import {
    Calendar,
    Download,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    MessageSquare,
    Users,
    ArrowRight,
    Lock,
    AlertTriangle
} from "lucide-react";
import { useRole } from "@/hooks/useRole";

// --- Mock Data ---

const revenueData = [
    { name: "Mon", value: 4000 },
    { name: "Tue", value: 3000 },
    { name: "Wed", value: 5000 },
    { name: "Thu", value: 2780 },
    { name: "Fri", value: 1890 },
    { name: "Sat", value: 2390 },
    { name: "Sun", value: 3490 },
];

const messageData = [
    { name: "Mon", sent: 240, received: 140 },
    { name: "Tue", sent: 139, received: 80 },
    { name: "Wed", sent: 980, received: 450 },
    { name: "Thu", sent: 390, received: 190 },
    { name: "Fri", sent: 480, received: 280 },
    { name: "Sat", sent: 380, received: 150 },
    { name: "Sun", sent: 430, received: 120 },
];

const topProducts = [
    { id: 1, name: "Premium Leather Sneaker", sales: 124, revenue: "₹2,48,000", trend: "+12%" },
    { id: 2, name: "Urban Cargo Pants", sales: 98, revenue: "₹1,47,000", trend: "+5%" },
    { id: 3, name: "Minimalist Hoodie", sales: 86, revenue: "₹1,29,000", trend: "-2%" },
    { id: 4, name: "Classic White Tee", sales: 154, revenue: "₹77,000", trend: "+18%" },
];

// --- Components ---

function MetricCard({ title, value, change, trend, icon: Icon }: any) {
    const isPositive = trend === "up";
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="flex items-center text-sm">
                <span className={`font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'} flex items-center`}>
                    {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {change}
                </span>
                <span className="text-slate-400 ml-2">vs last week</span>
            </div>
        </div>
    );
}

function FunnelStep({ label, value, percentage, color, icon: Icon }: any) {
    return (
        <div className="flex-1 min-w-[140px] relative">
            <div className={`p-4 rounded-xl border-t-4 ${color} bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800`}>
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                </div>
                <div className="flex items-end justify-between">
                    <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-none">{value}</h4>
                    {percentage && (
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                            {percentage}%
                        </span>
                    )}
                </div>
            </div>
            {/* Arrow/connector for desktop */}
            <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="w-5 h-5 text-slate-300" />
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const { checkPermission, isPending: roleLoading } = useRole();
    const [dateRange, setDateRange] = useState("Last 7 Days");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalMessages: 0,
        activeLeads: 0,
        revenueChange: 0,
        ordersChange: 0,
        messagesChange: 0,
        leadsChange: 0
    });

    const hasFinancialAccess = checkPermission("view:analytics");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                // 1. Trigger aggregation for today to ensure fresh data
                await fetch('/api/analytics/aggregate', { method: 'POST' });

                // 2. Fetch last 7 days of data
                const response = await fetch('/api/analytics?limit=7');
                const result = await response.json();

                // Sort by date ascending for charts
                const sortedData = [...result].sort((a, b) => a.date.localeCompare(b.date));
                setData(sortedData);

                // Calculate summary stats
                const totalRev = result.reduce((acc: number, curr: any) => acc + (curr.totalRevenue || 0), 0);
                const totalOrd = result.reduce((acc: number, curr: any) => acc + (curr.totalOrders || 0), 0);
                const totalMsg = result.reduce((acc: number, curr: any) => acc + (curr.totalMessages || 0), 0);
                const totalLeads = result.reduce((acc: number, curr: any) => acc + (curr.newLeads || 0), 0);

                setStats({
                    totalRevenue: totalRev / 100, // paise to INR
                    totalOrders: totalOrd,
                    totalMessages: totalMsg,
                    activeLeads: totalLeads,
                    // Keeping these static or calculated if historical data exists
                    revenueChange: 12.5,
                    ordersChange: 8.2,
                    messagesChange: -2.1,
                    leadsChange: 15.3
                });
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    // Map DB data to Chart formats
    const chartData = data.map(d => ({
        name: d.date,
        shortName: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: d.totalRevenue / 100,
        sent: d.outboundMessages,
        received: d.inboundMessages
    }));

    // Aggregate failures for pie chart
    const failureSummary: Record<string, number> = {};
    data.forEach(d => {
        if (d.failureReasons) {
            Object.entries(d.failureReasons).forEach(([reason, count]) => {
                failureSummary[reason] = (failureSummary[reason] || 0) + (count as number);
            });
        }
    });

    const failurePieData = Object.entries(failureSummary)
        .filter(([_, count]) => count > 0)
        .map(([name, value]) => ({ name: name.replace('_', ' '), value }));

    const COLORS = ['#4f46e5', '#8b5cf6', '#06b6d4', '#ef4444', '#94a3b8'];

    // AG-705: Aggregate Top Products from across all days in range
    const productSummary: Record<string, { id: any, name: string, sales: number, revenue: number }> = {};
    data.forEach(d => {
        if (d.topProducts) {
            const products = typeof d.topProducts === 'string' ? JSON.parse(d.topProducts) : d.topProducts;
            products.forEach((p: any) => {
                if (!productSummary[p.id]) {
                    productSummary[p.id] = { id: p.id, name: p.name, sales: 0, revenue: 0 };
                }
                productSummary[p.id].sales += p.sales;
                productSummary[p.id].revenue += p.revenue;
            });
        }
    });

    const displayProducts = Object.values(productSummary)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(p => ({
            ...p,
            revenue: `₹${(p.revenue / 100).toLocaleString()}`,
            trend: "+0%" // Placeholder for trend
        }));

    const handleExport = () => {
        window.open('/api/analytics/export', '_blank');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Detailed insights into your business performance.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            {dateRange}
                        </button>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={!checkPermission("view:analytics")}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {!checkPermission("view:analytics") ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        Report
                    </button>
                </div>
            </div>

            {/* Funnel Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Conversation Funnel
                    </h2>
                    <p className="text-xs text-slate-500 italic">Conversion from chat to paid orders</p>
                </div>

                <div className="flex flex-wrap lg:flex-nowrap gap-4">
                    <FunnelStep
                        label="Conversations"
                        value={data.reduce((acc, curr) => acc + (curr.uniqueConversations || 0), 0)}
                        color="border-t-indigo-500"
                        icon={MessageSquare}
                    />
                    <FunnelStep
                        label="New Leads"
                        value={stats.activeLeads}
                        percentage={data.reduce((acc, curr) => acc + (curr.uniqueConversations || 0), 0) > 0 ? Math.round((stats.activeLeads / data.reduce((acc, curr) => acc + (curr.uniqueConversations || 0), 0)) * 100) : 0}
                        color="border-t-violet-500"
                        icon={Users}
                    />
                    <FunnelStep
                        label="Orders"
                        value={stats.totalOrders}
                        percentage={stats.activeLeads > 0 ? Math.round((stats.totalOrders / stats.activeLeads) * 100) : 0}
                        color="border-t-cyan-500"
                        icon={ShoppingBag}
                    />
                    <FunnelStep
                        label="Paid"
                        value={data.reduce((acc, curr) => acc + (curr.paidOrders || 0), 0)}
                        percentage={stats.totalOrders > 0 ? Math.round((data.reduce((acc, curr) => acc + (curr.paidOrders || 0), 0) / stats.totalOrders) * 100) : 0}
                        color="border-t-emerald-500"
                        icon={DollarSign}
                    />
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={!hasFinancialAccess ? "blur-sm pointer-events-none select-none relative" : ""}>
                    {!hasFinancialAccess && <div className="absolute inset-0 z-10 flex items-center justify-center font-bold text-slate-400 text-center p-4">FINANCIAL ACCESS REQUIRED</div>}
                    <MetricCard
                        title="Total Revenue"
                        value={`₹${stats.totalRevenue.toLocaleString()}`}
                        change={`${stats.revenueChange}%`}
                        trend={stats.revenueChange >= 0 ? "up" : "down"}
                        icon={DollarSign}
                    />
                </div>
                <div className={!hasFinancialAccess ? "blur-sm pointer-events-none select-none relative" : ""}>
                    {!hasFinancialAccess && <div className="absolute inset-0 z-10 flex items-center justify-center font-bold text-slate-400">RESTRICTED</div>}
                    <MetricCard
                        title="Total Orders"
                        value={stats.totalOrders}
                        change={`${stats.ordersChange}%`}
                        trend={stats.ordersChange >= 0 ? "up" : "down"}
                        icon={ShoppingBag}
                    />
                </div>
                <MetricCard
                    title="Messages"
                    value={stats.totalMessages.toLocaleString()}
                    change={`${stats.messagesChange}%`}
                    trend={stats.messagesChange >= 0 ? "up" : "down"}
                    icon={MessageSquare}
                />
                <MetricCard
                    title="New Leads"
                    value={stats.activeLeads}
                    change={`${stats.leadsChange}%`}
                    trend={stats.leadsChange >= 0 ? "up" : "down"}
                    icon={Users}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Revenue Trend</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="shortName"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#1e293b' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#4f46e5"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Traffic Source / Message Volume */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Message Volume</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="shortName" />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="sent" name="Sent" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="received" name="Received" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Failure Analysis Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                        Failure Reasons
                    </h3>
                    <div className="h-[300px] w-full flex items-center">
                        {failurePieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={failurePieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {failurePieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full text-center text-slate-400 font-medium italic">
                                No failures recorded in this period. Great job!
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col justify-center items-center text-center">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-full mb-4">
                        <Download className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Export Detailed Report</h3>
                    <p className="text-sm text-slate-500 max-w-[300px] mb-6">
                        Download a comprehensive CSV file of your business performance for further analysis or auditing.
                    </p>
                    <button
                        onClick={handleExport}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-shadow shadow-lg hover:shadow-indigo-200"
                    >
                        DOWNLOAD CSV
                    </button>
                </div>
            </div>

            {/* Bottom Table: Top Products */}
            {/* Keeping topProducts mock for now as it needs a separate aggregation or complex query */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Top Performing Products</h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Product Name</th>
                                <th className="px-6 py-3 font-medium">Sales Count</th>
                                <th className="px-6 py-3 font-medium">Revenue Generated</th>
                                <th className="px-6 py-3 font-medium text-right">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {displayProducts.length > 0 ? displayProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{product.name}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{product.sales}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{product.revenue}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${product.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                            {product.trend}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">
                                        No product data available for this range.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
