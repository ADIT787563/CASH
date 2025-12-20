"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/hooks/useRole";
import { ActionButton } from "@/components/ui/ActionButton";
import { toast } from "sonner";
import {
    Activity,
    Bot,
    Clock,
    Save,
    Cpu,
    Zap,
    AlertCircle,
    MessageSquare,
    Play
} from "lucide-react";

// Simplified Visual Status Indicator
const StatusIndicator = ({ active, label }: { active: boolean, label: string }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${active
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-zinc-900 dark:border-white/20 dark:text-white dark:shadow-[0_0_15px_rgba(255,255,255,0.15)]'
        : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-500'
        }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 dark:bg-white dark:shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-slate-400 dark:bg-zinc-600'}`} />
        {label}
    </div>
);

export default function ChatbotPage() {
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const { isPending: roleLoading } = useRole();

    // Config State
    const [savedConfig, setSavedConfig] = useState<any>(null);
    const [config, setConfig] = useState({
        enabled: true,
        mode: 'hybrid' as 'off' | 'template' | 'hybrid',
        businessContext: "",
        tone: "professional" as "professional" | "friendly" | "neutral",
        handoverRule: "human, agent, help",
        confidenceThreshold: 0.85,
        businessHours: { start: "09:00", end: "18:00", enabled: false },
        responseDelay: 2,
        language: 'en',
        keywordTriggers: [] as { keyword: string, response: string }[]
    });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Simulation State
    const [simInput, setSimInput] = useState("");
    const [simOutput, setSimOutput] = useState<{
        response: string,
        meta: { confidence: number, source: 'AI' | 'TEMPLATE' | 'HANDOVER' | 'FALLBACK', latency: number }
    } | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/ai/config');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.config) {
                        const c = data.config;
                        const loadedConfig = {
                            enabled: c.enabled ?? true,
                            mode: (!c.enabled ? 'off' : (c.fallbackMode === 'hybrid' ? 'hybrid' : 'template')) as 'off' | 'template' | 'hybrid',
                            businessContext: c.businessContext || "",
                            tone: (c.tone || "professional") as "professional" | "friendly" | "neutral",
                            handoverRule: c.handoverRule || "human, agent, help",
                            confidenceThreshold: c.confidenceThreshold ? c.confidenceThreshold / 100 : 0.85,
                            businessHours: c.businessHoursConfig ?
                                (typeof c.businessHoursConfig === 'string' ? JSON.parse(c.businessHoursConfig) : c.businessHoursConfig)
                                : { start: "09:00", end: "18:00", enabled: false },
                            responseDelay: 2,
                            language: 'en',
                            keywordTriggers: c.keywordTriggers ?
                                (typeof c.keywordTriggers === 'string' ? JSON.parse(c.keywordTriggers) : c.keywordTriggers)
                                : []
                        };
                        setConfig(loadedConfig);
                        setSavedConfig(loadedConfig);
                    }
                }
            } catch (error) {
                console.error("Failed to load AI settings:", error);
                toast.error("Failed to load configuration");
            } finally {
                setInitializing(false);
            }
        };
        fetchConfig();
    }, []);

    // Change Detection
    useEffect(() => {
        if (!savedConfig) return;
        const isModified = JSON.stringify(config) !== JSON.stringify(savedConfig);
        setHasUnsavedChanges(isModified);
    }, [config, savedConfig]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const dbPayload = {
                ...config,
                enabled: config.mode !== 'off',
                fallbackMode: config.mode === 'hybrid' ? 'hybrid' : 'template',
                confidenceThreshold: config.confidenceThreshold,
                businessHours: config.businessHours,
                keywordTriggers: config.keywordTriggers
            };

            const res = await fetch('/api/ai/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbPayload)
            });

            if (res.ok) {
                toast.success("Configuration saved successfully");
                setSavedConfig(config);
                setHasUnsavedChanges(false);
            } else {
                toast.error("Failed to save changes");
            }
        } catch (error) {
            toast.error("Network error while saving");
        } finally {
            setLoading(false);
        }
    };

    const handleRevert = () => {
        if (savedConfig) {
            setConfig(savedConfig);
            toast.info("Changes reverted to last saved state");
        }
    };

    const runSimulation = () => {
        if (!simInput.trim()) return;
        setIsSimulating(true);

        setTimeout(() => {
            const isHandover = config.handoverRule.split(',').some(k => simInput.toLowerCase().includes(k.trim().toLowerCase()));
            const isTemplate = config.keywordTriggers.some(t => simInput.toLowerCase().includes(t.keyword.toLowerCase()));

            let source: any = 'AI';
            let response = "Based on your business context, here is a generated response...";

            if (config.mode === 'off') {
                source = 'FALLBACK';
                response = "(System inactive)";
            } else if (isHandover) {
                source = 'HANDOVER';
                response = "Transferring to human agent...";
            } else if (isTemplate) {
                source = 'TEMPLATE';
                response = config.keywordTriggers.find(t => simInput.toLowerCase().includes(t.keyword.toLowerCase()))?.response || "";
            } else if (config.mode === 'template') {
                source = 'FALLBACK';
                response = "I can only answer specific questions right now.";
            }

            setSimOutput({
                response,
                meta: {
                    confidence: source === 'AI' ? config.confidenceThreshold + (Math.random() * 0.1) : 1.0,
                    source,
                    latency: Math.floor(Math.random() * 500) + 200
                }
            });
            setIsSimulating(false);
        }, 800);
    };

    if (roleLoading || initializing) return (
        <div className="flex h-screen items-center justify-center bg-white dark:bg-black text-slate-500 text-sm font-mono animate-pulse">
            INITIALIZING_NEURAL_CORE...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black pb-32 text-slate-900 dark:text-zinc-100">
            {/* 1. MINIMAL HEADER */}
            <header className="bg-white dark:bg-black/50 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-6 py-6 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Cpu className="w-6 h-6 text-slate-900 dark:text-white dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                            <span className="tracking-tight">AI Control</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusIndicator active={config.mode !== 'off'} label={config.mode !== 'off' ? 'ONLINE' : 'OFFLINE'} />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT: CONFIGURATION */}
                    <div className="flex-1 space-y-10">

                        {/* MODE SELECTOR */}
                        <section>
                            <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest pl-1">Operating Mode</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'off', label: 'System Off', icon: Zap, desc: 'No automated replies' },
                                    { id: 'template', label: 'Templates Only', icon: MessageSquare, desc: 'Strict keyword matching' },
                                    { id: 'hybrid', label: 'AI Hybrid', icon: Bot, desc: 'AI + Human Handover' }
                                ].map((mode) => {
                                    const isSelected = config.mode === mode.id;
                                    const Icon = mode.icon;
                                    return (
                                        <button
                                            key={mode.id}
                                            onClick={() => setConfig({ ...config, mode: mode.id as any })}
                                            className={`
                                                relative p-5 rounded-xl border text-left transition-all duration-300 group
                                                ${isSelected
                                                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-zinc-900 dark:border-white/40 dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                                    : 'bg-white border-slate-200 text-slate-600 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-500 hover:border-slate-300 dark:hover:border-zinc-700'
                                                }
                                            `}
                                        >
                                            <Icon className={`w-5 h-5 mb-3 ${isSelected ? 'text-white dark:text-white dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'text-slate-400'}`} />
                                            <div className="font-bold text-sm mb-1">{mode.label}</div>
                                            <div className={`text-xs ${isSelected ? 'text-slate-300 dark:text-zinc-400' : 'text-slate-400'}`}>{mode.desc}</div>
                                        </button>
                                    )
                                })}
                            </div>
                        </section>

                        {/* ADVANCED SETTINGS */}
                        <section className="bg-white dark:bg-zinc-900/30 p-6 rounded-2xl border border-slate-200 dark:border-white/10 dark:backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Behavior Control
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Auto-Reply Confidence */}
                                <div>
                                    <div className="flex justify-between mb-3">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Confidence Threshold</label>
                                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{Math.round(config.confidenceThreshold * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5" max="1.0" step="0.01"
                                        value={config.confidenceThreshold}
                                        onChange={(e) => setConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900 dark:[&::-webkit-slider-thumb]:bg-white dark:[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                        AI will only reply if it is <span className="text-slate-900 dark:text-white font-semibold">{Math.round(config.confidenceThreshold * 100)}%</span> sure. Otherwise, it flags for human review.
                                    </p>
                                </div>

                                {/* Business Hours */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-3">Availability</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setConfig({ ...config, businessHours: { ...config.businessHours, enabled: false } })}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!config.businessHours.enabled
                                                ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                                                : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-500'}`}
                                        >
                                            24/7
                                        </button>
                                        <button
                                            onClick={() => setConfig({ ...config, businessHours: { ...config.businessHours, enabled: true } })}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${config.businessHours.enabled
                                                ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                                                : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-500'}`}
                                        >
                                            Business Hours
                                        </button>
                                    </div>
                                    {config.businessHours.enabled && (
                                        <div className="mt-3 text-xs text-slate-500 font-mono">
                                            Active: {config.businessHours.start} - {config.businessHours.end}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-3">Human Handover Keywords</label>
                                <input
                                    type="text"
                                    value={config.handoverRule}
                                    onChange={(e) => setConfig({ ...config, handoverRule: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white/50 transition-all font-mono"
                                    placeholder="human, support, agent..."
                                />
                            </div>
                        </section>
                    </div>

                    {/* RIGHT: LIVE SIMULATION */}
                    <div className="w-full lg:w-[400px]">
                        <div className="sticky top-28">
                            <div className="bg-slate-900 dark:bg-black rounded-2xl overflow-hidden border border-slate-800 dark:border-white/10 shadow-2xl shadow-slate-900/20 dark:shadow-white/5 flex flex-col h-[600px]">

                                {/* Sim Header */}
                                <div className="px-5 py-4 border-b border-white/5 bg-white/5 backdrop-blur-sm flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgb(16_185_129)]" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Simulator</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-500">{config.mode === 'off' ? 'OFFLINE' : 'GPT-4o ACTIVE'}</span>
                                </div>

                                {/* Chat Area */}
                                <div className="flex-1 p-5 overflow-y-auto space-y-6 font-mono text-xs scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                    <div className="flex flex-col gap-1 items-end">
                                        <span className="text-[10px] text-zinc-500 uppercase">You</span>
                                        <div className="bg-white/10 text-white px-3 py-2 rounded-lg rounded-tr-none max-w-[85%]">
                                            {simInput || <span className="italic opacity-30">Type a message...</span>}
                                        </div>
                                    </div>

                                    {simOutput && (
                                        <div className="flex flex-col gap-1 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-2">
                                                AI Assistant
                                                <span className={`px-1 rounded text-[8px] ${simOutput.meta.confidence > config.confidenceThreshold ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                    {Math.round(simOutput.meta.confidence * 100)}%
                                                </span>
                                            </span>
                                            <div className="bg-white text-black dark:bg-white dark:text-black dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] px-3 py-2 rounded-lg rounded-tl-none max-w-[90%]">
                                                {simOutput.response}
                                            </div>
                                            <div className="text-[9px] text-zinc-600 mt-1 flex gap-2">
                                                <span>Source: {simOutput.meta.source}</span>
                                                <span>•</span>
                                                <span>{simOutput.meta.latency}ms</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="p-4 border-t border-white/10 bg-black/40">
                                    <form onSubmit={(e) => { e.preventDefault(); runSimulation(); }} className="relative">
                                        <input
                                            value={simInput}
                                            onChange={(e) => setSimInput(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-12 py-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-mono"
                                            placeholder="Test the bot..."
                                        />
                                        <button
                                            type="submit"
                                            disabled={!simInput.trim() || isSimulating}
                                            className="absolute right-1.5 top-1.5 p-1.5 bg-white text-black rounded-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            <Play className="w-3 h-3 fill-current" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* FLOATING SAVE BAR */}
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${hasUnsavedChanges ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <div className="bg-slate-900 text-white dark:bg-white dark:text-black pl-5 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-6 border border-white/10 dark:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-sm font-bold tracking-tight">Unsaved Changes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRevert}
                            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white dark:text-zinc-500 dark:hover:text-black transition-colors"
                        >
                            Discard
                        </button>
                        <ActionButton
                            onAction={handleSave}
                            isLoading={loading}
                            className="bg-white text-black hover:bg-slate-200 dark:bg-black dark:text-white dark:hover:bg-zinc-800 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all"
                        >
                            Save Updates
                        </ActionButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
