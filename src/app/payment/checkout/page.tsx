"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CreditCard, Shield, Lock, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
    description: string;
}

const PLANS: Record<string, Plan> = {
    basic: {
        id: 'basic',
        name: 'Basic',
        price: 999,
        description: 'Ideal for new sellers starting automation',
        features: [
            'Add up to 20 products',
            'Single image per product',
            '250 automated replies/mo',
            '1 WhatsApp Number linking',
            'Basic order form',
            'Auto-invoice (Simple, No GST)',
            'Basic Analytics',
            'Single user access',
            'Basic Email support'
        ]
    },
    growth: {
        id: 'growth',
        name: 'Growth',
        price: 1699,
        description: 'Perfect for sellers scaling to mid-level business',
        features: [
            'Add up to 40 products',
            'Variants & Multi-image support',
            '800 automated replies/mo',
            'Connect up to 3 WhatsApp Numbers',
            'Custom checkout fields',
            'Advanced Invoice (GST, PDF)',
            'Revenue chart & Top customers'
        ]
    },
    pro: {
        id: 'pro',
        name: 'Pro / Agency',
        price: 5,
        description: 'For agencies, large stores, and professional sellers',
        features: [
            'Add up to 130 products',
            'Bulk upload (CSV/Excel)',
            'Unlimited automated replies',
            'AI-powered auto-reply',
            'Connect up to 10 WhatsApp numbers',
            'Branded Invoices (Logo + Colors)',
            'Full Analytics & Conversion rates',
            'Up to 10 team members'
        ]
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 8999,
        description: 'For large businesses & D2C brands',
        features: [
            'Custom catalog limit (200-Unlimited)',
            'AI Chatbot (NLP) & Smart Replies',
            'Multi-language NLP auto-replies',
            'Unlimited WhatsApp numbers',
            'Fully customizable checkout API',
            'White-label & Custom Invoices',
            'BI Dashboard & Custom Reports'
        ]
    }
};

