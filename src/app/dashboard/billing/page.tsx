"use client";

import { CreditCard, Download, CheckCircle, Clock, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function BillingPage() {

    // Mock Data for Phase 2 Implementation
    const stats = {
        totalReceived: "₹45,200",
        pendingPayments: "₹2,400",
        codPending: "₹1,850",
        lastPayout: "Dec 21, 2024"
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Payments & Payouts</h1>
                    <p className="text-sm text-white/50 mt-1">Track your revenue and pending settlements.</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <CreditCard className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Confirmed
                        </span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-white/60 text-sm font-medium">Total Received</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{stats.totalReceived}</h3>
                    </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <Clock className="w-6 h-6 text-amber-400" />
                        </div>
                    </div>
                    <div>
                        <p className="text-white/60 text-sm font-medium">Pending Output</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{stats.pendingPayments}</h3>
                    </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <ShoppingBag className="w-6 h-6 text-orange-400" />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Crucial</span>
                    </div>
                    <div>
                        <p className="text-white/60 text-sm font-medium">COD Pending</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{stats.codPending}</h3>
                        <p className="text-xs text-white/40 mt-1">Usually settles in 2-3 days</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <p className="text-white/60 text-sm font-medium">Last Payout</p>
                        <h3 className="text-xl font-bold text-white mt-1">{stats.lastPayout}</h3>
                        <p className="text-xs text-emerald-400 mt-1">Processed successfully</p>
                    </div>
                </div>
            </div>

            {/* Placeholder for Recent Transactions */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-white/40">
                <p>Transaction history will appear here.</p>
            </div>
        </div>
    );
}
