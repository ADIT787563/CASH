"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planName = searchParams.get('plan') || 'Pro';

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
                    {/* Success Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                            <div className="relative bg-green-500/10 rounded-full p-6">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Payment Successful! 🎉
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        Welcome to the {planName} plan! Your subscription is now active.
                    </p>

                    {/* What's Next */}
                    <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            What's next?
                        </h2>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-primary">1</span>
                                </div>
                                <div>
                                    <p className="font-medium">Check your email</p>
                                    <p className="text-sm text-muted-foreground">
                                        We've sent you a confirmation email with your receipt and plan details.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-primary">2</span>
                                </div>
                                <div>
                                    <p className="font-medium">Explore your dashboard</p>
                                    <p className="text-sm text-muted-foreground">
                                        Access all the premium features and start growing your business.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-primary">3</span>
                                </div>
                                <div>
                                    <p className="font-medium">Need help?</p>
                                    <p className="text-sm text-muted-foreground">
                                        Our support team is here to help you get started.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/dashboard"
                            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
                        >
                            Go to Dashboard
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/settings/billing"
                            className="px-8 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors inline-flex items-center justify-center gap-2"
                        >
                            View Billing
                        </Link>
                    </div>

                    {/* Support */}
                    <div className="mt-8 pt-8 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            Questions? Contact our support team at{' '}
                            <a href="mailto:support@wavegroww.com" className="text-primary hover:underline">
                                support@wavegroww.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}
