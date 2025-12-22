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
            {/* Step Indicator - Hidden as handled by layout */}
            {/* <div className="mb-8 flex justify-center">...</div> */}

            <div className="glass-card p-8 rounded-2xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Connect to WhatsApp</h1>
                    <p className="text-muted-foreground mt-2">Enter your number to activate the bot.</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">WhatsApp Business Number</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="919876543210"
                                    className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium transition-all"
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
                                    ? "bg-primary/20 text-primary cursor-default border border-primary/20"
                                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                                    }`}
                            >
                                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : isVerified ? "Verified" : "Verify"}
                            </button>
                        </div>
                        {isVerified && (
                            <p className="text-xs text-primary mt-2 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Test message sent successfully!
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground/60 mt-2">
                            We will send a test message "Hello from WaveGroww!" to confirm connection.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleComplete}
                            disabled={!isVerified || loading}
                            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/20"
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
