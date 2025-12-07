"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  MessageCircle,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  ArrowRight,
  ChevronDown,
  X,
  RefreshCw,
  Filter,
  Globe,
  Share2,
  Smartphone,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import html2canvas from "html2canvas";
import { Footer } from "@/components/home/Footer";

// Types
interface MessageSeriesData {
  date: string;
  messages: number;
  inboundMessages: number;
  outboundMessages: number;
  leads: number;
  responseRate: number;
}

interface ProductViewData {
  productId: number;
  name: string;
  views: number;
  clicks: number;
  ctr: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface TrafficBreakdown {
  source: string;
  count: number;
  percent: number;
}

interface DateRange {
  from: string;
  to: string;
}

// Color constants matching WaveGroww brand
const COLORS = {
  primary: "#00B67A",
  accent: "#2196F3",
  secondary: "#FFD54F",
  success: "#4CAF50",
  chart1: "#00B67A",
  chart2: "#2196F3",
  chart3: "#FFD54F",
  chart4: "#4CAF50",
  chart5: "#1E88E5",
};

const PIE_COLORS = [COLORS.primary, COLORS.accent, COLORS.secondary, COLORS.chart4, COLORS.chart5];

const PIE_COLOR_CLASSES = [
  "bg-primary",
  "bg-accent",
  "bg-secondary",
  "bg-success",
  "bg-chart-5"
];

const getColorClass = (color: string) => {
  switch (color) {
    case COLORS.primary: return "text-primary";
    case COLORS.accent: return "text-accent";
    case COLORS.secondary: return "text-secondary";
    case COLORS.success: return "text-success";
    case COLORS.chart5: return "text-chart-5";
    default: return "text-primary";
  }
};

export default function AnalyticsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });
  const [compareMode, setCompareMode] = useState(false);
  const [granularity, setGranularity] = useState<"daily" | "weekly" | "monthly">("daily");
  const [topN, setTopN] = useState(10);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductViewData | null>(null);

  // Data state
  const [messagesData, setMessagesData] = useState<MessageSeriesData[]>([]);
  const [previousMessagesData, setPreviousMessagesData] = useState<MessageSeriesData[]>([]);
  const [productsData, setProductsData] = useState<ProductViewData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficBreakdown[]>([]);

  // Refs for chart export
  const messagesChartRef = useRef<HTMLDivElement>(null);
  const productsChartRef = useRef<HTMLDivElement>(null);
  const revenueChartRef = useRef<HTMLDivElement>(null);
  const trafficChartRef = useRef<HTMLDivElement>(null);

  // Auto-refresh timer
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const refreshInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Fetch all analytics data
  const fetchAnalytics = useCallback(async (showLoader = true) => {
    if (!session?.user) return;

    if (showLoader) setIsLoading(true);
    setIsRefreshing(!showLoader);

    try {
      const token = localStorage.getItem("bearer_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel
      const [messagesRes, productsRes, revenueRes, trafficRes] = await Promise.all([
        fetch(
          `/api/analytics/messages?from=${dateRange.from}&to=${dateRange.to}&granularity=${granularity}`,
          { headers }
        ),
        fetch(`/api/analytics/products/views?from=${dateRange.from}&to=${dateRange.to}&top=${topN}`, {
          headers,
        }),
        fetch(`/api/analytics/revenue?from=${dateRange.from}&to=${dateRange.to}`, { headers }),
        fetch(`/api/analytics/traffic-share?from=${dateRange.from}&to=${dateRange.to}`, { headers }),
      ]);

      const messages = await messagesRes.json();
      const products = await productsRes.json();
      const revenue = await revenueRes.json();
      const traffic = await trafficRes.json();

      setMessagesData(messages.series || []);
      setProductsData(products.items || []);
      setRevenueData(revenue.series || []);
      setTrafficData(traffic.breakdown || []);

      // Fetch previous period data if compare mode is enabled
      if (compareMode) {
        const daysDiff = Math.ceil(
          (new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / (1000 * 60 * 60 * 24)
        );
        const prevFrom = format(subDays(new Date(dateRange.from), daysDiff), "yyyy-MM-dd");
        const prevTo = format(subDays(new Date(dateRange.to), daysDiff), "yyyy-MM-dd");

        const prevMessagesRes = await fetch(
          `/api/analytics/messages?from=${prevFrom}&to=${prevTo}&granularity=${granularity}`,
          { headers }
        );
        const prevMessages = await prevMessagesRes.json();
        setPreviousMessagesData(prevMessages.series || []);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [session, dateRange, granularity, topN, compareMode]);

  useEffect(() => {
    if (session?.user) {
      fetchAnalytics();
    }
  }, [session, dateRange, granularity, topN, compareMode]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    refreshInterval.current = setInterval(() => {
      fetchAnalytics(false);
    }, 30000);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [fetchAnalytics]);

  // Date range presets
  const applyPreset = (preset: string) => {
    const today = new Date();
    let from: Date;

    switch (preset) {
      case "7d":
        from = subDays(today, 7);
        break;
      case "30d":
        from = subDays(today, 30);
        break;
      case "90d":
        from = subDays(today, 90);
        break;
      case "thisWeek":
        from = startOfWeek(today);
        break;
      case "thisMonth":
        from = startOfMonth(today);
        break;
      default:
        return;
    }

    setDateRange({
      from: format(from, "yyyy-MM-dd"),
      to: format(today, "yyyy-MM-dd"),
    });
    setShowCustomDate(false);
  };

  // Export to CSV
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => row[header]).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success(`${filename} exported successfully!`);
  };

  // Export chart to PNG
  const exportChartToPNG = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) {
      toast.error("Chart not found");
      return;
    }

    try {
      const canvas = await html2canvas(ref.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${filename}-${format(new Date(), "yyyy-MM-dd")}.png`;
          a.click();
          toast.success(`${filename} chart exported!`);
        }
      });
    } catch (error) {
      console.error("Error exporting chart:", error);
      toast.error("Failed to export chart");
    }
  };

  // Export all data
  const exportAll = async () => {
    try {
      await Promise.all([
        exportToCSV(messagesData, "messages-leads-data"),
        exportToCSV(productsData, "products-views-data"),
        exportToCSV(revenueData, "revenue-data"),
        exportToCSV(trafficData, "traffic-sources-data"),
      ]);
      toast.success("All data exported successfully!");
    } catch (error) {
      toast.error("Failed to export all data");
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label, percentChange }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span className={getColorClass(entry.color)}>{entry.name}:</span>
              <span className="font-bold">{entry.value.toLocaleString()}</span>
            </div>
          ))}
          {percentChange && (
            <div className="mt-2 pt-2 border-t border-border">
              <span className={`text-xs font-medium ${percentChange > 0 ? "text-success" : "text-destructive"}`}>
                {percentChange > 0 ? "↑" : "↓"} {Math.abs(percentChange).toFixed(1)}% vs prev period
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Live Analytics Dashboard
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              Real-time insights • Last updated: {format(lastRefresh, "HH:mm:ss")}
              {isRefreshing && (
                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fetchAnalytics(false)}
              className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportAll}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export All
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="glass-card p-6 rounded-2xl mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Range Presets */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="flex gap-2 flex-wrap">
                {["7d", "30d", "90d"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${!showCustomDate && dateRange.from === format(subDays(new Date(), parseInt(preset)), "yyyy-MM-dd")
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border hover:bg-muted"
                      }`}
                  >
                    {preset === "7d" && "Last 7 Days"}
                    {preset === "30d" && "Last 30 Days"}
                    {preset === "90d" && "Last 90 Days"}
                  </button>
                ))}
                <button
                  onClick={() => setShowCustomDate(!showCustomDate)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${showCustomDate
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:bg-muted"
                    }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Custom Date Inputs */}
            {showCustomDate && (
              <>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="px-4 py-2 bg-card border border-border rounded-lg"
                  aria-label="Start Date"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="px-4 py-2 bg-card border border-border rounded-lg"
                  aria-label="End Date"
                />
              </>
            )}

            {/* Compare Toggle */}
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${compareMode
                ? "bg-accent text-accent-foreground"
                : "bg-card border border-border hover:bg-muted"
                }`}
            >
              <Filter className="w-4 h-4" />
              Compare {compareMode && "✓"}
            </button>
          </div>
        </div>

        {/* Messages & Leads Activity Chart */}
        <div ref={messagesChartRef} className="glass-card p-8 rounded-2xl mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                Messages & Leads Activity
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Time-series performance metrics</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Granularity Selector */}
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value as any)}
                className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Granularity"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => exportToCSV(messagesData, "messages-leads")}
                  className="p-2 hover:bg-muted rounded-lg transition-all"
                  title="Export CSV"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => exportChartToPNG(messagesChartRef, "messages-leads-chart")}
                  className="p-2 hover:bg-muted rounded-lg transition-all"
                  title="Export PNG"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={messagesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="var(--color-muted-foreground)"
                tick={{ fill: "var(--color-muted-foreground)" }}
              />
              <YAxis stroke="var(--color-muted-foreground)" tick={{ fill: "var(--color-muted-foreground)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="messages"
                stroke={COLORS.primary}
                strokeWidth={3}
                dot={{ fill: COLORS.primary, r: 4 }}
                activeDot={{ r: 6 }}
                name="Messages"
              />
              <Line
                type="monotone"
                dataKey="leads"
                stroke={COLORS.accent}
                strokeWidth={3}
                dot={{ fill: COLORS.accent, r: 4 }}
                activeDot={{ r: 6 }}
                name="Leads"
              />
              <Line
                type="monotone"
                dataKey="responseRate"
                stroke={COLORS.secondary}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: COLORS.secondary, r: 3 }}
                name="Response Rate"
              />
              {compareMode && previousMessagesData.length > 0 && (
                <>
                  <Line
                    type="monotone"
                    dataKey="messages"
                    data={previousMessagesData}
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    opacity={0.5}
                    dot={false}
                    name="Messages (Previous)"
                  />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    data={previousMessagesData}
                    stroke={COLORS.accent}
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    opacity={0.5}
                    dot={false}
                    name="Leads (Previous)"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 bg-primary/10 rounded-xl">
              <div className="text-sm text-muted-foreground mb-1">Total Messages</div>
              <div className="text-2xl font-bold text-primary">
                {messagesData.reduce((sum, d) => sum + d.messages, 0).toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-accent/10 rounded-xl">
              <div className="text-sm text-muted-foreground mb-1">Total Leads</div>
              <div className="text-2xl font-bold text-accent">
                {messagesData.reduce((sum, d) => sum + d.leads, 0).toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-success/10 rounded-xl">
              <div className="text-sm text-muted-foreground mb-1">Avg Response Rate</div>
              <div className="text-2xl font-bold text-success">
                {messagesData.length > 0
                  ? (
                    messagesData.reduce((sum, d) => sum + d.responseRate, 0) / messagesData.length
                  ).toFixed(2)
                  : 0}
                %
              </div>
            </div>
            <div className="p-4 bg-secondary/10 rounded-xl">
              <div className="text-sm text-muted-foreground mb-1">Conversion Rate</div>
              <div className="text-2xl font-bold text-[#FFD54F]">
                {messagesData.reduce((sum, d) => sum + d.messages, 0) > 0
                  ? (
                    (messagesData.reduce((sum, d) => sum + d.leads, 0) /
                      messagesData.reduce((sum, d) => sum + d.messages, 0)) *
                    100
                  ).toFixed(1)
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Most Viewed Products Chart */}
          <div ref={productsChartRef} className="glass-card p-8 rounded-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Package className="w-6 h-6 text-accent" />
                  Most Viewed Products
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Top performing products by views</p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <select
                  value={topN}
                  onChange={(e) => setTopN(parseInt(e.target.value))}
                  className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Top Products Count"
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={20}>Top 20</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportToCSV(productsData, "products-views")}
                    className="p-2 hover:bg-muted rounded-lg transition-all"
                    title="Export CSV"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => exportChartToPNG(productsChartRef, "products-chart")}
                    className="p-2 hover:bg-muted rounded-lg transition-all"
                    title="Export PNG"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={productsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                <XAxis type="number" stroke="var(--color-muted-foreground)" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  stroke="var(--color-muted-foreground)"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="views"
                  fill={COLORS.accent}
                  radius={[0, 8, 8, 0]}
                  onClick={(data) => setSelectedProduct(data.payload as ProductViewData)}
                  cursor="pointer"
                  name="Views"
                />
                <Bar dataKey="clicks" fill={COLORS.success} radius={[0, 8, 8, 0]} name="Clicks" />
              </BarChart>
            </ResponsiveContainer>

            {productsData.length > 0 && (
              <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                <div className="text-sm font-semibold mb-2">Quick Stats</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Views</div>
                    <div className="text-lg font-bold">
                      {productsData.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Clicks</div>
                    <div className="text-lg font-bold">
                      {productsData.reduce((sum, p) => sum + p.clicks, 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg CTR</div>
                    <div className="text-lg font-bold">
                      {productsData.length > 0
                        ? (
                          (productsData.reduce((sum, p) => sum + p.ctr, 0) / productsData.length) *
                          100
                        ).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Traffic Share Donut Chart */}
          <div ref={trafficChartRef} className="glass-card p-8 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Globe className="w-6 h-6 text-success" />
                  Traffic Share
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Distribution by traffic source</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportToCSV(trafficData, "traffic-sources")}
                  className="p-2 hover:bg-muted rounded-lg transition-all"
                  title="Export CSV"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => exportChartToPNG(trafficChartRef, "traffic-chart")}
                  className="p-2 hover:bg-muted rounded-lg transition-all"
                  title="Export PNG"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficData as any}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="count"
                  label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold">{data.source}</p>
                          <p className="text-sm">Count: {data.count.toLocaleString()}</p>
                          <p className="text-sm">Share: {data.percent}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3 mt-6">
              {trafficData.map((item, index) => {
                const icon = {
                  campaign: <Megaphone className="w-5 h-5" />,
                  direct: <Globe className="w-5 h-5" />,
                  shared_link: <Share2 className="w-5 h-5" />,
                  social: <Smartphone className="w-5 h-5" />,
                }[item.source];

                return (
                  <div
                    key={item.source}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${PIE_COLOR_CLASSES[index % PIE_COLOR_CLASSES.length]}`}
                      />
                      <div className="flex items-center gap-2">
                        {icon}
                        <span className="font-medium capitalize">{item.source.replace("_", " ")}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.count.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{item.percent}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily Sales Revenue Chart */}
        <div ref={revenueChartRef} className="glass-card p-8 rounded-2xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-success" />
                Daily Sales Revenue
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Revenue and order count over time</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportToCSV(revenueData, "revenue-data")}
                className="p-2 hover:bg-muted rounded-lg transition-all"
                title="Export CSV"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => exportChartToPNG(revenueChartRef, "revenue-chart")}
                className="p-2 hover:bg-muted rounded-lg transition-all"
                title="Export PNG"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="var(--color-muted-foreground)"
                tick={{ fill: "var(--color-muted-foreground)" }}
              />
              <YAxis
                yAxisId="left"
                stroke="var(--color-muted-foreground)"
                tick={{ fill: "var(--color-muted-foreground)" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="var(--color-muted-foreground)"
                tick={{ fill: "var(--color-muted-foreground)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Revenue (₹)" />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke={COLORS.secondary}
                strokeWidth={2}
                fill="url(#revenueGradient)"
                name="Orders"
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-success/10 rounded-xl">
              <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-success">
                ₹{revenueData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-primary/10 rounded-xl">
              <div className="text-sm text-muted-foreground mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-primary">
                {revenueData.reduce((sum, d) => sum + d.orders, 0).toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-accent/10 rounded-xl">
              <div className="text-sm text-muted-foreground mb-1">Avg Order Value</div>
              <div className="text-2xl font-bold text-accent">
                ₹
                {revenueData.reduce((sum, d) => sum + d.orders, 0) > 0
                  ? Math.round(
                    revenueData.reduce((sum, d) => sum + d.revenue, 0) /
                    revenueData.reduce((sum, d) => sum + d.orders, 0)
                  ).toLocaleString()
                  : 0}
              </div>
            </div>
          </div>
        </div>

        {/* Product Detail Panel (Modal) */}
        {selectedProduct && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className="glass-card p-8 rounded-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Product Details</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-all"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Product Name</div>
                  <div className="text-xl font-bold">{selectedProduct.name}</div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-accent/10 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">Total Views</div>
                    <div className="text-2xl font-bold text-accent">
                      {selectedProduct.views.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-success/10 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">Clicks</div>
                    <div className="text-2xl font-bold text-success">
                      {selectedProduct.clicks.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">CTR</div>
                    <div className="text-2xl font-bold text-primary">
                      {(selectedProduct.ctr * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-xl">
                  <div className="text-sm font-semibold mb-2">Performance Analysis</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engagement Rate:</span>
                      <span className="font-medium">
                        {selectedProduct.clicks > 0 ? "High" : "Low"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product Ranking:</span>
                      <span className="font-medium">
                        #{productsData.findIndex((p) => p.productId === selectedProduct.productId) + 1} of{" "}
                        {productsData.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}