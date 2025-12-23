"use client";

import { useEffect, useState } from "react";
import { Copy, Check, MessageSquare, ShoppingBag, Truck, CreditCard, Sparkles, AlertCircle, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ActionButton } from "@/components/ui/ActionButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Template {
    id: number;
    name: string;
    content: string;
    category: string;
    status: string;
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    // Form States
    const [mode, setMode] = useState("ai"); // 'ai' | 'manual'
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // AI Inputs
    const [prompt, setPrompt] = useState("");
    const [aiCategory, setAiCategory] = useState("MARKETING");
    const [tone, setTone] = useState("Professional");

    // Editor Inputs (Manual or AI Result)
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("marketing");

    // Fetch Templates
    const fetchTemplates = async () => {
        try {
            const res = await fetch("/api/templates");
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error("Failed to fetch templates", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const copyToClipboard = async (id: number, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            toast.success("Template copied!");
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            toast.error("Failed to copy");
        }
    };

    // AI Generation
    const handleGenerate = async () => {
        if (!prompt) return toast.error("Please enter a prompt");

        setIsGenerating(true);
        try {
            const res = await fetch("/api/ai/generate-template", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, category: aiCategory, tone })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Generation failed");

            // Populate editor fields
            setName(data.data.name || "new_template");
            setContent(data.data.body || data.data.content || ""); // Fallback
            setCategory(aiCategory.toLowerCase());

            toast.success("Template generated!");
            setMode("manual"); // Switch to view/edit result
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // Save Template
    const handleSave = async () => {
        if (!name || !content) return toast.error("Name and content required");

        setIsSaving(true);
        try {
            const res = await fetch("/api/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    content,
                    category,
                    language: 'en'
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save");

            toast.success("Template saved successfully!");
            setOpen(false);
            fetchTemplates(); // Refresh list

            // Reset form
            setName("");
            setContent("");
            setPrompt("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const getIcon = (cat: string) => {
        const c = cat.toUpperCase();
        if (c === 'ORDER' || c === 'UTILITY') return ShoppingBag;
        if (c === 'SHIPPING') return Truck;
        if (c === 'PAYMENT') return CreditCard;
        if (c === 'SUPPORT') return MessageSquare;
        return Sparkles; // Marketing
    };

    const getColor = (cat: string) => {
        const c = cat.toUpperCase();
        if (c === 'ORDER' || c === 'UTILITY') return "bg-emerald-500/10 text-emerald-400";
        if (c === 'SHIPPING') return "bg-cyan-500/10 text-cyan-400";
        if (c === 'PAYMENT') return "bg-indigo-500/10 text-indigo-400";
        if (c === 'SUPPORT') return "bg-rose-500/10 text-rose-400";
        return "bg-blue-500/10 text-blue-400"; // Marketing
    };

    return (
        <div className="space-y-6 text-foreground">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Message Templates</h1>
                    <p className="text-sm text-muted-foreground mt-1">Ready-to-use messages for your customers.</p>
                </div>
                <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> New Template
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.length === 0 && (
                        <div className="col-span-full text-center p-12 text-muted-foreground border border-dashed border-border rounded-xl">
                            No templates found. Create your first one!
                        </div>
                    )}
                    {templates.map((card) => (
                        <div key={card.id} className="bg-card border border-border rounded-xl p-5 hover:bg-secondary/50 transition-colors flex flex-col group shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${getColor(card.category)}`}>
                                        {(() => {
                                            const Icon = getIcon(card.category);
                                            return <Icon className="w-5 h-5" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">{card.name.replace(/_/g, ' ')}</h3>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider ring-1 ring-border px-1.5 py-0.5 rounded-full">{card.category}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(card.id, card.content)}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-secondary rounded-lg"
                                    title="Copy Text"
                                >
                                    {copiedId === card.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="flex-1 bg-secondary/30 rounded-lg p-3 border border-border/50 font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                                {card.content}
                            </div>

                            <div className="mt-4 pt-3 border-t border-border flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ActionButton
                                    variant="secondary"
                                    className="w-full text-xs h-8"
                                    onAction={() => copyToClipboard(card.id, card.content)}
                                >
                                    Copy Text
                                </ActionButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE TEMPLATE DIALOG */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Message Template</DialogTitle>
                        <DialogDescription>
                            Generate with AI or write manually.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={mode} onValueChange={setMode} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="ai">Generate with AI</TabsTrigger>
                            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        </TabsList>

                        <TabsContent value="ai" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>What should this message do?</Label>
                                <Textarea
                                    placeholder="E.g. Confirm an order for a fashion store and ask for a Google Review..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={aiCategory} onValueChange={setAiCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MARKETING">Marketing</SelectItem>
                                            <SelectItem value="UTILITY">Utility</SelectItem>
                                            <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tone</Label>
                                    <Select value={tone} onValueChange={setTone}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Professional">Professional</SelectItem>
                                            <SelectItem value="Friendly">Friendly</SelectItem>
                                            <SelectItem value="Urgent">Urgent</SelectItem>
                                            <SelectItem value="Luxury">Luxury</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" /> Generate Template
                                    </>
                                )}
                            </Button>
                        </TabsContent>

                        <TabsContent value="manual" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Template Name</Label>
                                <Input
                                    placeholder="order_confirmation_v1"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                        <SelectItem value="utility">Utility</SelectItem>
                                        <SelectItem value="authentication">Authentication</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Message Content</Label>
                                <Textarea
                                    placeholder="Hi {{1}}, your order is..."
                                    className="min-h-[150px] font-mono text-sm"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Use {'{{1}}, {{2}}'} for variables.</p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        {mode === 'manual' && (
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Template"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
