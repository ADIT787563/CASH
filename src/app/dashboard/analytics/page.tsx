"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, TrendingUp, Users, MessageSquare, Lock, ArrowRight } from "lucide-react";

interface AnalyticsData {
    period: string;
    revenue: {
        total: number;
        orders: number;
    };
    marketing: {
        campaignsSent: number;
        messagesSent: number;
        readRate: number;
        clickRate: number;
    };
    usage: {
        totalMessages: number;
    };
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/analytics/advanced');

            if (res.status === 403) {
                setIsLocked(true);
                setLoading(false);
                return;
            }

            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount / 100);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
    }

    if (isLocked) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <Lock className="h-8 w-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro Feature Locked</h2>
                <p className="text-gray-600 max-w-md mb-8">
                    Advanced analytics, including revenue trends, campaign ROI, and customer retention insights, are available on the <strong>Pro</strong> plan.
                </p>
                <div className="flex gap-4">
                    <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
                    >
                        Upgrade to Pro <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
                    <p className="text-gray-500">Performance insights for the last 30 days.</p>
                </div>
                <div className="h-8 px-3 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold flex items-center uppercase tracking-wider border border-indigo-100">
                    Pro Plan Active
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Revenue Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12% vs last mo</span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue (30d)</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                        {data ? formatCurrency(data.revenue.total) : '₹0'}
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">{data?.revenue.orders || 0} confirmed orders</p>
                </div>

                {/* Campaign ROI Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">High Engagement</span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Campaign Read Rate</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                        {data?.marketing.readRate}%
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                        {data?.marketing.messagesSent || 0} messages sent in {data?.marketing.campaignsSent} campaigns
                    </p>
                </div>

                {/* Total Usage Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Total Interactions</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                        {data?.usage.totalMessages || 0}
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">Inbound & Outbound messages</p>
                </div>
            </div>

            {/* Note: In a real app, complex charts (Recharts/Chart.js) would go here */}
            {/* For MVP, we provide a placeholder for the visual chart area */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                <div className="max-w-md mx-auto">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Detailed Charts coming soon</h3>
                    <p className="text-gray-500">
                        We are collecting more data points to generate your detailed growth curves.
                        Check back in 24 hours.
                    </p>
                </div>
            </div>
        </div>
    );
}
