"use client";

import { SettingsSection } from "./SettingsSection";
import { Package, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ActionButton } from "@/components/ui/ActionButton";

export function BillingSettings() {
    // Mock Usage
    const usage = {
        conversations: { used: 850, limit: 1000 },
        products: { used: 12, limit: 50 },
        ai_replies: { used: 4500, limit: 5000 }
    };

    return (
        <SettingsSection
            title="Billing & Usage"
            description="Monitor your plan limits and upgrade if necessary."
            onSave={() => { }} // No save needed for this view
        >
            <div className="space-y-6">
                {/* Plan Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Pro Plan</h3>
                            <p className="text-indigo-100 text-sm font-medium opacity-90">₹2,999 / month</p>
                            <div className="mt-4 flex gap-2 text-xs font-medium text-indigo-100">
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> WhatsApp API</span>
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> AI Automation</span>
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Team Access</span>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase backdrop-blur-sm border border-white/10">Active</span>
                    </div>
                    <div className="mt-6 flex gap-3 relative z-10">
                        <button className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm">Manage Subscription</button>
                        <button className="bg-indigo-700/50 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700/70 transition-colors">Download Invoices</button>
                    </div>
                    {/*bg pattern*/}
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                        <Package className="w-64 h-64" />
                    </div>
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "Conversations", ...usage.conversations },
                        { label: "AI Replies", ...usage.ai_replies },
                        { label: "Active Products", ...usage.products }
                    ].map(metric => {
                        const percent = (metric.used / metric.limit) * 100;
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
                                        style={{ width: `${percent}%` }}
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
            </div>
        </SettingsSection>
    );
}
