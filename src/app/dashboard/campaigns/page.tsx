"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Megaphone, Calendar, Users, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch("/api/campaigns");
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data);
            }
        } catch (error) {
            console.error("Failed to fetch campaigns", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Campaigns</h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Manage and track your marketing broadcasts.
                    </p>
                </div>
                <Link href="/dashboard/campaigns/new">
                    <Button className="bg-white text-black hover:bg-zinc-200">
                        <Plus className="w-4 h-4 mr-2" /> New Campaign
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            ) : campaigns.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Megaphone className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Campaigns Yet</h3>
                    <p className="text-zinc-400 max-w-md mx-auto mb-8">
                        Create your first broadcast campaign to reach thousands of customers on WhatsApp instantly.
                    </p>
                    <Link href="/dashboard/campaigns/new">
                        <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                            Create Campaign
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {campaigns.map((campaign) => (
                        <div key={campaign.id} className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all group">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-white">{campaign.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${campaign.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                                campaign.status === 'sending' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-white/10 text-zinc-400'
                                            }`}>
                                            {campaign.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-zinc-500">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(campaign.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4" />
                                            {campaign.targetCount || 0} Recipients
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-2xl font-bold text-white">{campaign.readCount || 0}</p>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wide">Read By</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-2xl font-bold text-white">{
                                            campaign.sentCount > 0
                                                ? Math.round(((campaign.readCount || 0) / campaign.sentCount) * 100)
                                                : 0
                                        }%</p>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wide">Click Rate</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-zinc-400 group-hover:text-white">
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-1000"
                                    style={{ width: `${Math.min(100, ((campaign.sentCount || 0) / (campaign.targetCount || 1)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
