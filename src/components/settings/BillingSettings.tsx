"use client";

import { useEffect, useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { Package, AlertTriangle, CheckCircle2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function BillingSettings() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function fetchBilling() {
            try {
                const res = await fetch('/api/billing/usage');
                if (res.ok) {
                    const jsonData = await res.json();
                    setData(jsonData);
                }
            } catch (error) {
                console.error("Failed to fetch billing:", error);
                toast.error("Failed to load billing info");
            } finally {
                setLoading(false);
            }
        }
        fetchBilling();
    }, []);

    if (loading) {
        return (
            <SettingsSection
                title="Billing & Usage"
                description="Monitor your plan limits and upgrade if necessary."
            >
                <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
            </SettingsSection>
        );
    }

    const { plan, usage, invoices } = data || {};

    return (
        <SettingsSection
            title="Billing & Usage"
            description="Monitor your plan limits and upgrade if necessary."
        >
            <div className="space-y-8">
                {/* Plan Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold mb-1">{plan?.name || "Free"} Plan</h3>
                            <p className="text-indigo-100 text-sm font-medium opacity-90">
                                {plan?.amount ? `₹${plan.amount} / month` : "Free Tier"}
                            </p>
                            <div className="mt-4 flex gap-2 text-xs font-medium text-indigo-100">
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> WhatsApp API</span>
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> AI Automation</span>
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Team Access</span>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-sm border border-white/10 ${plan?.status === 'active' ? 'bg-emerald-500/20 text-emerald-100' : 'bg-white/20'}`}>
                            {plan?.status || "Active"}
                        </span>
                    </div>
                    <div className="mt-6 flex gap-3 relative z-10">
                        <button className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm">
                            Manage Subscription
                        </button>
                    </div>
                    {/*bg pattern*/}
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                        <Package className="w-64 h-64" />
                    </div>
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "Conversations", ...usage?.conversations },
                        { label: "AI Replies", ...usage?.ai_replies },
                        { label: "Active Products", ...usage?.products }
                    ].map((metric: any) => {
                        const percent = metric.limit > 0 ? (metric.used / metric.limit) * 100 : 0;
                        const isCritical = percent > 80;
                        return (
                            <div key={metric.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{metric.label}</span>
                                    <span className={`font-mono font-bold ${isCritical ? 'text-rose-600' : 'text-slate-600'}`}>
                                        {metric.used}/{metric.limit}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.min(percent, 100)}%` }}
                                    />
                                </div>
                                {isCritical && (
                                    <p className="text-xs text-rose-500 mt-2 flex items-center gap-1 font-medium">
                                        <AlertTriangle className="w-3 h-3" /> Approaches Limit
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Recent Invoices */}
                {invoices && invoices.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Recent Invoices</h4>
                        <div className="space-y-2">
                            {invoices.map((inv: any) => (
                                <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-500">
                                            <Download className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Invoice #{inv.id.slice(0, 8)}</p>
                                            <p className="text-xs text-slate-500">{new Date(inv.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono">₹{(inv.amount / 100).toFixed(2)}</span>
                                        {inv.pdfUrl ? (
                                            <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs">Download</a>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Processing</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </SettingsSection>
    );
}
