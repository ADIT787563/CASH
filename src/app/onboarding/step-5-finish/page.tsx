"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, CheckCircle2, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function FinishStep() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Celebrate!
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const handleStartTrial = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/onboarding/complete", {
                method: "POST",
            });

            if (res.ok) {
                const data = await res.json();
                router.push(data.redirectTo || "/dashboard");
            } else {
                // Even if it fails, try redirecting or show error. 
                // If already completed, API might return success or error, handle gracefully.
                console.error("Completion failed");
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Error starting trial:", error);
            router.push("/dashboard");
        }
    };

    return (
        <div className="w-full max-w-lg text-center animate-fade-in">
            {/* Step Indicator */}
            <div className="mb-8 flex justify-center">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">✓</span>
                    <div className="w-12 h-0.5 bg-green-500 mx-2"></div>
                    <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">✓</span>
                    <div className="w-12 h-0.5 bg-green-500 mx-2"></div>
                    <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">✓</span>
                    <div className="w-12 h-0.5 bg-green-500 mx-2"></div>
                    <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">🎉</span>
                </div>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 animate-bounce">
                    <Zap className="w-10 h-10 fill-indigo-600" />
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">You're All Set!</h1>
                <p className="text-gray-500 mb-8 text-lg">Your AI Sales Agent is ready to take orders.</p>

                <div className="bg-indigo-50/50 rounded-xl p-6 mb-8 border border-indigo-100 text-left">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        Pro Trial Activated
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Unlimited AI Responses</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Product Catalog Sync</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Advanced Analytics</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleStartTrial}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-[1.02]"
                    >
                        {loading ? "Launching Dashboard..." : "Go to Dashboard"}
                    </button>

                    <Link href="/plans" className="block text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                        Compare plans & features
                    </Link>
                </div>
            </div>
        </div>
    );
}
