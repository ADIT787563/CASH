"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/hooks/useRole";
import { ActionButton } from "@/components/ui/ActionButton";
import { toast } from "sonner";
import {
    Settings2,
    Save,
    Zap,
    Clock,
    AlertTriangle,
    Bot,
    Play,
    History,
    Lock,
    Key,
    Plus,
    X,
    MessageSquare,
    AlertCircle
} from "lucide-react";
import { findBestTriggerMatch, detectConflicts } from "@/lib/trigger-resolver";

export default function ChatbotPage() {
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const { checkPermission, isPending: roleLoading } = useRole();
    const [activeTab, setActiveTab] = useState<'config' | 'triggers'>('config');

    // Configuration State
    const [config, setConfig] = useState({
        enabled: true,
        businessContext: "",
        tone: "friendly" as const,
        handoverRule: "",
        confidenceThreshold: 0.85,
        businessHours: { start: "09:00", end: "18:00", enabled: false },
        fallbackMode: "template" as "template" | "human" | "hybrid",
        fallbackMessage: "I'm sorry, I couldn't find a specific answer to that. A team member will get back to you soon!",
        keywordTriggers: [] as { keyword: string, response: string }[]
    });

    const [userInput, setUserInput] = useState("");
    const [chatLog, setChatLog] = useState<{ role: 'user' | 'bot' | 'system', content: string, meta?: string }[]>([]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/ai/config');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.config) {
                        const c = data.config;
                        setConfig(prev => ({
                            ...prev,
                            enabled: c.enabled ?? prev.enabled,
                            businessContext: c.businessContext || prev.businessContext,
                            tone: c.tone || prev.tone,
                            handoverRule: c.handoverRule || prev.handoverRule,
                            confidenceThreshold: c.confidenceThreshold ? c.confidenceThreshold / 100 : prev.confidenceThreshold,
                            businessHours: c.businessHoursConfig ?
                                (typeof c.businessHoursConfig === 'string' ? JSON.parse(c.businessHoursConfig) : c.businessHoursConfig)
                                : prev.businessHours,
                            fallbackMode: c.fallbackMode || prev.fallbackMode,
                            fallbackMessage: c.fallbackMessage || prev.fallbackMessage,
                            keywordTriggers: c.keywordTriggers ?
                                (typeof c.keywordTriggers === 'string' ? JSON.parse(c.keywordTriggers) : c.keywordTriggers)
                                : prev.keywordTriggers
                        }));
                    }
                    if (data && data.history) {
                        setHistory(data.history);
                    }
                    if (data && data.products) {
                        setProducts(data.products);
                    }
                }
            } catch (error) {
                console.error("Failed to load AI settings:", error);
            }
        };
        fetchConfig();
    }, []);

    const validateConfig = () => {
        if (!config.businessContext || config.businessContext.length < 20) {
            toast.error("Business Context is too short. AI needs more info.");
            return false;
        }
        return true;
    };

    const handleRollback = (snapshot: any) => {
        if (!checkPermission('manage:chatbot')) return;

        setConfig({
            ...config,
            enabled: snapshot.enabled ?? config.enabled,
            businessContext: snapshot.businessContext || config.businessContext,
            tone: snapshot.tone || config.tone,
            handoverRule: snapshot.handoverRule || config.handoverRule,
            confidenceThreshold: snapshot.confidenceThreshold ? snapshot.confidenceThreshold / 100 : config.confidenceThreshold,
            businessHours: snapshot.businessHoursConfig ?
                (typeof snapshot.businessHoursConfig === 'string' ? JSON.parse(snapshot.businessHoursConfig) : snapshot.businessHoursConfig)
                : config.businessHours,
            fallbackMode: snapshot.fallbackMode || config.fallbackMode,
            fallbackMessage: snapshot.fallbackMessage || config.fallbackMessage
        });
        toast.info("Snapshot loaded. Click 'Save' to apply rollback.");
    };

    const handleSave = async () => {
        if (!validateConfig()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/ai/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                toast.success("Rules saved successfully");
                // Refresh history
                const hRes = await fetch('/api/ai/config');
                const hData = await hRes.json();
                if (hData.history) setHistory(hData.history);
            }
        } catch (error) {
            toast.error("Failed to save configuration.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAI = () => {
        if (!checkPermission('manage:chatbot')) return;
        setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
    };

    const handleTestMessage = () => {
        if (!userInput.trim()) return;

        const currentInput = userInput;
        setUserInput("");
        setChatLog(prev => [...prev, { role: "user", content: currentInput }]);
        setTesting(true);

        setTimeout(() => {
            const isFallback = config.handoverRule && currentInput.toLowerCase().includes(config.handoverRule.toLowerCase());
            const confidenceLow = Math.random() < (1 - config.confidenceThreshold);

            let response = "";

            // AG-502: Check for keyword triggers first
            const bestTriggerMatch = findBestTriggerMatch(currentInput, config.keywordTriggers);

            if (bestTriggerMatch) {
                response = bestTriggerMatch;
            } else if (isFallback || confidenceLow) {
                if (config.fallbackMode === "human") {
                    response = "Transferring you to a human agent...";
                } else if (config.fallbackMode === "hybrid") {
                    response = `${config.fallbackMessage}\n\n(Queueing for human support...)`;
                } else {
                    response = config.fallbackMessage;
                }
            } else {
                // Check if user is asking about a specific product in stock
                const mentionedProduct = products.find(p =>
                    currentInput.toLowerCase().includes(p.name.toLowerCase())
                );

                if (mentionedProduct) {
                    if (mentionedProduct.stock > 0) {
                        response = `(AI • ${config.tone}): Yes! We have ${mentionedProduct.name} in stock for ₹${mentionedProduct.price}. Shall I add it to your order? ✨🛍️`;
                    } else {
                        response = `(AI • ${config.tone}): I'm sorry, but ${mentionedProduct.name} is currently out of stock. 😔 Would you like to see our other available items?`;
                    }
                } else {
                    response = `(AI • ${config.tone}): Based on your context, I can help with that! [Simulated Response]`;
                }
            }

            setChatLog(prev => [...prev, {
                role: "bot",
                content: response,
                meta: (isFallback || confidenceLow) ? "FALLBACK" : "AI_REPLY"
            }]);
            setTesting(false);
        }, 800);
    };

    if (roleLoading) return <div className="p-8 text-center text-slate-500">Loading permissions...</div>;

    return (
        <div className="h-[calc(100vh-6rem)] flex gap-6 overflow-hidden">
            {/* LEFT PANEL: CONFIGURATION */}
            <div className="w-1/2 flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-indigo-500" />
                            Configuration
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">AI behavior & rules.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ActionButton
                            icon={checkPermission("manage:chatbot") ? <Save className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            onAction={handleSave}
                            isLoading={loading}
                            disabled={!checkPermission("manage:chatbot")}
                            title="Save chatbot configuration"
                        >
                            Save
                        </ActionButton>
                        <button
                            onClick={handleToggleAI}
                            disabled={!checkPermission("manage:chatbot")}
                            title={config.enabled ? "Disable AI Chatbot" : "Enable AI Chatbot"}
                            className={`w-10 h-5 rounded-full transition-colors relative border ${config.enabled ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-200 border-slate-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${config.enabled ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Business Knowledge</label>
                        <textarea
                            value={config.businessContext}
                            onChange={(e) => setConfig({ ...config, businessContext: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Tell AI about your store..."
                        />
                    </div>

                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('config')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest ${activeTab === 'config' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-400'}`}
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('triggers')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${activeTab === 'triggers' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-400'}`}
                        >
                            Keywords
                            {detectConflicts(config.keywordTriggers).length > 0 && (
                                <span className="w-2 h-2 bg-rose-500 rounded-full" />
                            )}
                        </button>
                    </div>

                    {activeTab === 'config' ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Tone</label>
                                    <select
                                        value={config.tone}
                                        onChange={(e) => setConfig({ ...config, tone: e.target.value as any })}
                                        title="Select AI Chatbot tone"
                                        className="w-full p-2 border border-slate-200 rounded-md text-sm dark:bg-slate-900"
                                    >
                                        <option value="friendly">Friendly</option>
                                        <option value="professional">Professional</option>
                                        <option value="casual">Casual</option>
                                        <option value="formal">Formal</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Confidence ({Math.round(config.confidenceThreshold * 100)}%)</label>
                                    <input
                                        type="range" min="0.5" max="1" step="0.05"
                                        value={config.confidenceThreshold}
                                        onChange={(e) => setConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) })}
                                        className="w-full accent-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Handover Keywords</label>
                                <input
                                    value={config.handoverRule}
                                    onChange={(e) => setConfig({ ...config, handoverRule: e.target.value })}
                                    className="w-full p-2 border border-slate-200 rounded-md text-sm dark:bg-slate-900"
                                    placeholder="human, agent, help"
                                />
                            </div>

                            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 space-y-3">
                                <h4 className="text-xs font-bold text-orange-800 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" /> Fallback Mode
                                </h4>
                                <div className="flex gap-2">
                                    {['template', 'human', 'hybrid'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setConfig({ ...config, fallbackMode: m as any })}
                                            className={`px-3 py-1 text-[10px] font-bold border rounded-full transition-colors ${config.fallbackMode === m ? 'bg-orange-200 border-orange-400 text-orange-800' : 'bg-white text-slate-500 border-slate-200'}`}
                                        >
                                            {m.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={config.fallbackMessage}
                                    onChange={(e) => setConfig({ ...config, fallbackMessage: e.target.value })}
                                    className="w-full p-2 text-xs border border-orange-100 rounded bg-white/50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-300"
                                    placeholder="Enter fallback message..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-700">Keyword Automations</h3>
                                <button
                                    onClick={() => setConfig({ ...config, keywordTriggers: [...config.keywordTriggers, { keyword: "", response: "" }] })}
                                    className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:text-indigo-700"
                                >
                                    <Plus className="w-3 h-3" /> ADD TRIGGER
                                </button>
                            </div>

                            {/* AG-504: Conflict Messages */}
                            {detectConflicts(config.keywordTriggers).length > 0 && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                                    <h4 className="text-[10px] font-bold text-rose-800 uppercase flex items-center gap-2">
                                        <AlertCircle className="w-3 h-3" /> Conflict Detected
                                    </h4>
                                    {detectConflicts(config.keywordTriggers).map((conf, i) => (
                                        <p key={i} className="text-[10px] text-rose-600 leading-tight">
                                            • {conf.message}
                                        </p>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-4">
                                {config.keywordTriggers.map((trigger, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg relative group">
                                        <button
                                            onClick={() => {
                                                const newTriggers = [...config.keywordTriggers];
                                                newTriggers.splice(idx, 1);
                                                setConfig({ ...config, keywordTriggers: newTriggers });
                                            }}
                                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Trigger Keyword</label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Key className="w-3.5 h-3.5 text-slate-400" />
                                                    <input
                                                        value={trigger.keyword}
                                                        onChange={(e) => {
                                                            const newTriggers = [...config.keywordTriggers];
                                                            newTriggers[idx].keyword = e.target.value;
                                                            setConfig({ ...config, keywordTriggers: newTriggers });
                                                        }}
                                                        className="flex-1 bg-transparent border-none p-0 text-sm font-medium focus:ring-0"
                                                        placeholder="e.g. price, shipping, help"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Auto Response</label>
                                                <div className="flex gap-2 mt-1">
                                                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-1 flex-shrink-0" />
                                                    <textarea
                                                        value={trigger.response}
                                                        onChange={(e) => {
                                                            const newTriggers = [...config.keywordTriggers];
                                                            newTriggers[idx].response = e.target.value;
                                                            setConfig({ ...config, keywordTriggers: newTriggers });
                                                        }}
                                                        rows={2}
                                                        className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0 resize-none leading-relaxed"
                                                        placeholder="What should the bot say?"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {config.keywordTriggers.length === 0 && (
                                    <div className="text-center py-8 text-slate-400 space-y-2">
                                        <Zap className="w-8 h-8 mx-auto opacity-20" />
                                        <p className="text-xs">No keyword triggers yet. Add one to automate common questions!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {history.length > 0 && (
                        <div className="pt-4 border-t">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2 mb-3">
                                <History className="w-3 h-3" /> History
                            </h4>
                            <div className="space-y-2">
                                {history.map(rev => (
                                    <div key={rev.id} className="p-2 border rounded-md flex justify-between items-center bg-slate-50 dark:bg-slate-900 text-[10px]">
                                        <span>{new Date(rev.createdAt).toLocaleString()}</span>
                                        <button
                                            onClick={() => handleRollback(rev.configSnapshot)}
                                            title="Restore this version"
                                            className="text-indigo-600 font-bold hover:underline"
                                        >
                                            RESTORE
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: SIMULATOR */}
            <div className="w-1/2 flex flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center text-white">
                    <span className="text-xs font-bold uppercase tracking-widest">Simulator</span>
                    <button onClick={() => setChatLog([])} className="text-[10px] opacity-60 hover:opacity-100">Clear</button>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {chatLog.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-100'}`}>
                                {msg.content}
                                {msg.meta && <div className="mt-1 text-[8px] font-bold opacity-50 uppercase">{msg.meta}</div>}
                            </div>
                        </div>
                    ))}
                    {testing && <div className="text-slate-500 text-[10px] animate-pulse">AI is thinking...</div>}
                </div>
                <div className="p-4 bg-slate-800/50">
                    <div className="flex gap-2">
                        <input
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTestMessage()}
                            className="flex-1 bg-slate-950 text-white border-slate-700 p-2 text-sm rounded-md"
                            placeholder="Test message..."
                        />
                        <button onClick={handleTestMessage} title="Send test message" className="bg-indigo-600 text-white px-4 rounded-md text-sm font-bold">SEND</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
