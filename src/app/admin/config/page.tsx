"use client";

import { useState } from "react";
import { useConfig, useUpdatePricing, useUpdateContent, useUpdateFeatureFlag, PricingPlan } from "@/hooks/useConfig";
import { toast } from "sonner";
import {
    Loader2,
    Save,
    Plus,
    Trash2,
    Check,
    X,
    DollarSign,
    FileText,
    Settings,
    Flag,
    Edit2,
} from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import { Switch } from "@/components/ui/switch";

function AdminConfigContent() {
    const { pricing, content, features, isLoading } = useConfig();
    const updatePricing = useUpdatePricing();
    const updateContent = useUpdateContent();
    const [activeTab, setActiveTab] = useState<"pricing" | "content" | "features">("pricing");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Global Configuration</h1>
                <p className="text-muted-foreground">
                    Manage pricing plans, content settings, and feature flags from a single source of truth.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 mb-8 border-b border-border">
                <button
                    onClick={() => setActiveTab("pricing")}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === "pricing"
                            ? "border-primary text-primary font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <DollarSign className="w-4 h-4" />
                    Pricing Plans
                </button>
                <button
                    onClick={() => setActiveTab("content")}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === "content"
                            ? "border-primary text-primary font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    Content Settings
                </button>
                <button
                    onClick={() => setActiveTab("features")}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === "features"
                            ? "border-primary text-primary font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <Flag className="w-4 h-4" />
                    Feature Flags
                </button>
            </div>

            {/* Content */}
            <div className="space-y-8">
                {activeTab === "pricing" && <PricingEditor plans={pricing} updatePlan={updatePricing.mutate} />}
                {activeTab === "content" && <ContentEditor content={content} updateContent={updateContent.mutate} />}
                {activeTab === "features" && <FeatureFlagEditor />}
            </div>
        </div>
    );
}

function PricingEditor({ plans, updatePlan }: { plans: PricingPlan[]; updatePlan: any }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<PricingPlan>>({});

    const handleEdit = (plan: PricingPlan) => {
        setEditingId(plan.id);
        setEditForm(plan);
    };

    const handleSave = () => {
        if (!editingId) return;
        updatePlan(
            { ...editForm, id: editingId },
            {
                onSuccess: () => {
                    toast.success("Plan updated successfully");
                    setEditingId(null);
                },
                onError: () => toast.error("Failed to update plan"),
            }
        );
    };

    return (
        <div className="grid gap-6">
            {plans.map((plan) => (
                <div key={plan.id} className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${plan.bgColor || "bg-muted"}`}>
                                <span className="font-bold text-lg">{plan.planName.charAt(0)}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{plan.planName}</h3>
                                <p className="text-sm text-muted-foreground">ID: {plan.planId}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleEdit(plan)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>

                    {editingId === plan.id ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Monthly Price (paise)</label>
                                    <input
                                        type="number"
                                        value={editForm.monthlyPrice || 0}
                                        onChange={(e) => setEditForm({ ...editForm, monthlyPrice: parseInt(e.target.value) })}
                                        className="w-full p-2 rounded-lg border border-border bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Yearly Price (paise)</label>
                                    <input
                                        type="number"
                                        value={editForm.yearlyPrice || 0}
                                        onChange={(e) => setEditForm({ ...editForm, yearlyPrice: parseInt(e.target.value) })}
                                        className="w-full p-2 rounded-lg border border-border bg-background"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Features (comma separated)</label>
                                <textarea
                                    value={editForm.features?.join(", ") || ""}
                                    onChange={(e) => setEditForm({ ...editForm, features: e.target.value.split(",").map(s => s.trim()) })}
                                    className="w-full p-2 rounded-lg border border-border bg-background h-24"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">₹{(plan.monthlyPrice / 100).toLocaleString()}</span>
                                <span className="text-sm text-muted-foreground">/month</span>
                            </div>
                            <ul className="space-y-1">
                                {plan.features.slice(0, 3).map((f, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Check className="w-3 h-3 text-success" />
                                        {f}
                                    </li>
                                ))}
                                {plan.features.length > 3 && (
                                    <li className="text-sm text-muted-foreground pl-5">
                                        +{plan.features.length - 3} more...
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function ContentEditor({ content, updateContent }: { content: any; updateContent: any }) {
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>("");

    const handleEdit = (key: string, value: any) => {
        setEditingKey(key);
        setEditValue(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
    };

    const handleSave = () => {
        if (!editingKey) return;

        let parsedValue = editValue;
        try {
            // Try to parse as JSON if it looks like JSON
            if (editValue.startsWith('{') || editValue.startsWith('[')) {
                parsedValue = JSON.parse(editValue);
            }
        } catch (e) {
            // Keep as string if parsing fails
        }

        updateContent(
            { key: editingKey, value: parsedValue },
            {
                onSuccess: () => {
                    toast.success("Content updated successfully");
                    setEditingKey(null);
                },
                onError: () => toast.error("Failed to update content"),
            }
        );
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="text-left p-4 font-semibold">Key</th>
                        <th className="text-left p-4 font-semibold">Value</th>
                        <th className="text-right p-4 font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(content).map(([key, value]: [string, any]) => (
                        <tr key={key} className="border-t border-border">
                            <td className="p-4 font-medium font-mono text-sm">{key}</td>
                            <td className="p-4">
                                {editingKey === key ? (
                                    <textarea
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full p-2 rounded-lg border border-border bg-background font-mono text-sm h-24"
                                    />
                                ) : (
                                    <div className="max-w-xl truncate text-sm text-muted-foreground font-mono">
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </div>
                                )}
                            </td>
                            <td className="p-4 text-right align-top">
                                {editingKey === key ? (
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setEditingKey(null)}
                                            className="p-2 hover:bg-muted rounded-lg"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleEdit(key, value)}
                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function FeatureFlagEditor() {
    const { features } = useConfig();
    const updateFeature = useUpdateFeatureFlag();

    const handleToggle = (key: string, currentStatus: boolean) => {
        updateFeature.mutate({
            featureKey: key,
            isEnabled: !currentStatus
        }, {
            onSuccess: () => toast.success("Feature flag updated"),
            onError: () => toast.error("Failed to update feature flag")
        });
    };

    return (
        <div className="grid gap-4">
            {features.map((flag: any) => (
                <div key={flag.id} className="bg-card border border-border rounded-xl p-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{flag.featureKey}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${flag.isEnabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                                {flag.isEnabled ? "Enabled" : "Disabled"}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{flag.description || "No description provided"}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Switch
                            checked={flag.isEnabled}
                            onCheckedChange={() => handleToggle(flag.featureKey, flag.isEnabled)}
                        />
                    </div>
                </div>
            ))}
            {features.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    No feature flags found.
                </div>
            )}
        </div>
    );
}

export default function AdminConfigPage() {
    return (
        <ProtectedPage>
            <AdminConfigContent />
        </ProtectedPage>
    );
}
