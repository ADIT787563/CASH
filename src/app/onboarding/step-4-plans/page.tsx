"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap, Crown, Check, Loader2, Rocket, Building2, Box } from "lucide-react";
import { toast } from "sonner";

export default function PlansStep() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'trial' | 'basic' | 'growth' | 'pro' | 'enterprise' | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPlan) {
            toast.error("Please select a plan");
            return;
        }

        if (selectedPlan === 'trial') {
            setLoading(true);
            try {
                const res = await fetch("/api/onboarding/plan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ plan: selectedPlan }),
                });

                if (res.ok) {
                    toast.success("Free trial activated!");
                    router.push("/onboarding/step-5-finish");
                } else {
                    const error = await res.json();
                    toast.error(error.error || "Failed to save plan");
                }
            } catch (error) {
                toast.error("Something went wrong");
            } finally {
                setLoading(false);
            }
        } else {
            // Paid plan - Redirect to checkout
            router.push(`/payment/checkout?plan=${selectedPlan}&from=onboarding`);
        }
    };

    const PlanCard = ({ id, name, price, duration, interval, icon: Icon, color, features, popular = false, bestValue = false }: any) => {
        const isSelected = selectedPlan === id;

        // Map legacy colors to theme aware classes or keeping them for distinction but with better transparency
        // For simplicity and consistency, we might want to unify them, but let's keep the distinct colors for plans as they are useful, 
        // just making them glassier.

        return (
            <div
                onClick={() => setSelectedPlan(id)}
                className={`
                    relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col h-auto min-w-[280px] max-w-[340px] flex-1 glass-card
                    ${isSelected
                        ? `border-${color}-500 bg-${color}-500/10 shadow-xl shadow-${color}-500/20 scale-[1.02] z-10`
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5 hover:scale-[1.01]'
                    }
                `}
            >
                {isSelected && (
                    <div className={`absolute -top-3 -right-3 w-8 h-8 bg-${color}-500 rounded-full flex items-center justify-center shadow-lg z-20`}>
                        <Check className="w-5 h-5 text-white" />
                    </div>
                )}

                {popular && (
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-${color}-500 to-pink-500 rounded-full text-white text-xs font-bold shadow-lg uppercase tracking-wide z-10 whitespace-nowrap`}>
                        Most Popular
                    </div>
                )}

                {bestValue && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white text-xs font-bold shadow-lg uppercase tracking-wide z-10 whitespace-nowrap">
                        Best Value
                    </div>
                )}

                <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 text-${color}-400`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{name}</h3>
                        <p className="text-muted-foreground text-xs">{duration}</p>
                    </div>
                </div>

                <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">{price}</span>
                        <span className="text-muted-foreground text-sm">{interval}</span>
                    </div>
                </div>

                <ul className="space-y-3 mb-6 flex-grow overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
                    {features.map((feature: any, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground text-xs">
                            {feature.included !== false ? (
                                <Check className={`w-4 h-4 text-${color}-400 flex-shrink-0 mt-0.5`} />
                            ) : (
                                <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center text-muted-foreground/50">✕</span>
                            )}
                            <span className={feature.included !== false ? "leading-tight text-white/90" : "text-muted-foreground/50 leading-tight"}>{feature.text}</span>
                        </li>
                    ))}
                </ul>

                <div className={`
                px-4 py-3 rounded-xl text-center font-semibold text-sm transition-colors mt-auto
                ${isSelected ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/25` : 'bg-white/5 text-muted-foreground hover:bg-white/10'}
            `}>
                    {isSelected ? 'Selected' : 'Select Plan'}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1800px] mx-auto px-4">
            <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Choose Your Plan</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Select the perfect plan for your business needs. Upgrade, downgrade, or cancel anytime.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-wrap justify-center gap-10 mb-10 items-stretch">
                    {/* Free Trial */}
                    <PlanCard
                        id="trial"
                        name="Free Trial"
                        price="₹0"
                        duration="3 Days"
                        interval="/ 3 days"
                        icon={Zap}
                        color="indigo"
                        features={[
                            { text: "100 WhatsApp msgs/day" },
                            { text: "Basic automation" },
                            { text: "Email support" },
                            { text: "Advanced AI features", included: false },
                        ]}
                    />

                    {/* Basic */}
                    <PlanCard
                        id="basic"
                        name="Basic"
                        price="₹999"
                        duration="Starter"
                        interval="/ month"
                        icon={Box}
                        color="slate"
                        features={[
                            { text: "Add up to 20 products" },
                            { text: "Single image per product" },
                            { text: "250 automated replies/mo" },
                            { text: "1 WhatsApp Number linking" },
                            { text: "Basic order form" },
                            { text: "Auto-invoice (Simple, No GST)" },
                            { text: "Basic Analytics" },
                            { text: "Single user access" },
                            { text: "Basic Email support" },
                            { text: "No API or Webhooks", included: false },
                        ]}
                    />

                    {/* Growth */}
                    <PlanCard
                        id="growth"
                        name="Growth"
                        price="₹1,699"
                        duration="Standard"
                        interval="/ month"
                        icon={Rocket}
                        color="blue"
                        bestValue={true}
                        features={[
                            { text: "Add up to 40 products" },
                            { text: "Variants & Multi-image support" },
                            { text: "800 automated replies/mo" },
                            { text: "Connect up to 3 WhatsApp Numbers" },
                            { text: "Custom checkout fields" },
                            { text: "Advanced Invoice (GST, PDF)" },
                            { text: "Revenue chart & Top customers" },
                        ]}
                    />

                    {/* Pro / Agency */}
                    <PlanCard
                        id="pro"
                        name="Pro / Agency"
                        price="₹5"
                        duration="Popular"
                        interval="/ month"
                        icon={Crown}
                        color="purple"
                        popular={true}
                        features={[
                            { text: "Add up to 130 products" },
                            { text: "Bulk upload (CSV/Excel)" },
                            { text: "Unlimited automated replies" },
                            { text: "AI-powered auto-reply" },
                            { text: "Connect up to 10 WhatsApp numbers" },
                            { text: "Branded Invoices (Logo + Colors)" },
                            { text: "Full Analytics & Conversion rates" },
                            { text: "Up to 10 team members" }
                        ]}
                    />

                    {/* Enterprise */}
                    <PlanCard
                        id="enterprise"
                        name="Enterprise"
                        price="₹8,999"
                        duration="Ultimate"
                        interval="/ month"
                        icon={Building2}
                        color="orange"
                        features={[
                            { text: "Custom catalog limit (200-Unlimited)" },
                            { text: "AI Chatbot (NLP) & Smart Replies" },
                            { text: "Multi-language NLP auto-replies" },
                            { text: "Unlimited WhatsApp numbers" },
                            { text: "Fully customizable checkout API" },
                            { text: "White-label & Custom Invoices" },
                            { text: "BI Dashboard & Custom Reports" },
                        ]}
                    />
                </div>

                <div className="max-w-md mx-auto">
                    <button
                        type="submit"
                        disabled={loading || !selectedPlan}
                        className="w-full relative group overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {selectedPlan === 'trial' ? "Start Free Trial" : "Continue to Payment"}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                    <p className="mt-4 text-xs text-center text-muted-foreground">
                        {selectedPlan === 'trial' ? 'No credit card required • Cancel anytime' : 'Secure payment • Money-back guarantee'}
                    </p>
                </div>
            </form>
        </div>
    );
}
