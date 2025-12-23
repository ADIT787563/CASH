"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Send, Users, FileText, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

export default function NewCampaignPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [audience, setAudience] = useState("all");
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        // Fetch templates
        const fetchTemplates = async () => {
            try {
                const res = await fetch("/api/templates?status=approved");
                if (res.ok) {
                    const data = await res.json();
                    setTemplates(data);
                }
            } catch (error) {
                console.error("Failed to load templates", error);
            }
        };
        fetchTemplates();
    }, []);

    const handleLaunch = async () => {
        if (!name || !selectedTemplate) {
            toast.error("Please complete all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    templateId: selectedTemplate.id,
                    audienceConfig: { type: audience },
                    status: "sending" // Auto-start for now
                })
            });

            if (res.ok) {
                const data = await res.json();
                toast.success("Campaign launched successfully!");

                // Trigger sending logic
                await fetch(`/api/campaigns/${data.id}/send`, { method: "POST" });

                router.push("/dashboard/campaigns");
            } else {
                toast.error("Failed to create campaign");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
                <Link href="/dashboard/campaigns" className="text-zinc-400 hover:text-white text-sm flex items-center gap-1 mb-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Campaigns
                </Link>
                <h1 className="text-3xl font-bold text-white">New Campaign</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Steps Sidebar */}
                <div className="hidden lg:block space-y-1">
                    {[
                        { id: 1, label: "Details & Audience", icon: Users },
                        { id: 2, label: "Select Content", icon: FileText },
                        { id: 3, label: "Review & Launch", icon: Send },
                    ].map((s) => (
                        <div
                            key={s.id}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${step === s.id
                                ? "bg-indigo-500/10 border-indigo-500/50 text-white"
                                : step > s.id
                                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                    : "bg-transparent border-transparent text-zinc-500"
                                }`}
                        >
                            {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                            <span className="font-medium text-sm">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {step === 1 && (
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-white">Campaign Name</Label>
                                <Input
                                    placeholder="e.g. Diwali Sale Blast"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-white">Target Audience</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setAudience("all")}
                                        className={`cursor-pointer p-4 rounded-xl border transition-all ${audience === "all"
                                            ? "bg-indigo-500/10 border-indigo-500 text-white"
                                            : "bg-black/20 border-white/10 text-zinc-400 hover:border-white/20"
                                            }`}
                                    >
                                        <Users className="w-6 h-6 mb-2" />
                                        <p className="font-bold text-sm">All Leads</p>
                                        <p className="text-xs opacity-60">Send to everyone in your contact list</p>
                                    </div>
                                    <div
                                        onClick={() => setAudience("tags")}
                                        className={`cursor-pointer p-4 rounded-xl border transition-all ${audience === "tags"
                                            ? "bg-indigo-500/10 border-indigo-500 text-white"
                                            : "bg-black/20 border-white/10 text-zinc-400 hover:border-white/20"
                                            }`}
                                    >
                                        <FileText className="w-6 h-6 mb-2" />
                                        <p className="font-bold text-sm">Filter by Tags</p>
                                        <p className="text-xs opacity-60">Select specific segments (VIP, New, etc.)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={() => setStep(2)} disabled={!name}>
                                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-white">Select Message Template</Label>
                                {templates.length > 0 ? (
                                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                                        {templates.map((t) => (
                                            <div
                                                key={t.id}
                                                onClick={() => setSelectedTemplate(t)}
                                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTemplate?.id === t.id
                                                    ? "bg-indigo-500/10 border-indigo-500 text-white"
                                                    : "bg-black/20 border-white/10 text-zinc-400 hover:border-white/20"
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-sm">{t.name}</h4>
                                                    <span className="text-[10px] uppercase bg-white/10 px-1.5 py-0.5 rounded">{t.category}</span>
                                                </div>
                                                <p className="text-xs line-clamp-2 opacity-70">{t.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-8 border border-dashed border-white/10 rounded-lg">
                                        <p className="text-zinc-500 text-sm mb-4">No approved templates found.</p>
                                        <Link href="/dashboard/templates">
                                            <Button variant="outline" size="sm">Manage Templates</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={() => setStep(1)} className="text-zinc-400">Back</Button>
                                <Button onClick={() => setStep(3)} disabled={!selectedTemplate}>
                                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white mb-4">Review Summary</h3>

                                <div className="grid gap-4">
                                    <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-sm text-zinc-400">Name</span>
                                        <span className="text-sm font-medium text-white">{name}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-sm text-zinc-400">Audience</span>
                                        <span className="text-sm font-medium text-white capitalize">{audience === 'all' ? 'Everyone' : 'Tagged Users'}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-sm text-zinc-400">Template</span>
                                        <span className="text-sm font-medium text-white">{selectedTemplate?.name}</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3 text-amber-200 text-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p>Messages will be sent immediately after launch. Verify your template variables before proceeding.</p>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={() => setStep(2)} className="text-zinc-400">Back</Button>
                                <Button
                                    onClick={handleLaunch}
                                    disabled={loading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {loading ? "Launching..." : "Launch Campaign"}
                                    {!loading && <Send className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
