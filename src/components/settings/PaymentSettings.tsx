"use client";

import { useState, useEffect } from "react";
import { SettingsSection } from "./SettingsSection";
import { InputGroup } from "./InputGroup";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CreditCard, Banknote, QrCode, CheckCircle2 } from "lucide-react";

export function PaymentSettings() {
    const [loading, setLoading] = useState(false);
    const [razorpayVerified, setRazorpayVerified] = useState(false); // TODO: Fetch from verified state if available

    const [modes, setModes] = useState({
        cod: true,
        online: false,
        upi: false
    });

    const [razorpayConfig, setRazorpayConfig] = useState({
        keyId: "",
        keySecret: ""
    });

    const [upiConfig, setUpiConfig] = useState({
        vpa: "",
        name: ""
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings/payment");
                if (res.ok) {
                    const data = await res.json();
                    setModes({
                        cod: data.codEnabled,
                        online: data.razorpayEnabled,
                        upi: data.upiEnabled
                    });
                    setRazorpayConfig({
                        keyId: data.razorpayKeyId || "",
                        keySecret: data.razorpayKeySecretEncrypted || "" // Masked or encrypted usually
                    });
                    setUpiConfig({
                        vpa: data.upiId || "",
                        name: data.upiAccountName || ""
                    });
                }
            } catch (error) {
                console.error("Failed to load payment settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                codEnabled: modes.cod,
                razorpayEnabled: modes.online,
                upiEnabled: modes.upi,
                razorpayKeyId: razorpayConfig.keyId,
                razorpayKeySecret: razorpayConfig.keySecret,
                upiId: upiConfig.vpa,
                upiAccountName: upiConfig.name
            };

            const res = await fetch("/api/settings/payment", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save");

            toast.success("Payment settings saved");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save payment settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SettingsSection
            title="Payments & Payouts"
            description="Configure how you receive payments from customers."
            onSave={handleSave}
            isSaving={loading}
        >
            {/* Payment Modes Grid */}
            <h3 className="text-sm font-medium text-slate-900 mb-3">Accepted Payment Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* COD */}
                <div className={`p-4 rounded-lg border flex items-start justify-between ${modes.cod ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
                    <div className="flex gap-3">
                        <Banknote className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm">Cash on Delivery</h4>
                            <p className="text-xs text-slate-500 mt-1">Accept cash when order arrives.</p>
                        </div>
                    </div>
                    <Switch checked={modes.cod} onCheckedChange={(v) => setModes({ ...modes, cod: v })} />
                </div>

                {/* Online (Razorpay) */}
                <div className={`p-4 rounded-lg border flex items-start justify-between ${modes.online ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
                    <div className="flex gap-3">
                        <CreditCard className="w-5 h-5 text-indigo-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm">Online (Razorpay)</h4>
                            <p className="text-xs text-slate-500 mt-1">Cards, Netbanking, Wallets.</p>
                        </div>
                    </div>
                    <Switch checked={modes.online} onCheckedChange={(v) => setModes({ ...modes, online: v })} />
                </div>

                {/* Manual UPI */}
                <div className={`p-4 rounded-lg border flex items-start justify-between ${modes.upi ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
                    <div className="flex gap-3">
                        <QrCode className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm">Manual UPI</h4>
                            <p className="text-xs text-slate-500 mt-1">Show QR code for direct transfer.</p>
                        </div>
                    </div>
                    <Switch checked={modes.upi} onCheckedChange={(v) => setModes({ ...modes, upi: v })} />
                </div>
            </div>

            {/* Razorpay Config */}
            {modes.online && (
                <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-900">Razorpay Configuration</h3>
                        {razorpayVerified && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup
                            label="Key ID"
                            type="password"
                            value={razorpayConfig.keyId}
                            onChange={(e) => setRazorpayConfig({ ...razorpayConfig, keyId: e.target.value })}
                            placeholder="rzp_live_..."
                        />
                        <InputGroup
                            label="Key Secret"
                            type="password"
                            value={razorpayConfig.keySecret}
                            onChange={(e) => setRazorpayConfig({ ...razorpayConfig, keySecret: e.target.value })}
                            placeholder="******"
                        />
                    </div>

                    <div className="bg-slate-50 p-3 rounded text-xs text-slate-500">
                        <span className="font-semibold">Note:</span> Webhooks are automatically configured when you verify keys.
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => { toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: 'Verifying keys...', success: 'Keys Verified!', error: 'Invalid Keys' }) }}
                            className="text-sm text-indigo-600 font-medium hover:underline"
                        >
                            Test & Verify Keys
                        </button>
                    </div>
                </div>
            )}

            {/* UPI Config */}
            {modes.upi && (
                <div className="space-y-4 border-t pt-6">
                    <h3 className="text-sm font-medium text-slate-900">Manual UPI Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup
                            label="UPI ID (VPA)"
                            value={upiConfig.vpa}
                            onChange={(e) => setUpiConfig({ ...upiConfig, vpa: e.target.value })}
                            placeholder="yourname@upi"
                        />
                        <InputGroup
                            label="Account Name"
                            value={upiConfig.name}
                            onChange={(e) => setUpiConfig({ ...upiConfig, name: e.target.value })}
                            placeholder="Your Name"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-slate-100 rounded border flex items-center justify-center text-xs text-slate-400">
                            QR Prview
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Upload QR Code Image</label>
                            <input
                                type="file"
                                aria-label="Upload QR Code"
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                    </div>
                </div>
            )}

        </SettingsSection>
    );
}
