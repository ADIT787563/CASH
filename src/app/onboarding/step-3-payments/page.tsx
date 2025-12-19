"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CreditCard, Smartphone, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PaymentsStep() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<'razorpay' | 'upi' | 'both' | null>(null);
    const [upiAcknowledged, setUpiAcknowledged] = useState(false);

    const [upiId, setUpiId] = useState("");
    const [razorpayKey, setRazorpayKey] = useState("");
    const [razorpaySecret, setRazorpaySecret] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedOption) {
            toast.error("Please select a payment method");
            return;
        }

        if ((selectedOption === 'upi' || selectedOption === 'both') && !upiAcknowledged) {
            toast.error("Please acknowledge the UPI manual verification requirement");
            return;
        }

        if ((selectedOption === 'upi' || selectedOption === 'both') && !upiId.includes('@')) {
            toast.error("Please enter a valid UPI ID");
            return;
        }

        if ((selectedOption === 'razorpay' || selectedOption === 'both') && (!razorpayKey || !razorpaySecret)) {
            toast.error("Please enter Razorpay credentials");
            return;
        }

        setLoading(true);
        try {
            const payload: any = { method: selectedOption };

            if (selectedOption === 'upi' || selectedOption === 'both') {
                payload.upiId = upiId;
            }

            if (selectedOption === 'razorpay' || selectedOption === 'both') {
                payload.razorpayKey = razorpayKey;
                payload.razorpaySecret = razorpaySecret;
            }

            const res = await fetch("/api/onboarding/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success("Payment method configured!");
                router.push("/onboarding/step-4-plans");
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to save payment method");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
            <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Payment Setup</h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                    Define how customers will pay for their orders
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Option A - Razorpay */}
                <div
                    onClick={() => setSelectedOption(selectedOption === 'razorpay' ? null : 'razorpay')}
                    className={`
                        relative p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
                        ${selectedOption === 'razorpay'
                            ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20 scale-[1.02]'
                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/40'
                        }
                    `}
                >
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`
                            w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                            ${selectedOption === 'razorpay' ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}
                        `}>
                            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-base sm:text-lg font-bold text-white">Option A: Razorpay</h3>
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap">
                                    Auto-Verified ✅
                                </span>
                            </div>
                            <p className="text-slate-400 text-xs sm:text-sm mb-3">
                                Payments via Razorpay are automatically verified and confirmed by the system.
                            </p>

                            {selectedOption === 'razorpay' && (
                                <div className="mt-4 space-y-3 animate-fade-in-up">
                                    <input
                                        type="text"
                                        placeholder="Razorpay Key ID"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 px-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={razorpayKey}
                                        onChange={(e) => setRazorpayKey(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Razorpay Secret"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 px-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={razorpaySecret}
                                        onChange={(e) => setRazorpaySecret(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            )}
                        </div>
                        {selectedOption === 'razorpay' && (
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                        )}
                    </div>
                </div>

                {/* Option B - UPI */}
                <div
                    onClick={() => setSelectedOption(selectedOption === 'upi' ? null : 'upi')}
                    className={`
                        relative p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
                        ${selectedOption === 'upi'
                            ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20 scale-[1.02]'
                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/40'
                        }
                    `}
                >
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`
                            w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                            ${selectedOption === 'upi' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-400'}
                        `}>
                            <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-base sm:text-lg font-bold text-white">Option B: UPI</h3>
                                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap">
                                    Manual Verification ⚠️
                                </span>
                            </div>
                            <p className="text-slate-400 text-xs sm:text-sm mb-3">
                                Accept payments via UPI. You must manually verify and confirm each payment.
                            </p>

                            {selectedOption === 'upi' && (
                                <div className="mt-4 space-y-4 animate-fade-in-up">
                                    <input
                                        type="text"
                                        placeholder="UPI ID (e.g., yourname@upi)"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 px-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />

                                    <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-lg p-3 sm:p-4">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-amber-200 text-xs sm:text-sm font-semibold mb-2">
                                                    ⚠️ Important Caution
                                                </p>
                                                <p className="text-amber-200/80 text-[10px] sm:text-xs mb-3">
                                                    UPI payments are manually verified by you. WaveGroww does NOT automatically confirm UPI payments.
                                                    You must check your bank app and mark orders as paid.
                                                </p>
                                                <label
                                                    className="flex items-start gap-2 cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={upiAcknowledged}
                                                        onChange={(e) => setUpiAcknowledged(e.target.checked)}
                                                        className="mt-0.5 w-4 h-4 rounded border-amber-500/50 bg-slate-900 text-amber-500 focus:ring-2 focus:ring-amber-500"
                                                    />
                                                    <span className="text-amber-100 text-[10px] sm:text-xs font-medium">
                                                        I understand that UPI payments require manual confirmation
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {selectedOption === 'upi' && (
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                        )}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || !selectedOption}
                        className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 sm:py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Continue to Plans
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                    <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-center text-slate-500">
                        You can change this later in settings
                    </p>
                </div>
            </form>
        </div>
    );
}
