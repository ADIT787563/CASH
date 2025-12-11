
"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import { Loader2, Save, ShoppingBag, Palette, Image as ImageIcon, Layout, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function StoreSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [settings, setSettings] = useState({
        businessName: "",
        businessDescription: "",
        whatsappNumber: "",
        storeUrl: "",
        logoUrl: "",
        coverImageUrl: "",
        themeConfig: {
            primaryColor: "#4f46e5", // Indigo-600 default
            accentColor: "#ec4899", // Pink-500 default
            borderRadius: "0.5rem",
            layout: "modern", // modern, classic, minimal
            font: "inter"
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/business-settings");
            if (res.ok) {
                const data = await res.json();

                // Parse themeConfig if string
                let parsedTheme = data.themeConfig;
                if (typeof parsedTheme === 'string') {
                    try { parsedTheme = JSON.parse(parsedTheme); } catch (e) { }
                }

                setSettings({
                    businessName: data.businessName || "",
                    businessDescription: data.businessDescription || "",
                    whatsappNumber: data.whatsappNumber || "",
                    storeUrl: data.catalogUrl || "", // mapped from catalogUrl
                    logoUrl: data.logoUrl || "",
                    coverImageUrl: data.coverImageUrl || "",
                    themeConfig: parsedTheme || {
                        primaryColor: "#4f46e5",
                        accentColor: "#ec4899",
                        borderRadius: "0.5rem",
                        layout: "modern",
                        font: "inter"
                    }
                });
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings.businessName || !settings.whatsappNumber) {
            toast.error("Business name and WhatsApp number are required");
            return;
        }

        setSaving(true);
        try {
            // Check if settings exist (to decide POST vs PUT) - actually api handles this logic usually or we can just try PUT and if 404 then POST?
            // The API logic I saw: PUT returns 404 if not found. POST returns 400 if duplicate.
            // Let's try PUT first.

            let res = await fetch("/api/business-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessName: settings.businessName,
                    whatsappNumber: settings.whatsappNumber,
                    businessDescription: settings.businessDescription,
                    catalogUrl: settings.storeUrl,
                    themeConfig: settings.themeConfig
                })
            });

            if (res.status === 404) {
                // Try POST
                res = await fetch("/api/business-settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        businessName: settings.businessName,
                        whatsappNumber: settings.whatsappNumber,
                        businessDescription: settings.businessDescription,
                        catalogUrl: settings.storeUrl,
                        themeConfig: settings.themeConfig
                    })
                });
            }

            if (res.ok) {
                toast.success("Store settings saved successfully!");
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to save");
            }

        } catch (error) {
            toast.error("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProtectedPage>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </ProtectedPage>
        );
    }

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-gray-50 pb-12">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Store Customization</h1>
                            <p className="text-gray-500 mt-1">Manage your store's appearance and details</p>
                        </div>
                        <div className="flex gap-3">
                            {settings.storeUrl && (
                                <a
                                    href={settings.storeUrl.startsWith('http') ? settings.storeUrl : `https://${settings.storeUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Store
                                </a>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

                    {/* Basic Info Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-900">Store Details</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                                <input
                                    type="text"
                                    value={settings.businessName}
                                    onChange={e => setSettings({ ...settings, businessName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="My Awesome Store"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                                <input
                                    type="text"
                                    value={settings.whatsappNumber}
                                    onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="+91..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={settings.businessDescription}
                                    onChange={e => setSettings({ ...settings, businessDescription: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                                    placeholder="Tell customers about your business..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store URL (Optional)</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        https://
                                    </span>
                                    <input
                                        type="text"
                                        value={settings.storeUrl}
                                        onChange={e => setSettings({ ...settings, storeUrl: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="myshop.wavegroww.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Theme Customization */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                            <Palette className="w-5 h-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-900">Visual Theme</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Layout */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Card Style</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['Modern', 'Classic', 'Minimal'].map((style) => (
                                        <div
                                            key={style}
                                            onClick={() => setSettings({
                                                ...settings,
                                                themeConfig: { ...settings.themeConfig, layout: style.toLowerCase() }
                                            })}
                                            className={`cursor-pointer border rounded-xl p-4 flex flex-col gap-2 transition-all ${settings.themeConfig.layout === style.toLowerCase()
                                                    ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                                                    : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <div className="h-16 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden p-2">
                                                <div className={`w-full h-2 rounded bg-gray-100 mb-2 ${style === 'Classic' ? '' : 'rounded-full'}`} />
                                                <div className="w-2/3 h-2 rounded bg-gray-100" />
                                            </div>
                                            <span className="text-sm font-medium text-center">{style}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Colors */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                                    <div className="flex gap-3 items-center">
                                        <input
                                            type="color"
                                            value={settings.themeConfig.primaryColor}
                                            onChange={e => setSettings({
                                                ...settings,
                                                themeConfig: { ...settings.themeConfig, primaryColor: e.target.value }
                                            })}
                                            className="h-10 w-20 p-1 border border-gray-200 rounded cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-500 uppercase">{settings.themeConfig.primaryColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                                    <div className="flex gap-3 items-center">
                                        <input
                                            type="color"
                                            value={settings.themeConfig.accentColor}
                                            onChange={e => setSettings({
                                                ...settings,
                                                themeConfig: { ...settings.themeConfig, accentColor: e.target.value }
                                            })}
                                            className="h-10 w-20 p-1 border border-gray-200 rounded cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-500 uppercase">{settings.themeConfig.accentColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Branding Images (Placeholder for now) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-900">Branding Assets</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer bg-gray-50/50">
                                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                                            <UploadIcon className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <span className="text-sm text-indigo-600 font-medium">Click to upload</span>
                                        <span className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 2MB)</span>
                                        {/* Hidden input for future implementation */}
                                        <input type="file" className="hidden" accept="image/*" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Or paste image URL"
                                        className="mt-3 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                        value={settings.logoUrl}
                                        onChange={e => setSettings({ ...settings, logoUrl: e.target.value })}
                                    />
                                </div>

                                {/* Preview Card */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <span className="text-xs font-semibold text-gray-400 uppercase mb-2 block tracking-wider">Live Preview</span>
                                    <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-xs mx-auto my-4" style={{ borderRadius: settings.themeConfig.borderRadius }}>
                                        <div className="h-24 w-full bg-gray-200 relative">
                                            {settings.coverImageUrl ? (
                                                <img src={settings.coverImageUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Cover Image</div>
                                            )}
                                        </div>
                                        <div className="p-4 relative">
                                            <div className="w-12 h-12 rounded-full border-4 border-white absolute -top-6 left-4 bg-white flex items-center justify-center overflow-hidden shadow-sm">
                                                {settings.logoUrl ? (
                                                    <img src={settings.logoUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                        {settings.businessName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-6">
                                                <h3 className="font-bold text-gray-900">{settings.businessName || "Store Name"}</h3>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{settings.businessDescription || "Store description..."}</p>
                                                <button
                                                    className="w-full mt-4 py-2 rounded-lg text-white text-xs font-medium"
                                                    style={{ backgroundColor: settings.themeConfig.primaryColor }}
                                                >
                                                    Shop Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedPage>
    );
}

function UploadIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
    )
}
