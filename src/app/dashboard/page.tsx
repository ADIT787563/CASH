"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import ProtectedPage from "@/components/ProtectedPage";
import { usePricing } from "@/hooks/useConfig";
import { Footer } from "@/components/home/Footer";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { OrderTable } from "@/components/dashboard/OrderTable";

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

interface ActivityItem {
  id: string | number;
  type: string;
  message: string;
  time: string;
  status: "success" | "pending" | "error";
  title?: string; // Mapped for UI
  desc?: string; // Mapped for UI
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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);

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
        // Fetch all data in parallel
        const [messagesRes, leadsRes, productsRes, businessRes] = await Promise.race([
          Promise.all([
            fetch("/api/messages", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/api/leads", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/api/products", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/api/businesses/me"), // Cookie auth
          ]),
          timeoutPromise
        ]) as [Response, Response, Response, Response];

        const messages = await messagesRes.json();
        const leads = await leadsRes.json();
        const products = await productsRes.json();

        if (businessRes.ok) {
          const bizData = await businessRes.json();
          setBusiness(bizData);
        }

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
          // Map activity to new UI format if needed, simplistic mapping here
          const mappedActivities = activitiesData.map((a: any) => ({
            ...a,
            title: a.type === 'order' ? 'New Order' : a.type === 'message' ? 'Message' : 'Lead',
            desc: a.message,
            // Colors/icons handled in component for now by default 
          }));
          setActivities(mappedActivities);
        } else {
          setActivities([]);
        }

      } catch (error) {
        console.error("Data fetch error:", error);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <main className="container mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            Stats Overview
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {user?.name}
          </p>
        </div>

        {/* Top Charts Row */}
        <DashboardCharts />

        {/* Stat Cards Row */}
        <StatCards />

        {/* Bottom Row: Activity & Orders */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 h-full">
            <RecentActivity activities={activities.length > 0 ? activities : undefined} />
          </div>
          <div className="xl:col-span-2 h-full">
            <OrderTable />
          </div>
        </div>
      </main>
      <div className="mt-12">
        <Footer />
      </div>
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
