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
    AlertTriangle,
    Zap
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

// Vertical Bar Data
const messageVolumeData = [
    { name: "Mon", sent: 240, received: 140 },
    { name: "Tue", sent: 139, received: 80 },
    { name: "Wed", sent: 980, received: 450 },
    { name: "Thu", sent: 390, received: 190 },
    { name: "Fri", sent: 480, received: 280 },
    { name: "Sat", sent: 380, received: 150 },
    { name: "Sun", sent: 430, received: 120 },
];

// Horizontal Bar Data (Top Products)
const productPerformanceData = [
    { name: "Leather Sneaker", sales: 124 },
    { name: "Cargo Pants", sales: 98 },
    { name: "Hoodie", sales: 86 },
    { name: "White Tee", sales: 154 },
    { name: "Denim Jacket", sales: 65 },
];

const COLORS = ['#ffffff', '#a1a1aa', '#52525b', '#27272a', '#18181b'];

// --- Components ---

function MetricBox({ title, value, change, trend, icon: Icon, delay }: any) {
    const isPositive = trend === "up";
    return (
        <div
            className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-16 h-16 text-white" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-zinc-400">{title}</p>
                </div>

                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{value}</h3>

                <div className="flex items-center text-xs">
                    <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'} flex items-center bg-white/5 px-2 py-0.5 rounded-full border border-white/5`}>
                        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {change}
                    </span>
                    <span className="text-zinc-500 ml-2">vs last week</span>
                </div>
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const { checkPermission } = useRole();
    const [dateRange, setDateRange] = useState("Last 7 Days");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 245000,
        totalOrders: 142,
        totalMessages: 3840,
        activeLeads: 85,
    });

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 800);
    }, []);

    // Active Shape for Pie Chart
    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
        return (
            <g>
                <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#fff" className="text-xl font-bold">{payload.name}</text>
                <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#999" className="text-sm">{`${value}%`}</text>
                <path d={props.d} stroke="none" fill={fill} />
                <path d={`M${cx},${cy}L${cx},${cy}`} stroke={fill} strokeWidth={2} />
            </g>
        );
    };

    const pieData = [
        { name: 'Delivered', value: 65 },
        { name: 'Read', value: 25 },
        { name: 'Failed', value: 10 },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Performance metrics and insights.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-white hover:bg-zinc-800 transition-colors">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        {dateRange}
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg text-sm font-bold transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* 1. BOX: Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricBox
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    change="+12.5%"
                    trend="up"
                    icon={DollarSign}
                    delay={0}
                />
                <MetricBox
                    title="Total Orders"
                    value={stats.totalOrders}
                    change="+8.2%"
                    trend="up"
                    icon={ShoppingBag}
                    delay={100}
                />
                <MetricBox
                    title="Messages"
                    value={stats.totalMessages.toLocaleString()}
                    change="-2.1%"
                    trend="down"
                    icon={MessageSquare}
                    delay={200}
                />
                <MetricBox
                    title="Active Leads"
                    value={stats.activeLeads}
                    change="+15.3%"
                    trend="up"
                    icon={Users}
                    delay={300}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. VERTICAL: Message Volume */}
                <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-zinc-400" />
                            Message Volume (Vertical)
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={messageVolumeData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="sent" name="Sent" fill="#fff" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="received" name="Received" fill="#52525b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. CIRCLE: Status/Donut */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-zinc-400" />
                        Delivery Status (Circle)
                    </h3>
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-zinc-400 text-xs ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                            <div className="text-2xl font-bold text-white">98%</div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Success</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 4. HORIZONTAL: Top Products */}
                <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-zinc-400" />
                        Top Products (Horizontal)
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={productPerformanceData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                barSize={20}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#d4d4d8', fontSize: 13, fontWeight: 500 }}
                                    width={120}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="sales" name="Sales" radius={[0, 4, 4, 0]}>
                                    {productPerformanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#ffffff" fillOpacity={0.8 - (index * 0.15)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Extra Box for Quick Stats */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent mix-blend-overlay" />
                    <div className="mb-4 p-4 bg-white/10 rounded-full">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Campaign Performance</h3>
                    <p className="text-sm text-zinc-400 mb-6">
                        Your latest campaign had a <span className="text-white font-bold">12%</span> higher click rate than average.
                    </p>
                    <button className="px-6 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}
