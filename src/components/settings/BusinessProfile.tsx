"use client";

import { useState, useEffect } from "react";
import { SettingsSection } from "./SettingsSection";
import { InputGroup } from "./InputGroup";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

export function BusinessProfile() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false); // In future, fetch this from backend

    const [formData, setFormData] = useState({
        businessName: "",
        businessCategory: "",
        businessDescription: "",
        whatsappNumber: "", // Owner Phone
        businessEmail: "",
        gstin: "",
        address: "",
    });

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/business-settings");
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        businessName: data.businessName || "",
                        businessCategory: data.businessCategory || "",
                        businessDescription: data.businessDescription || "",
                        whatsappNumber: data.whatsappNumber || "",
                        businessEmail: session?.user?.email || "", // Fallback to user email if not setting
                        gstin: data.gstin || "", // Assuming we add this field to DB later
                        address: data.address ? (typeof data.address === 'string' ? data.address : JSON.stringify(data.address)) : "",
                    });
                    // setIsVerified(data.isVerified); // Future
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setInitialLoading(false);
            }
        }
        fetchSettings();
    }, [session]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/business-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save");

            const data = await res.json();
            toast.success("Business profile updated!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

    return (
        <SettingsSection
            title="Business Profile"
            description="Manage your business identity. Verified profiles have locked fields."
            onSave={handleSave}
            isSaving={loading}
        >
            {isVerified && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center gap-3 text-sm text-emerald-800 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                        <span className="font-bold block">Business Profile Verified</span>
                        Critical fields are locked to prevent identity spoofing. Contact support to change.
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                    label="Business Name *"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    disabled={isVerified}
                    helpVar={isVerified ? "Locked by Verification" : undefined}
                />

                <InputGroup
                    label="Owner / Contact Name"
                    value={session?.user?.name || ""}
                    disabled
                    helpVar="Managed in Account Settings"
                />

                <InputGroup
                    label="WhatsApp Number *"
                    value={formData.whatsappNumber}
                    disabled={true}
                    placeholder="+91 9876543210"
                    helpVar="Locked. Contact support to change."
                />

                <InputGroup
                    label="Business Email *"
                    value={formData.businessEmail}
                    disabled={true} // Usually locked to account
                    helpVar="Linked to your WaveGroww login"
                />

                <InputGroup
                    label="GST Number (Optional)"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="22AAAAA0000A1Z5"
                />

                <InputGroup
                    label="Business Category"
                    value={formData.businessCategory}
                    onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                    placeholder="e.g. Retail, Service, F&B"
                />

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Business Address
                    </label>
                    <textarea
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Complete address with pincode"
                    />
                </div>
            </div>
        </SettingsSection>
    );
}
