"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, ArrowRight, CheckCircle2, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppStep() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [phone, setPhone] = useState("");

    // In a real app with "Tech Provider" model, we'd have embedded signup.
    // For MVP/BSP mode where we have the API key, verify via OTP or Test Message.
    // Here we simulate the "Test Connection" users want.

    const handleVerifyParams = async () => {
        if (!phone || phone.length < 10) {
            toast.error("Enter a valid WhatsApp number");
            return;
        }

        setVerifying(true);
        try {
            // Send a test message to this number from our Bot
            const res = await fetch("/api/onboarding/whatsapp/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });

            if (res.ok) {
                toast.success("Test message sent! Check your WhatsApp.");
                setIsVerified(true);
            } else {
                toast.error("Failed to send test message. Check number.");
            }
        } catch (error) {
            toast.error("Connection error");
        } finally {
            setVerifying(false);
        }
    };

    const handleComplete = async () => {
        if (!isVerified) {
            toast.error("Please verify your number first");
            return;
        }

        setLoading(true);
        try {
            // Save the number as the official bot channel for this user logic (conceptually)
            const res = await fetch("/api/onboarding/whatsapp/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });

            if (res.ok) {
                router.push("/onboarding/step-5-finish");
            } else {
                toast.error("Failed to save configuration");
            }
        } catch (error) {
            toast.error("Error finalizing setup");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg">
            {/* Step Indicator */}
            <div className="mb-8 flex justify-center">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">✓</span>
                    <div className="w-12 h-0.5 bg-green-500 mx-2"></div>
                    <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">✓</span>
                    <div className="w-12 h-0.5 bg-green-500 mx-2"></div>
                    <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">4</span>
                    <span>Connect</span>
                    <div className="w-12 h-0.5 bg-gray-200 mx-2"></div>
                    <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">5</span>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-green-600">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Connect to WhatsApp</h1>
                    <p className="text-gray-500 mt-2">Enter your number to activate the bot.</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Business Number</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="919876543210"
                                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-medium"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    disabled={isVerified}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleVerifyParams}
                                disabled={verifying || isVerified || !phone}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${isVerified
                                        ? "bg-green-100 text-green-700 cursor-default"
                                        : "bg-black text-white hover:bg-gray-800"
                                    }`}
                            >
                                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : isVerified ? "Verified" : "Verify"}
                            </button>
                        </div>
                        {isVerified && (
                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Test message sent successfully!
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            We will send a test message "Hello from WaveGroww!" to confirm connection.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleComplete}
                            disabled={!isVerified || loading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {loading ? "Activating..." : "Continue to Finish"}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
