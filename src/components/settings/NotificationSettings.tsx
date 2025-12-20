"use client";

import { useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Mail, Smartphone, Bell, AlertTriangle, CheckCircle2 } from "lucide-react";

export function NotificationSettings() {
    const [loading, setLoading] = useState(false);

    const [prefs, setPrefs] = useState({
        usageAlerts: { email: true, whatsapp: true, inApp: true },
        paymentFailures: { email: true, whatsapp: true, inApp: true },
        aiFallbacks: { email: false, whatsapp: true, inApp: true }, // Urgent
        marketing: { email: true, whatsapp: false, inApp: false }
    });

    const handleSave = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        toast.success("Notification preferences saved");
        setLoading(false);
    };

    const ToggleRow = ({ label, icon: Icon, value, onChange }: any) => (
        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-medium text-sm text-slate-900 dark:text-white">{label}</h4>
                    <p className="text-xs text-slate-500">Configure channels</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-medium">EMAIL</span>
                    <Switch checked={value.email} onCheckedChange={(v) => onChange({ ...value, email: v })} />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-medium">WHATSAPP</span>
                    <Switch checked={value.whatsapp} onCheckedChange={(v) => onChange({ ...value, whatsapp: v })} />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-medium">IN-APP</span>
                    <Switch checked={value.inApp} onCheckedChange={(v) => onChange({ ...value, inApp: v })} />
                </div>
            </div>
        </div>
    );

    return (
        <SettingsSection
            title="Notifications"
            description="Control how you receive alerts and updates."
            onSave={handleSave}
            isSaving={loading}
        >
            <div className="space-y-2">
                <ToggleRow
                    label="Usage Limit Warnings"
                    icon={AlertTriangle}
                    value={prefs.usageAlerts}
                    onChange={(v: any) => setPrefs({ ...prefs, usageAlerts: v })}
                />
                <ToggleRow
                    label="Payment Failures"
                    icon={AlertTriangle}
                    value={prefs.paymentFailures}
                    onChange={(v: any) => setPrefs({ ...prefs, paymentFailures: v })}
                />
                <ToggleRow
                    label="AI Handover Requests"
                    icon={Smartphone}
                    value={prefs.aiFallbacks}
                    onChange={(v: any) => setPrefs({ ...prefs, aiFallbacks: v })}
                />
                <ToggleRow
                    label="System Updates & Offers"
                    icon={Bell}
                    value={prefs.marketing}
                    onChange={(v: any) => setPrefs({ ...prefs, marketing: v })}
                />
            </div>
        </SettingsSection>
    );
}