function PaymentContent() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get('plan') || 'growth';

    const [isProcessing, setIsProcessing] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const plan = PLANS[planId] || PLANS.growth;
    const basePrice = plan.price;
    const yearlyPrice = basePrice * 12 * 0.8; // 20% discount for yearly
    const finalPrice = billingCycle === 'yearly' ? yearlyPrice : basePrice;
    const discountedPrice = finalPrice - (finalPrice * discount / 100);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isPending && !session?.user) {
            router.push(`/login?redirect=/payment?plan=${planId}`);
        }
    }, [session, isPending, router, planId]);

    const handleApplyCoupon = () => {
        // Mock coupon validation
        if (couponCode.toUpperCase() === 'SAVE10') {
            setDiscount(10);
        } else if (couponCode.toUpperCase() === 'SAVE20') {
            setDiscount(20);
        } else {
            alert('Invalid coupon code');
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            // Load Razorpay script
            const res = await loadRazorpayScript();
            if (!res) {
                alert('Razorpay SDK failed to load. Please check your internet connection.');
                setIsProcessing(false);
                return;
            }

            // Create order on backend
            const response = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planId: plan.id,
                    billingCycle,
                    amount: discountedPrice,
                    couponCode: discount > 0 ? couponCode : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create order');
            }

            // Initialize Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy', // Replace with actual key
                amount: data.amount,
                currency: data.currency,
                name: 'WaveGroww',
                description: `${plan.name} Plan - ${billingCycle}`,
                order_id: data.orderId,
                handler: async function (response: any) {
                    // Verify payment on backend
                    const verifyResponse = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: plan.id,
                            billingCycle,
                        }),
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyResponse.ok) {
                        router.push(`/payment/success?plan=${plan.id}&invoiceId=${verifyData.invoiceId}`);
                    } else {
                        console.error("Payment Verification Failed:", verifyData);
                        const errorMessage = verifyData.error || 'Verification Failed';
                        const errorDetail = verifyData.detail || '';
                        router.push(`/payment/failed?reason=${encodeURIComponent(errorMessage)}&detail=${encodeURIComponent(errorDetail)}`);
                    }
                },
                prefill: {
                    name: session?.user?.name || '',
                    email: session?.user?.email || '',
                },
                theme: {
                    color: '#3b82f6',
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                        const from = searchParams.get('from');
                        if (from === 'onboarding') {
                            router.push('/onboarding/step-4-plans');
                        } else {
                            // query param "cancel=true" could be useful optionally
                            // router.push('/plans'); // Or stay on checkout?
                            // User asked to "redirect to plan page back"
                            // Default behavior if not from onboarding? Maybe back to previous page?
                            // Let's stick to /plans as safe default or just nothing if we want them to retry. 
                            // But usually cancellation means "I want to go back".
                            // Let's keep it safe:
                            // If specific from param, go there.
                            // Else stay on page so they can retry or click "Back to Plans" manually?
                            // The user user specifically said "if user cancel the payment again redirect to plan page back".
                            // So I will redirect.
                            router.push('/plans');
                        }
                    }
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back Button */}
                <Link
                    href="/plans"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Plans
                </Link>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Plan Details */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
                            <p className="text-muted-foreground">
                                You're subscribing to the {plan.name} plan
                            </p>
                        </div>

                        {/* Plan Summary Card */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold">{plan.name}</h2>
                                    <p className="text-muted-foreground">{plan.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">
                                        ₹{billingCycle === 'yearly' ? Math.round(yearlyPrice) : basePrice}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                                    </div>
                                </div>
                            </div>

                            {/* Billing Cycle Toggle */}
                            <div className="bg-muted rounded-lg p-1 grid grid-cols-2 gap-1 mb-6">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`py-2 px-4 rounded-md font-medium transition-colors ${billingCycle === 'monthly'
                                        ? 'bg-background shadow-sm'
                                        : 'hover:bg-background/50'
                                        }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`py-2 px-4 rounded-md font-medium transition-colors ${billingCycle === 'yearly'
                                        ? 'bg-background shadow-sm'
                                        : 'hover:bg-background/50'
                                        }`}
                                >
                                    Yearly
                                    <span className="ml-2 text-xs text-green-600 font-semibold">Save 20%</span>
                                </button>
                            </div>

                            {/* Features List */}
                            <div className="space-y-3">
                                <h3 className="font-semibold mb-3">What's included:</h3>
                                {plan.features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center text-center p-4 bg-card border border-border rounded-lg">
                                <Shield className="w-8 h-8 text-primary mb-2" />
                                <span className="text-xs text-muted-foreground">Secure Payment</span>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 bg-card border border-border rounded-lg">
                                <Lock className="w-8 h-8 text-primary mb-2" />
                                <span className="text-xs text-muted-foreground">SSL Encrypted</span>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 bg-card border border-border rounded-lg">
                                <CreditCard className="w-8 h-8 text-primary mb-2" />
                                <span className="text-xs text-muted-foreground">All Cards</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Payment Form */}
                    <div className="space-y-6">
                        {/* Coupon Code */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="font-semibold mb-4">Have a coupon code?</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter code"
                                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    className="px-6 py-2 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                            {discount > 0 && (
                                <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    {discount}% discount applied!
                                </div>
                            )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="font-semibold mb-4">Order Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">₹{finalPrice.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount ({discount}%)</span>
                                        <span>-₹{(finalPrice * discount / 100).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>₹{discountedPrice.toFixed(2)}</span>
                                </div>
                                {billingCycle === 'yearly' && (
                                    <p className="text-xs text-muted-foreground">
                                        Billed annually. Next billing date: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Payment Button */}
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    Proceed to Payment
                                </>
                            )}
                        </button>

                        {/* Payment Methods */}
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-3">We accept</p>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
                                    Credit Card
                                </div>
                                <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
                                    Debit Card
                                </div>
                                <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
                                    UPI
                                </div>
                                <div className="px-4 py-2 bg-card border border-border rounded text-xs font-medium">
                                    Net Banking
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <p className="text-xs text-muted-foreground text-center">
                            By completing this purchase, you agree to our{' '}
                            <Link href="/terms" className="text-primary hover:underline">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-primary hover:underline">
                                Privacy Policy
                            </Link>
                            . You can cancel anytime from your account settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
            <PaymentContent />
        </Suspense>
    );
}
