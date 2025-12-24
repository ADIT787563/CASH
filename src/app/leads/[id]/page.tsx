"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    MessageCircle,
    Calendar,
    Bot,
    ShoppingBag,
    CreditCard,
    Save,
    MoreVertical,
    Shield
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Lead {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    source: string;
    status: string;
    interest_category: string | null;
    last_message: string | null;
    notes: string | null;
    created_at: string;
    // Advanced
    ai_behavior?: string;
    ai_confidence_threshold?: number;
    lead_source?: string;
}

export default function LeadDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const { id } = params;

    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [lead, setLead] = useState<Lead | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    // Plan Check
    const userPlan = (session?.user as any)?.plan || "starter";
    const isAdvanced = userPlan.includes("pro") || userPlan.includes("enterprise") || userPlan.includes("growth");

    useEffect(() => {
        if (session?.user) {
            fetchLead();
        }
    }, [session, id]);

    const fetchLead = async () => {
        try {
            const token = localStorage.getItem("bearer_token");
            const response = await fetch(`/api/leads?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });


            if (response.ok) {
                const data = await response.json();
                setLead(data);
            } else {
                toast.error("Lead not found");
                router.push("/leads");
            }
        } catch (error) {
            console.error("Error fetching lead:", error);
            toast.error("Failed to load lead details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateLead = async (updates: Partial<Lead>) => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/leads?id=${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                const updated = await response.json();
                setLead(updated);
                toast.success("Updated successfully");
            } else {
                toast.error("Failed to update");
            }
        } catch (error) {
            console.error("Error updating lead:", error);
            toast.error("Failed to update lead");
        } finally {
            setIsSaving(false);
        }
    };

    if (isPending || isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!lead) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/leads" className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    {lead.name}
                                    {isAdvanced && <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">Pro</span>}
                                </h1>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> {lead.phone}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium">
                                <MessageCircle className="w-4 h-4" />
                                Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Status Card */}
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-lg font-bold mb-4">Pipeline Status</h2>
                            <div className="flex flex-wrap gap-2">
                                {["new", "contacted", "qualified", "converted", "lost"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleUpdateLead({ status })}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${lead.status === status
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background border-border hover:bg-muted"
                                            }`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-lg font-bold mb-4">Notes</h2>
                            <textarea
                                className="w-full p-3 bg-muted/50 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:outline-none min-h-[120px]"
                                placeholder="Add internal notes about this customer..."
                                defaultValue={lead.notes || ""}
                                onBlur={(e) => {
                                    if (e.target.value !== lead.notes) {
                                        handleUpdateLead({ notes: e.target.value });
                                    }
                                }}
                            />
                        </div>

                        {/* History Tabs (Advanced Only feature for Orders) */}
                        <div className="glass-card rounded-xl overflow-hidden">
                            <div className="border-b border-border flex">
                                <button
                                    onClick={() => setActiveTab("overview")}
                                    className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "overview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-muted/50"
                                        }`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab("orders")}
                                    className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "orders" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-muted/50"
                                        }`}
                                >
                                    Orders
                                </button>
                            </div>

                            <div className="p-6">
                                {activeTab === "overview" && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">Joined on {new Date(lead.created_at).toLocaleDateString()}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Source:</span>
                                            <span className="px-2 py-0.5 bg-muted rounded text-xs">{lead.source}</span>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "orders" && (
                                    <div className="text-center py-8">
                                        {!isAdvanced ? (
                                            <div className="space-y-3">
                                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                                                    <Shield className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <h3 className="font-bold">Upgrade to View Orders</h3>
                                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                                    Order history and LTV tracking is available on Pro plans.
                                                </p>
                                                <Link href="/pricing" className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold mt-2">
                                                    Upgrade Now
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                                                <p className="text-muted-foreground">No orders found for this lead.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Contact Info */}
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-lg font-bold mb-4">Contact Info</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{lead.name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span>{lead.phone}</span>
                                </div>
                                {lead.email && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span>{lead.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Settings (Advanced Only) */}
                        <div className={`glass-card rounded-xl p-6 relative overflow-hidden ${!isAdvanced ? "opacity-75" : ""}`}>
                            {!isAdvanced && (
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center">
                                    <Bot className="w-8 h-8 text-primary mb-2" />
                                    <h3 className="font-bold text-sm">AI Copilot Locked</h3>
                                    <Link href="/pricing" className="text-xs text-primary hover:underline mt-1 font-semibold">
                                        Upgrade to Configure
                                    </Link>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Bot className="w-5 h-5 text-secondary" />
                                    AI Behavior
                                </h2>
                                {isAdvanced && (
                                    <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold">PRO</span>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Selling Mode</label>
                                    <select
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                        value={lead.ai_behavior || "standard"}
                                        onChange={(e) => handleUpdateLead({ ai_behavior: e.target.value })}
                                        disabled={!isAdvanced}
                                    >
                                        <option value="standard">Standard (Balanced)</option>
                                        <option value="aggressive">Aggressive (Sales Focus)</option>
                                        <option value="polite">Polite (Support Focus)</option>
                                        <option value="human_only">Human Only (Paused)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Confidence Threshold</label>
                                    <input
                                        type="range"
                                        min="50" max="100"
                                        value={lead.ai_confidence_threshold || 80}
                                        onChange={(e) => handleUpdateLead({ ai_confidence_threshold: Number(e.target.value) })}
                                        className="w-full accent-primary"
                                        disabled={!isAdvanced}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>Proactive</span>
                                        <span>Cautious</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
