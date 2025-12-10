"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import {
    Plus,
    Megaphone,
    Calendar,
    CheckCircle2,
    AlertCircle,
    ArrowLeft
} from "lucide-react";

interface Campaign {
    id: number;
    name: string;
    status: string;
    sentCount: number;
    deliveredCount: number;
    createdAt: string;
    scheduledAt: string | null;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('/api/campaigns');
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link href="/dashboard" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Megaphone className="w-6 h-6 text-indigo-600" />
                                Campaigns
                            </h1>
                            <p className="text-gray-500">Manage your WhatsApp marketing campaigns.</p>
                        </div>
                        <Link
                            href="/campaigns/new"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Campaign
                        </Link>
                    </div>

                    {/* Stats Summary (Optional) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">Total Sent</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {campaigns.reduce((acc, c) => acc + c.sentCount, 0)}
                            </h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">Delivered</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {campaigns.reduce((acc, c) => acc + c.deliveredCount, 0)}
                            </h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {campaigns.filter(c => c.status === 'scheduled' || c.status === 'draft').length}
                            </h3>
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
                        ) : campaigns.length === 0 ? (
                            <div className="p-12 text-center">
                                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No campaigns yet</h3>
                                <p className="text-gray-500 mb-6">Create your first campaign to reach your customers.</p>
                                <Link
                                    href="/campaigns/new"
                                    className="inline-flex items-center text-indigo-600 font-medium hover:underline"
                                >
                                    Create one now &rarr;
                                </Link>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Sent / Delivered</th>
                                        <th className="px-6 py-4">Created Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {campaigns.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.status === 'sent' ? 'bg-green-100 text-green-800' :
                                                        c.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {c.sentCount} / {c.deliveredCount}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(c.createdAt).toLocaleDateString()}
                                                {c.scheduledAt && (
                                                    <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(c.scheduledAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedPage>
    );
}
