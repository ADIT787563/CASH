"use client";

import { useState, useEffect } from "react";
import { SettingsSection } from "./SettingsSection";
import { InputGroup } from "./InputGroup";
import { ActionButton } from "@/components/ui/ActionButton";
import { CheckCircle2, Zap, Lock, Globe, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

export function WhatsAppSettings() {
    const [loading, setLoading] = useState(false); // For Save
    const [webhookStatus, setWebhookStatus] = useState<"IDLE" | "TESTING" | "SUCCESS" | "FAILED">("IDLE");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        // Fetch current phone number for share link
        fetch("/api/business-settings")
            .then(res => res.json())
            .then(data => {
                if (data.whatsappNumber) setPhone(data.whatsappNumber);
            })
            .catch(console.error);
    }, []);

    const handleSave = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000)); // Mock save
        toast.success("WhatsApp settings saved");
        setLoading(false);
    };

    const handleWebhookTest = async () => {
        setWebhookStatus("TESTING");
        // Mock webhook test
        await new Promise(r => setTimeout(r, 1500));
        setWebhookStatus("SUCCESS");
        toast.success("Webhook verified successfully", { description: "Payload received at endpoint." });
    };

    return (
        <SettingsSection
            title="WhatsApp & Channels"
            description="Manage your connection health. To change number, please contact support."
            onSave={handleSave}
            isSaving={loading}
        >
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">API Connected</p>
                        <p className="text-xs text-slate-500">Latency: 45ms • Cloud API v18.0</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md transition-colors font-medium">
                        View Logs
                    </button>
                    <button className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md transition-colors font-medium flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Reconnect
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Configuration</h3>
                    <div className="space-y-4">
                        <InputGroup label="Phone Number ID" value="113466273849505" disabled helpVar="Fixed ID from Meta" />
                        <InputGroup label="WhatsApp Business Account ID" value="229384756102938" disabled helpVar="Fixed ID from Meta" />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Webhook Settings</h3>
                    <div className="space-y-4">
                        <InputGroup label="Webhook URL" value="https://api.wavegroww.com/webhooks/whatsapp" disabled />
                        <div className="flex items-end justify-between gap-4">
                            <div className="flex-1">
                                <InputGroup label="Verify Token" type="password" value="••••••••••••••••" disabled />
                            </div>
                            <ActionButton
                                onClick={handleWebhookTest}
                                isLoading={webhookStatus === "TESTING"}
                                icon={webhookStatus === "SUCCESS" ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                className={webhookStatus === "SUCCESS" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                            >
                                {webhookStatus === "SUCCESS" ? "Verified" : "Test Webhook"}
                            </ActionButton>
                        </div>
                    </div>
                </div>

                {/* Shareable Link Section */}
                {phone && (
                    <div className="bg-indigo-50 dark:bg-slate-800 p-4 rounded-lg mt-6 border border-indigo-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Share Your WhatsApp Link
                        </h3>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-white dark:bg-slate-950 px-3 py-2 rounded border border-indigo-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 font-mono truncate">
                                https://wa.me/{phone.replace(/[^0-9]/g, '')}
                            </div>
                            <button
                                onClick={() => {
                                    const link = `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;
                                    navigator.clipboard.writeText(link);
                                    toast.success("Link copied to clipboard!");
                                }}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </SettingsSection>
    );
}
