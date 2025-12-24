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
            <div className="min-h-screen bg-background p-6 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                            </Link>
                            <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-4">
                                <Megaphone className="w-10 h-10 text-primary" />
                                Campaigns
                            </h1>
                            <p className="text-lg text-muted-foreground mt-2">Manage your WhatsApp marketing campaigns.</p>
                        </div>
                        <Link
                            href="/campaigns/new"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-md transition-all hover:scale-105"
                        >
                            <Plus className="w-6 h-6" />
                            New Campaign
                        </Link>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between min-h-[140px]">
                            <p className="text-base font-medium text-muted-foreground">Total Sent</p>
                            <h3 className="text-4xl font-extrabold text-foreground mt-2">
                                {campaigns.reduce((acc, c) => acc + c.sentCount, 0)}
                            </h3>
                        </div>
                        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between min-h-[140px]">
                            <p className="text-base font-medium text-muted-foreground">Delivered</p>
                            <h3 className="text-4xl font-extrabold text-foreground mt-2">
                                {campaigns.reduce((acc, c) => acc + c.deliveredCount, 0)}
                            </h3>
                        </div>
                        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between min-h-[140px]">
                            <p className="text-base font-medium text-muted-foreground">Pending</p>
                            <h3 className="text-4xl font-extrabold text-foreground mt-2">
                                {campaigns.filter(c => c.status === 'scheduled' || c.status === 'draft').length}
                            </h3>
                        </div>
                    </div>

                    {/* List */}
                    <div className="glass-card rounded-2xl overflow-hidden shadow-lg border border-border">
                        {loading ? (
                            <div className="p-12 text-center text-muted-foreground text-lg">Loading campaigns...</div>
                        ) : campaigns.length === 0 ? (
                            <div className="p-16 text-center">
                                <Megaphone className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-foreground mb-2">No campaigns yet</h3>
                                <p className="text-lg text-muted-foreground mb-8">Create your first campaign to reach your customers.</p>
                                <Link
                                    href="/campaigns/new"
                                    className="inline-flex items-center text-primary font-bold text-lg hover:underline decoration-2 underline-offset-4"
                                >
                                    Create one now &rarr;
                                </Link>
                            </div>
                        ) : (
                            <table className="w-full text-left text-base text-muted-foreground">
                                <thead className="bg-muted/30 border-b border-border/50 font-bold text-foreground">
                                    <tr>
                                        <th className="px-8 py-5">Name</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5">Sent / Delivered</th>
                                        <th className="px-8 py-5">Created Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {campaigns.map((c) => (
                                        <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-8 py-5 font-semibold text-foreground text-lg">{c.name}</td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${c.status === 'sent' ? 'bg-green-100 text-green-800' :
                                                    c.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 font-medium">
                                                {c.sentCount} / {c.deliveredCount}
                                            </td>
                                            <td className="px-8 py-5 text-muted-foreground">
                                                {new Date(c.createdAt).toLocaleDateString()}
                                                {c.scheduledAt && (
                                                    <div className="text-sm text-blue-600 flex items-center gap-2 mt-1 font-medium">
                                                        <Calendar className="w-4 h-4" />
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
