"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  MessageCircle,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  FileText,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import { usePricing } from "@/hooks/useConfig";
import { Footer } from "@/components/home/Footer";

interface Stats {
  totalMessages: number;
  totalLeads: number;
  totalProducts: number;
  conversionRate: number;
  messagesChange: number;
  leadsChange: number;
  productsChange: number;
  conversionChange: number;
}

interface RecentActivity {
  id: string | number;
  type: string;
  message: string;
  time: string;
  status: "success" | "pending" | "error";
}

function DashboardContent() {
  const { user } = useAuth();
  const { data: plans } = usePricing();
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    totalLeads: 0,
    totalProducts: 0,
    conversionRate: 0,
    messagesChange: 0,
    leadsChange: 0,
    productsChange: 0,
    conversionChange: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Defer data fetching to avoid blocking initial render
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("bearer_token");

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      try {
        // Fetch all data in parallel with timeout
        const [messagesRes, leadsRes, productsRes] = await Promise.race([
          Promise.all([
            fetch("/api/messages", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/api/leads", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/api/products", { headers: { Authorization: `Bearer ${token}` } }),
          ]),
          timeoutPromise
        ]) as [Response, Response, Response];

        const messages = await messagesRes.json();
        const leads = await leadsRes.json();
        const products = await productsRes.json();

        // Calculate stats safely
        const totalMessages = Array.isArray(messages.data) ? messages.data.length : 0;
        const totalLeads = Array.isArray(leads.data) ? leads.data.length : 0;
        const totalProducts = Array.isArray(products.data) ? products.data.length : 0;
        const conversionRate = totalMessages > 0 ? ((totalLeads / totalMessages) * 100) : 0;

        setStats({
          totalMessages,
          totalLeads,
          totalProducts,
          conversionRate,
          messagesChange: 12.5,
          leadsChange: 8.3,
          productsChange: 5.2,
          conversionChange: 3.1,
        });


        // Fetch recent activity
        const activitiesRes = await fetch("/api/dashboard/activity", { headers: { Authorization: `Bearer ${token}` } });
        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setActivities(activitiesData);
        } else {
          console.error("Failed to fetch activities");
          // Fallback to empty or previous state, simply don't set mock data
          setActivities([]);
        }

      } catch (error) {
        console.error("Data fetch error:", error);
        // Keep default stats on error
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Messages",
      value: stats.totalMessages,
      change: stats.messagesChange,
      icon: MessageCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Leads",
      value: stats.totalLeads,
      change: stats.leadsChange,
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Products",
      value: stats.totalProducts,
      change: stats.productsChange,
      icon: Package,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate.toFixed(1)}%`,
      change: stats.conversionChange,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  const quickActions = [
    {
      title: "AI Chatbot",
      description: "Configure chatbot settings",
      icon: Bot,
      href: "/chatbot",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Manage Catalog",
      description: "Add or update products",
      icon: Package,
      href: "/catalog",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "View Leads",
      description: "Check customer leads",
      icon: Users,
      href: "/leads",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Create Template",
      description: "Build message templates",
      icon: FileText,
      href: "/templates",
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  const currentPlan = plans?.find((p) => p.planId === (user as any)?.plan) || plans?.find((p) => p.planId === "starter");

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, <span className="gradient-text">{user?.name}</span>!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your WhatsApp automation today.
            </p>
          </div>

          {/* Plan Info Card */}
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Plan</p>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{currentPlan?.planName || "Free"}</span>
                <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded-full capitalize">Active</span>
              </div>
            </div>
            <div className="h-8 w-px bg-border mx-2 hidden md:block" />
            <div className="hidden md:block">
              <p className="text-xs text-muted-foreground">Limits</p>
              <p className="text-sm font-medium">
                {currentPlan?.limits?.messages || 100} msgs/mo
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const isPositive = stat.change >= 0;
            return (
              <div
                key={index}
                className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {isPositive ? (
                      <ArrowUpRight className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    )}
                    <span className={isPositive ? "text-success" : "text-destructive"}>
                      {Math.abs(stat.change)}%
                    </span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={index}
                      href={action.href}
                      className="p-4 border border-border rounded-xl hover:border-primary/50 transition-all hover:scale-105 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-5 h-5 ${action.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6 rounded-2xl mt-6">
              <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 border border-border rounded-lg"
                  >
                    <div
                      className={`p-2 rounded-lg ${activity.status === "success"
                        ? "bg-success/10"
                        : activity.status === "pending"
                          ? "bg-secondary/10"
                          : "bg-destructive/10"
                        }`}
                    >
                      {activity.status === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : activity.status === "pending" ? (
                        <Clock className="w-5 h-5 text-secondary" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.message}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics Summary */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Analytics</h2>
              <Link
                href="/dashboard/analytics"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Message Success Rate</span>
                  <span className="text-sm font-semibold">92%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent w-[92%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Lead Response Time</span>
                  <span className="text-sm font-semibold">2.5 min</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-success to-primary w-[75%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Active Campaigns</span>
                  <span className="text-sm font-semibold">5 running</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-secondary to-accent w-[60%]"></div>
                </div>
              </div>

              <Link
                href="/dashboard/analytics"
                className="block w-full mt-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-center hover:bg-primary/90 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  View Detailed Analytics
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedPage>
      <DashboardContent />
    </ProtectedPage>
  );
}
