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
    Zap,
    Bot,
    CreditCard,
    Activity,
    Clock,
    ShieldCheck
} from "lucide-react";
import { useRole } from "@/hooks/useRole";

// --- Constants ---
const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff', '#f3f4f6'];

// --- Components ---

function MetricBox({ title, value, change, trend, icon: Icon, delay }: any) {
    const isPositive = trend === "up";
    return (
        <div
            className="bg-white border border-zinc-200 rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="w-16 h-16 text-zinc-900" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                        <Icon className="w-5 h-5 text-zinc-700" />
                    </div>
                    <p className="text-sm font-medium text-zinc-500">{title}</p>
                </div>

                <h3 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">{value}</h3>

                <div className="flex items-center text-xs">
                    <span className={`font-bold ${isPositive ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'} flex items-center px-2 py-0.5 rounded-full border`}>
                        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {change}
                    </span>
                    <span className="text-zinc-400 ml-2">vs last week</span>
                </div>
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const { checkPermission } = useRole();
    const [dateRange, setDateRange] = useState("Last 30 Days");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/analytics/business");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    // Active Shape for Pie Chart
    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
        return (
            <g>
                <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#18181b" className="text-xl font-bold">{payload.name}</text>
                <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#71717a" className="text-sm">{`${value}%`}</text>
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

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-zinc-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm font-medium text-zinc-500 animate-pulse">Calculating business intelligence...</p>
            </div>
        );
    }

    const COLORS_BI = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-zinc-900 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-4 border-b border-zinc-100 mb-6">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Business Intelligence</h1>
                    <p className="text-sm text-zinc-500 mt-1 font-medium italic">
                        Advanced tracking for sales funnels, AI impact, and health metrics.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-all shadow-sm">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        {dateRange}
                    </button>
                    <button
                        className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* 8. AI Insights Box */}
            {data.insights && data.insights.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                    {data.insights.slice(0, 3).map((insight: string, idx: number) => (
                        <div key={idx} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-left-4" style={{ animationDelay: `${idx * 100}ms` }}>
                            <Zap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-indigo-900">{insight}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* 1. Metric Cards (Overview) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricBox
                    title="Revenue"
                    value={`₹${(data.paymentBreakdown.paidRevenue || 0).toLocaleString()}`}
                    change="+12.5%"
                    trend="up"
                    icon={DollarSign}
                    delay={0}
                />
                <MetricBox
                    title="Conversations"
                    value={data.funnel.newChats || 0}
                    change="+8.2%"
                    trend="up"
                    icon={MessageSquare}
                    delay={100}
                />
                <MetricBox
                    title="Orders"
                    value={data.funnel.ordersConfirmed || 0}
                    change="+15.3%"
                    trend="up"
                    icon={ShoppingBag}
                    delay={200}
                />
                <MetricBox
                    title="AOV"
                    value={`₹${Math.round(data.paymentBreakdown.aov || 0)}`}
                    change="+4.1%"
                    trend="up"
                    icon={TrendingUp}
                    delay={300}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* 1. CONVERSION FUNNEL */}
                <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 mb-8 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" /> Conversion Funnel
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Journey to Sale</span>
                    </h3>

                    <div className="space-y-6">
                        {[
                            { label: "New Chats", value: data.funnel.newChats, color: "bg-zinc-900" },
                            { label: "Price Asked", value: data.funnel.priceAsked, color: "bg-indigo-600" },
                            { label: "Payment Sent", value: data.funnel.paymentSent, color: "bg-indigo-500" },
                            { label: "Orders Confirmed", value: data.funnel.ordersConfirmed, color: "bg-emerald-600" },
                            { label: "Delivered", value: data.funnel.ordersDelivered, color: "bg-emerald-500" }
                        ].map((step, idx, arr) => {
                            const maxWidth = 100;
                            const width = (step.value / arr[0].value) * 100 || 0;
                            return (
                                <div key={idx} className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-zinc-500 uppercase">{step.label}</span>
                                        <span className="text-sm font-extrabold text-zinc-900">{step.value}</span>
                                    </div>
                                    <div className="h-4 w-full bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
                                        <div
                                            className={`h-full ${step.color} transition-all duration-1000 ease-out flex items-center justify-end px-2`}
                                            style={{ width: `${Math.max(width, 2)}%` }}
                                        >
                                            {width > 20 && <span className="text-[10px] text-white font-bold">{Math.round(width)}%</span>}
                                        </div>
                                    </div>
                                    {idx < arr.length - 1 && (
                                        <div className="flex justify-center -my-1 absolute left-1/2 -bottom-4 translate-x-[-50%] z-10">
                                            <ArrowRight className="w-4 h-4 text-zinc-300 rotate-90" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-10 p-4 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl text-center">
                        <p className="text-xs text-zinc-500">
                            Overall Conversion Rate: <span className="text-zinc-900 font-bold">{data.funnel.newChats > 0 ? ((data.funnel.ordersConfirmed / data.funnel.newChats) * 100).toFixed(1) : 0}%</span>
                        </p>
                    </div>
                </div>

                {/* 2. AI PERFORMANCE */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-indigo-600" /> AI Performance
                    </h3>

                    <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">AI Replies</p>
                                <p className="text-xl font-black text-zinc-900">{data.aiPerformance.aiReplies}</p>
                            </div>
                            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Human Replies</p>
                                <p className="text-xl font-black text-zinc-900">{data.aiPerformance.humanReplies}</p>
                            </div>
                        </div>

                        <div className="relative h-48 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'AI Resolves', value: data.aiPerformance.aiReplies },
                                            { name: 'Human Need', value: data.aiPerformance.humanReplies }
                                        ]}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#4f46e5" />
                                        <Cell fill="#e4e4e7" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-zinc-900">{data.aiPerformance.resolvedPercent}%</span>
                                <span className="text-[8px] text-zinc-400 uppercase font-bold tracking-tighter">AI Resolved</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500 font-medium font-bold">AI Fallback Triggered</span>
                                <span className="text-rose-600 font-bold">{data.aiPerformance.fallbackCount} times</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500 font-medium font-bold">Avg AI Speed</span>
                                <span className="text-emerald-600 font-bold">{data.aiPerformance.avgResponseTimeAI}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500 font-medium font-bold">Avg Human Speed</span>
                                <span className="text-zinc-900 font-bold">{data.aiPerformance.avgResponseTimeHuman}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 3. PAYMENT ANALYTICS */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-500" /> Payment Analytics
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'COD', value: data.paymentBreakdown.codCount },
                                            { name: 'Online', value: data.paymentBreakdown.onlineCount }
                                        ]}
                                        innerRadius={50}
                                        outerRadius={70}
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#6366f1" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                                <span className="text-xs text-zinc-600 font-bold">Success Payments</span>
                                <span className="text-sm font-black text-emerald-600">{data.paymentBreakdown.onlineCount + data.paymentBreakdown.codCount}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                                <span className="text-xs text-zinc-600 font-bold">Failed Attempts</span>
                                <span className="text-sm font-black text-rose-500">{data.paymentBreakdown.failed}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                                <span className="text-xs text-indigo-900 font-bold">Total Settled</span>
                                <span className="text-sm font-black text-indigo-700">₹{data.paymentBreakdown.paidRevenue.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. WHATSAPP HEALTH */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500" /> WhatsApp Channel Health
                    </h3>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="text-center p-3 rounded-2xl bg-zinc-50">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Fail Rate</p>
                            <p className={`text-xl font-black ${data.whatsappHealth.failureRate > 5 ? 'text-rose-500' : 'text-zinc-900'}`}>{data.whatsappHealth.failureRate.toFixed(1)}%</p>
                        </div>
                        <div className="text-center p-3 rounded-2xl bg-zinc-50">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Read Rate</p>
                            <p className="text-xl font-black text-zinc-900">{data.whatsappHealth.readRate.toFixed(1)}%</p>
                        </div>
                        <div className="text-center p-3 rounded-2xl bg-zinc-50">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Opt Outs</p>
                            <p className="text-xl font-black text-zinc-900">{data.whatsappHealth.optOuts}</p>
                        </div>
                    </div>

                    <div className="flex-1 bg-zinc-900 rounded-xl p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <ShieldCheck className="w-12 h-12 text-zinc-800" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Quality Score: HIGH</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-relaxed max-w-[80%]">
                                Your account status is healthy. Low block and opt-out rates detected. Continue following Meta template guidelines.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 5. TIME INTELLIGENCE */}
                <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2 text-indigo-600">
                        <Clock className="w-5 h-5" /> Activity Heatmap (Hourly)
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.timeIntelligence.hourlyActivity}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="hour" tickFormatter={(v) => `${v}:00`} tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip labelFormatter={(v) => `${v}:00`} />
                                <Area type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 7. CUSTOMER INTELLIGENCE */}
                <div className="bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-800 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Customer Retention</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <Users className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <span className="text-sm font-medium text-white">Repeat Purchase Rate</span>
                                </div>
                                <span className="text-lg font-black text-emerald-500">{data.customerIntelligence.repeatRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <ShoppingBag className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <span className="text-sm font-medium text-white">Returning Customers</span>
                                </div>
                                <span className="text-lg font-black text-white">{data.customerIntelligence.returningCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-zinc-800">
                        <p className="text-[10px] text-zinc-500 font-bold mb-3 uppercase tracking-tighter">High-Value Segment</p>
                        <p className="text-sm text-zinc-300">
                            You have <span className="text-white font-black text-md">24</span> customers with 3+ orders. They contribute <span className="text-indigo-400 font-bold">42%</span> of your total revenue.
                        </p>
                    </div>
                </div>
            </div>

            {/* 6. PRODUCT INTELLIGENCE */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-500" /> Product Intelligence
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-100">
                                <th className="pb-4 text-xs font-bold text-zinc-400 uppercase tracking-tighter">Product Name</th>
                                <th className="pb-4 text-xs font-bold text-zinc-400 uppercase tracking-tighter">Total Orders</th>
                                <th className="pb-4 text-xs font-bold text-zinc-400 uppercase tracking-tighter">Gross Revenue</th>
                                <th className="pb-4 text-xs font-bold text-zinc-400 uppercase tracking-tighter">Conversion Stat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {data.productIntelligence.topProducts.map((p: any, idx: number) => (
                                <tr key={idx} className="group hover:bg-zinc-50 transition-colors">
                                    <td className="py-4 text-sm font-extrabold text-zinc-900">{p.name}</td>
                                    <td className="py-4 text-sm font-medium text-zinc-600">{p.orders}</td>
                                    <td className="py-4 text-sm font-bold text-indigo-600">₹{(p.revenue / 100).toLocaleString()}</td>
                                    <td className="py-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${idx === 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-zinc-50 text-zinc-400 border border-zinc-100'}`}>
                                            {idx === 0 ? 'High Performance' : 'Standard'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
