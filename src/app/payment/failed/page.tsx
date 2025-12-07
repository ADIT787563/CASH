"use client";

import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PaymentFailedPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
                    {/* Error Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="bg-red-500/10 rounded-full p-6">
                                <XCircle className="w-16 h-16 text-red-500" />
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Payment Failed
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        We couldn't process your payment. Don't worry, you haven't been charged.
                    </p>

                    {/* Common Reasons */}
                    <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-primary" />
                            Common reasons for payment failure
                        </h2>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Insufficient funds in your account</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Incorrect card details or expired card</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Payment declined by your bank</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Network or connection issues</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Card not enabled for online transactions</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <button
                            onClick={() => router.back()}
                            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>
                        <Link
                            href="/plans"
                            className="px-8 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors inline-flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Plans
                        </Link>
                    </div>

                    {/* Help Section */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                        <h3 className="font-semibold mb-2">Need help?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            If you continue to experience issues, please contact our support team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                                href="mailto:support@wavegroww.com"
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
                            >
                                Email Support
                            </a>
                            <a
                                href="https://wa.me/919876543210"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors inline-flex items-center justify-center gap-2"
                            >
                                WhatsApp Support
                            </a>
                        </div>
                    </div>

                    {/* Alternative Payment */}
                    <div className="mt-8 pt-8 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            You can also try using a different payment method or contact your bank for assistance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
