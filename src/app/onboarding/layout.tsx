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
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-transparent">
            {/* Background elements are handled by global styles */}

            {/* Header */}
            <div className="relative z-10 pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6 text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold shadow-lg shadow-primary/30">
                        W
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">WaveGroww</span>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">Setup your automated store in minutes</p>
            </div>

            {/* Enhanced Stepper */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 w-full mb-6 sm:mb-8">
                <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/10 rounded-full -z-10"></div>
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 rounded-full -z-10 transition-all duration-500"
                        style={{
                            width: `${((steps.findIndex(s => pathname.includes(s.key)) + 1) / steps.length) * 100}%` // eslint-disable-line react-dom/no-unsafe-inline-style
                        }}
                    ></div>

                    {steps.map((step) => {
                        const status = getStepStatus(step.id, step.key);
                        const isCompleted = status === "completed";
                        const isCurrent = status === "current";

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-1.5 sm:gap-2 bg-transparent px-1 sm:px-2 z-10">
                                <div
                                    className={`
                                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                        ${isCompleted
                                            ? "bg-primary border-primary text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                                            : isCurrent
                                                ? "bg-primary border-primary text-black shadow-[0_0_25px_rgba(255,255,255,0.6)] scale-110"
                                                : "bg-[#0a0a0a] border-white/20 text-muted-foreground"
                                        }
                                    `}
                                >
                                    {isCompleted ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-black" /> : <step.icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                                </div>
                                <span
                                    className={`
                                            text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors duration-300 mt-1
                                            ${isCurrent ? "text-primary" : isCompleted ? "text-primary/70" : "text-muted-foreground"}
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
            <div className="relative z-10 py-4 sm:py-6 text-center text-[10px] sm:text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} WaveGroww. Secure & Encrypted SSL.
            </div>
        </div >
    );
}
