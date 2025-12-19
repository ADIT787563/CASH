"use client";

import { usePathname } from "next/navigation";
import { User, Building2, CreditCard, Gift, CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    const steps = [
        { id: 1, key: "account", icon: User, label: "Account", path: "/onboarding/signup" }, // Conceptually done
        { id: 2, key: "step-2-business", icon: Building2, label: "Business", path: "/onboarding/step-2-business" },
        { id: 3, key: "step-3-payments", icon: CreditCard, label: "Payments", path: "/onboarding/step-3-payments" },
        { id: 4, key: "step-4-plans", icon: Gift, label: "Plans", path: "/onboarding/step-4-plans" },
    ];

    const getStepStatus = (stepId: number, stepKey: string) => {
        if (stepId === 1) return "completed";
        if (pathname.includes(stepKey)) return "current";

        const currentStepIndex = steps.findIndex(s => pathname.includes(s.key));
        const thisStepIndex = steps.findIndex(s => s.key === stepKey);

        if (thisStepIndex < currentStepIndex && currentStepIndex !== -1) return "completed";
        if (pathname.includes("step-5-finish")) return "completed";

        return "upcoming";
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Enhanced Gradient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[140px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
                <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] bg-blue-600/15 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "4s" }}></div>
            </div>

            {/* Header */}
            <div className="relative z-10 pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6 text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
                        W
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">WaveGroww</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">Setup your automated store in minutes</p>
            </div>

            {/* Enhanced Stepper */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 w-full mb-6 sm:mb-8">
                <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800 rounded-full -z-10"></div>
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full -z-10 transition-all duration-500"
                        style={{
                            width: `${((steps.findIndex(s => pathname.includes(s.key)) + 1) / steps.length) * 100}%`
                        }}
                    ></div>

                    {steps.map((step) => {
                        const status = getStepStatus(step.id, step.key);
                        const isCompleted = status === "completed";
                        const isCurrent = status === "current";

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-1.5 sm:gap-2 bg-slate-950 px-1 sm:px-2 z-10">
                                <div
                                    className={`
                                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                        ${isCompleted
                                            ? "bg-green-500 border-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                                            : isCurrent
                                                ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.7)] scale-110"
                                                : "bg-slate-800 border-slate-700 text-slate-500"
                                        }
                                    `}
                                >
                                    {isCompleted ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <step.icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                                </div>
                                <span
                                    className={`
                                            text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors duration-300 mt-1
                                            ${isCurrent ? "text-indigo-400" : isCompleted ? "text-green-400" : "text-slate-600"}
                                        `}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center px-3 sm:px-4 pb-8 sm:pb-12">
                <div className="w-full max-w-5xl">
                    {children}
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 py-4 sm:py-6 text-center text-[10px] sm:text-xs text-slate-500">
                &copy; {new Date().getFullYear()} WaveGroww. Secure & Encrypted SSL.
            </div>
        </div >
    );
}
