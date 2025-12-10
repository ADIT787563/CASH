"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
    Users,
    CreditCard,
    IndianRupee,
    ShieldAlert,
    Activity
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminStats {
    totalUsers: number;
    activeSubs: number;
    totalRevenue: number;
    formattedRevenue: string;
}

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const SUPER_ADMINS = ['admin@wavegroww.com', 'a2max@example.com']; // Sync with backend

    useEffect(() => {
        if (authLoading) return;

        if (!user || !user.email || !SUPER_ADMINS.includes(user.email)) {
            router.push('/dashboard'); // Kick out non-admins
            return;
        }

        fetchStats();
    }, [user, authLoading]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (!res.ok) throw new Error('Failed to fetch stats');
            const data = await res.json();
            setStats(data);
        } catch (err) {
            setError('Failed to load admin data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                <ShieldAlert className="mr-2" /> {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-indigo-600" />
                        <span className="font-bold text-xl text-gray-900">Wavegroww Super Admin</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                            Back to User Dashboard
                        </Link>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                            <span className="text-sm font-medium text-indigo-700">SA</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
                    <p className="text-gray-500">Real-time metrics for Wavegroww platform.</p>
                </div>

                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Total Users */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers}</h3>
                            </div>
                            <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>

                        {/* Active Subscriptions */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Active Subscriptions</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stats.activeSubs}</h3>
                            </div>
                            <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                                <Activity className="w-6 h-6 text-green-600" />
                            </div>
                        </div>

                        {/* Total Revenue */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stats.formattedRevenue}</h3>
                            </div>
                            <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <IndianRupee className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
