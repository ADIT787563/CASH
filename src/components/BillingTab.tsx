'use client';

import { useState } from "react";
import {
    CreditCard,
    CheckCircle2,
    Calendar,
    AlertCircle,
    TrendingUp,
    Package,
    Zap,
    Crown,
    Building2,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { usePricing } from "@/hooks/useConfig";
import type { PricingPlan } from "@/hooks/useConfig";

// Icon mapping
const iconMap: Record<string, any> = {
    Package,
    Zap,
    TrendingUp,
    Crown,
    Building: Building2,
    Building2,
};

interface BillingTabProps {
    currentPlan?: string;
}

export function BillingTab({ currentPlan = "starter" }: BillingTabProps) {
    const { data: plansFromDB, isLoading } = usePricing();
    const [subscription, setSubscription] = useState({
        plan: currentPlan,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
    });

    // Fallback plans if DB is empty (kept in sync with public pricing page)
    const fallbackPlans: PricingPlan[] = [
        {
            id: 1,
            planId: "starter",
            planName: "Starter",
            monthlyPrice: 5,
            yearlyPrice: 50,
            features: [
                "Up to 2,000 messages/month",
                "Essential AI chatbot",
                "1 WhatsApp number",
                "Email + chat support",
                "Basic analytics dashboard",
            ],
            limits: {
                messages: 2000,
                whatsappNumbers: 1,
                templates: 15,
                leads: 500,
            },
            icon: "Zap",
            color: "text-primary",
            bgColor: "bg-primary/10",
            isPopular: false,
            isActive: true,
            sortOrder: 1,
        },
        {
            id: 2,
            planId: "growth",
            planName: "Growth",
            monthlyPrice: 1699,
            yearlyPrice: 16990,
            features: [
                "Up to 5,000 messages/month",
                "Advanced AI automations",
                "3 WhatsApp numbers",
                "Priority email & WhatsApp support",
                "Campaign scheduling",
                "Catalog PDF downloads",
            ],
            limits: {
                messages: 5000,
                whatsappNumbers: 3,
                templates: 40,
                leads: 2000,
            },
            icon: "TrendingUp",
            color: "text-zinc-400",
            bgColor: "bg-zinc-400/10",
            isPopular: true,
            isActive: true,
            sortOrder: 2,
        },
        {
            id: 3,
            planId: "pro",
            planName: "Pro",
            monthlyPrice: 3999,
            yearlyPrice: 39990,
            features: [
                "Up to 15,000 messages/month",
                "Autopilot AI + keyword flows",
                "10 WhatsApp numbers",
                "24/7 priority support",
                "Advanced analytics + exports",
                "API & webhooks access",
            ],
            limits: {
                messages: 15000,
                whatsappNumbers: 10,
                templates: 120,
                leads: 8000,
            },
            icon: "Crown",
            color: "text-white",
            bgColor: "bg-white/10",
            isPopular: false,
            isActive: true,
            sortOrder: 3,
        },
        {
            id: 4,
            planId: "enterprise",
            planName: "Enterprise",
            monthlyPrice: 8999,
            yearlyPrice: 89990,
            features: [
                "Up to 40,000 messages/month",
                "Custom AI training & workflows",
                "Unlimited WhatsApp numbers",
                "Dedicated success manager",
                "Custom integrations & SLAs",
                "White-label option",
            ],
            limits: {
                messages: 40000,
                whatsappNumbers: -1,
                templates: -1,
                leads: -1,
            },
            icon: "Building2",
            color: "text-white",
            bgColor: "bg-white/10",
            isPopular: false,
            isActive: true,
            sortOrder: 4,
        },
    ];

    // Ensure billing always uses the canonical 4 paid plans & prices,
    // even if the DB still has older rows like "free" or outdated prices.
    const allowedPlanIds = ["starter", "growth", "pro", "enterprise"] as const;
    const canonicalPrices: Record<(typeof allowedPlanIds)[number], number> = {
        starter: 5,
        growth: 1699,
        pro: 3999,
        enterprise: 8999,
    };

    const normalizePlans = (plans: PricingPlan[]): PricingPlan[] => {
        return plans
            .filter((p) => allowedPlanIds.includes(p.planId as any))
            .map((p) => {
                const id = p.planId as (typeof allowedPlanIds)[number];
                const price = canonicalPrices[id];
                return {
                    ...p,
                    monthlyPrice: price,
                };
            })
            .sort(
                (a, b) =>
                    allowedPlanIds.indexOf(a.planId as any) -
                    allowedPlanIds.indexOf(b.planId as any),
            );
    };

    const plans =
        plansFromDB && plansFromDB.length > 0
            ? normalizePlans(plansFromDB as PricingPlan[])
            : fallbackPlans;
    const activePlan = plans.find((p) => p.planId === subscription.plan) || plans[0];

    // Helper to get icon component
    const getIcon = (iconName: string | undefined) => {
        if (!iconName) return Package;
        return iconMap[iconName] || Package;
    };

    const ActiveIcon = getIcon(activePlan?.icon);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Load Razorpay script
    // const { isLoading: isScriptLoading } = useScript("https://checkout.razorpay.com/v1/checkout.js"); // Assuming useScript hook exists or we just rely on Next.js Script in layout

    const handleUpgrade = async (plan: PricingPlan) => {
        // Prevent upgrading to same plan
        if (plan.planId === subscription.plan) return;

        // Prevent upgrading to free plan (downgrade logic should be different)
        if (plan.planId === 'starter' || plan.planId === 'free') {
            toast.error("Please contact support to downgrade your plan.");
            return;
        }

        toast.loading(`Initializing payment for ${plan.planName}...`);

        try {
            // 1. Create Order
            const res = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.planId,
                    billingCycle: 'monthly', // Defaulting to monthly for now
                    amount: plan.monthlyPrice, // Passed in Rupees
                })
            });

            if (!res.ok) throw new Error("Failed to create order");

            const orderData = await res.json();

            // 2. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Ensure this env var is available
                amount: orderData.amount,
                currency: orderData.currency,
                name: "WaveGroww",
                description: `Upgrade to ${plan.planName} Plan`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    toast.loading("Verifying payment...");
                    try {
                        // 3. Verify Payment
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planId: plan.planId,
                                billingCycle: 'monthly',
                                amount: plan.monthlyPrice
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            toast.success("Payment Successful! Upgrading plan...");
                            window.location.reload();
                        } else {
                            toast.error("Payment verification failed. Please contact support.");
                        }
                    } catch (error) {
                        console.error("Verification error", error);
                        toast.error("Payment verification failed");
                    }
                },
                prefill: {
                    // name: "User Name", // We could prefill if we have user context
                    // email: "user@example.com",
                    // contact: "9999999999"
                },
                notes: {
                    plan: plan.planId
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast.error(`Payment Failed: ${response.error.description}`);
            });
            rzp.open();
            toast.dismiss();

        } catch (error) {
            console.error(error);
            toast.error("Failed to initiate payment");
        }
    };

    const handleCancelSubscription = () => {
        if (confirm("Are you sure you want to cancel your subscription?")) {
            setSubscription({ ...subscription, cancelAtPeriodEnd: true });
            toast.success("Your subscription will be cancelled at the end of the billing period.");
        }
    };

    if (isLoading) {
        return (
            <div className="glass-card p-12 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="glass-card p-6 rounded-2xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Billing & Plans</h2>
                <p className="text-muted-foreground text-sm">
                    Manage your subscription and billing information
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Every paid plan starts with a 3-day limited-feature trial — no card required.
                </p>
                {/* Trial Button */}
                {(activePlan?.planId === 'starter' || activePlan?.planId === 'free') && (
                    <button
                        onClick={async () => {
                            if (confirm("Start your 3-Day Free Trial? You will get limited access to paid features.")) {
                                try {
                                    const res = await fetch('/api/billing/start-trial', { method: 'POST' });
                                    if (res.ok) {
                                        toast.success("Trial Started! Refreshing...");
                                        window.location.reload();
                                    } else {
                                        const msg = await res.text();
                                        toast.error(msg || "Failed to start trial");
                                    }
                                } catch (e) {
                                    toast.error("Something went wrong");
                                }
                            }
                        }}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 text-black rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                        Start 3-Day Free Trial
                    </button>
                )}
            </div>

            {/* Current Subscription */}
            <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-4">Current Subscription</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${activePlan?.bgColor || "bg-muted"}`}>
                            <ActiveIcon className={`w-5 h-5 ${activePlan?.color || "text-muted-foreground"}`} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Current Plan</p>
                            <p className="font-bold capitalize">{activePlan?.planName || subscription.plan}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className="font-bold capitalize">{subscription.status}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Renewal Date</p>
                            <p className="font-semibold text-sm">{formatDate(subscription.currentPeriodEnd)}</p>
                        </div>
                    </div>
                </div>

                {subscription.cancelAtPeriodEnd && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-destructive">Subscription Cancelled</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Your subscription will end on {formatDate(subscription.currentPeriodEnd)}.
                            </p>
                        </div>
                    </div>
                )}

                {!subscription.cancelAtPeriodEnd && (
                    <div className="mt-4">
                        <button
                            onClick={handleCancelSubscription}
                            className="text-sm px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                            Cancel Subscription
                        </button>
                    </div>
                )}
            </div>

            {/* Available Plans */}
            <div>
                <h3 className="font-semibold mb-4">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {plans.map((plan) => {
                        const Icon = getIcon(plan.icon);
                        const isCurrentPlan = plan.planId === subscription.plan;

                        return (
                            <div
                                key={plan.planId}
                                className={`p-4 border rounded-lg ${plan.isPopular ? "ring-2 ring-primary" : "border-border"
                                    }`}
                            >
                                {plan.isPopular && (
                                    <div className="text-xs font-semibold text-primary mb-2">Most Popular</div>
                                )}

                                <div className={`p-2 rounded-lg ${plan.bgColor || "bg-muted"} w-fit mb-3`}>
                                    <Icon className={`w-5 h-5 ${plan.color || "text-muted-foreground"}`} />
                                </div>

                                <h4 className="font-bold mb-2">{plan.planName}</h4>

                                <div className="mb-3">
                                    {plan.monthlyPrice !== null ? (
                                        <>
                                            <span className="text-2xl font-bold">
                                                ₹{plan.monthlyPrice.toLocaleString("en-IN")}
                                            </span>
                                            <span className="text-sm text-muted-foreground">/month</span>
                                        </>
                                    ) : (
                                        <span className="text-xl font-bold">Custom</span>
                                    )}
                                </div>

                                <ul className="space-y-2 mb-4 text-xs">
                                    {plan.features.slice(0, 3).map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleUpgrade(plan)}
                                    disabled={isCurrentPlan}
                                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${isCurrentPlan
                                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                                        }`}
                                >
                                    {isCurrentPlan ? "Current Plan" : "Upgrade"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
