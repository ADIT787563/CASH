"use client";

import { useState, useEffect } from "react";
import { SettingsSection } from "./SettingsSection";
import { InputGroup } from "./InputGroup";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Clock, Bot, MessageSquare, Zap } from "lucide-react";

export function AIAutomation() {
    const [loading, setLoading] = useState(false);

    // Initial State - will be overwritten by fetch
    const [settings, setSettings] = useState({
        enabled: false,
        mode: "hybrid", // "templates_only" | "ai_only" | "hybrid"
        confidenceThreshold: 0.8,
        businessHoursEnabled: true,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings/ai");
                if (res.ok) {
                    const data = await res.json();
                    setSettings({
                        enabled: data.enabled,
                        mode: data.mode,
                        confidenceThreshold: data.confidenceThreshold,
                        businessHoursEnabled: data.businessHoursEnabled
                    });
                }
            } catch (error) {
                console.error("Failed to load AI settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/settings/ai", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });

            if (!res.ok) throw new Error("Failed to save");

            toast.success("AI settings updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update AI settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SettingsSection
            title="AI & Automation"
            description="Control how the AI interacts with your customers."
            onSave={handleSave}
            isSaving={loading}
        >
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800 mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${settings.enabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">AI Assistant</h3>
                        <p className="text-xs text-slate-500">Master switch for all AI replies</p>
                    </div>
                </div>
                <Switch checked={settings.enabled} onCheckedChange={(v) => setSettings({ ...settings, enabled: v })} />
            </div>

            <div className={`space-y-6 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>

                {/* Automation Mode */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Automation Mode</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { id: 'templates_only', label: 'Templates Only', icon: MessageSquare, desc: 'Only send pre-approved template messages' },
                            { id: 'hybrid', label: 'Hybrid (Recommended)', icon: Bot, desc: 'AI handles common queries, humans take over complex ones' },
                            { id: 'ai_only', label: 'Full Auto AI', icon: Zap, desc: 'AI attempts to answer everything' },
                        ].map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => setSettings({ ...settings, mode: mode.id })}
                                className={`text-left p-3 rounded-lg border transition-all ${settings.mode === mode.id
                                    ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                                    : 'bg-white hover:bg-slate-50 border-slate-200'
                                    }`}
                            >
                                <mode.icon className={`w-5 h-5 mb-2 ${settings.mode === mode.id ? 'text-indigo-600' : 'text-slate-500'}`} />
                                <div className="font-semibold text-sm mb-0.5">{mode.label}</div>
                                <div className="text-xs text-slate-500 leading-snug">{mode.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Confidence Threshold */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">AI Confidence Threshold</label>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">{Math.round(settings.confidenceThreshold * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        title="AI Confidence Threshold"
                        min="0.5"
                        max="1.0"
                        step="0.05"
                        value={settings.confidenceThreshold}
                        onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        AI will only reply if it is more than {Math.round(settings.confidenceThreshold * 100)}% sure. Otherwise, it will mark "Needs Human Review".
                    </p>
                </div>

                {/* Business Hours */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <h3 className="text-sm font-medium text-slate-900">Business Hours Only</h3>
                        </div>
                        <Switch checked={settings.businessHoursEnabled} onCheckedChange={(v) => setSettings({ ...settings, businessHoursEnabled: v })} />
                    </div>
                    <p className="text-xs text-slate-500">
                        If enabled, AI will only respond during your set business hours (9 AM - 6 PM). Outside hours, it will send an "Away" message.
                    </p>
                </div>
            </div>
        </SettingsSection>
    );
}
