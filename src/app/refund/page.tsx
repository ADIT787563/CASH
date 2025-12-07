"use client";

import { Footer } from "@/components/home/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RefundPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                <div className="bg-card border border-border rounded-xl p-8 md:p-12 shadow-sm">
                    <h1 className="text-3xl font-bold mb-2">Refund & Cancellation Policy</h1>
                    <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="space-y-8 prose dark:prose-invert max-w-none">
                        <p className="text-lg">
                            WaveGroww provides SaaS tools for businesses. Please read this Refund & Cancellation Policy carefully before purchasing any subscription plan.
                        </p>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">1. Subscription Payments</h2>
                            <p>
                                All payments made for WaveGroww plans (₹999 / ₹1699 / ₹3999 / ₹8999 or any other amount) are final and non-refundable.
                            </p>
                            <p className="mt-2">
                                By completing a purchase, you agree to our Terms of Service and this Refund Policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">2. No Automatic Refunds</h2>
                            <p>
                                Because WaveGroww provides immediate access to premium features after payment, we do not provide:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>No partial refunds</li>
                                <li>No pro-rated refunds</li>
                                <li>No refunds for unused days</li>
                                <li>No refunds if your usage is less than expected</li>
                            </ul>
                            <p className="mt-2 text-primary/90 font-medium">
                                Once access is activated, the subscription amount cannot be reversed.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">3. Exceptional Situations</h2>
                            <p>Refunds may be considered only in these rare cases:</p>
                            <div className="pl-4 mt-3 space-y-4 border-l-2 border-primary/20">
                                <div>
                                    <h3 className="font-semibold text-foreground">a) Duplicate payment</h3>
                                    <p className="text-muted-foreground text-sm">
                                        If you were charged twice for the same plan, we will initiate a refund after verifying both payment IDs.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">b) Payment failed but money deducted</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Refund depends on your bank/UPI provider. In most cases, Razorpay automatically reverses the amount within 5–7 business days.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">c) Technical issues during transaction</h3>
                                    <p className="text-muted-foreground text-sm">
                                        If Razorpay confirms that the transaction was incomplete or unsuccessful, a refund may be initiated.
                                    </p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm bg-muted/50 p-3 rounded-md">
                                <strong>Note:</strong> Refund approval is at the sole discretion of WaveGroww after internal verification.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">4. How to Request a Refund (only for valid cases)</h2>
                            <p className="mb-2">Email us at:</p>
                            <a href="mailto:wavegroww@gmail.com" className="text-primary hover:underline font-medium text-lg">
                                wavegroww@gmail.com
                            </a>

                            <div className="mt-4 p-4 bg-accent/5 rounded-lg border border-accent/10">
                                <p className="font-medium mb-2">Please Include:</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                    <li>Payment ID</li>
                                    <li>Order ID</li>
                                    <li>Registered email</li>
                                    <li>Screenshot of transaction</li>
                                    <li>Reason for requesting a refund</li>
                                </ul>
                            </div>

                            <p className="mt-4 text-sm">
                                <strong>Refund processing time:</strong> 5–10 business days after approval.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">5. Cancellation of Subscription</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>You may cancel future renewals anytime through your dashboard or by contacting support.</li>
                                <li>Cancelling a subscription does not refund the current billing cycle.</li>
                                <li>After cancellation, your plan remains active until the end of the paid period.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">6. Refunds for Promotional or Discounted Plans</h2>
                            <p>Payments made under:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-muted-foreground">
                                <li>Special discounts</li>
                                <li>Limited-time offers</li>
                                <li>Trial upgrades</li>
                                <li>Promo codes</li>
                            </ul>
                            <p className="mt-2 text-destructive font-medium">
                                …are strictly non-refundable.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">7. Chargebacks</h2>
                            <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg">
                                <p className="font-medium text-destructive mb-2">If you file a chargeback without contacting support:</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                    <li>Your account may be suspended</li>
                                    <li>All services may be locked</li>
                                    <li>Future access may require additional verification</li>
                                </ul>
                                <p className="mt-3 font-medium">
                                    Please contact WaveGroww support to resolve any issue before raising a dispute.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">8. Contact Information</h2>
                            <div className="grid gap-1">
                                <p>For refund/cancellation support:</p>
                                <p><strong>Email:</strong> <a href="mailto:wavegroww@gmail.com" className="text-primary hover:underline">wavegroww@gmail.com</a></p>
                                <p><strong>Business Hours:</strong> 10 AM – 6 PM (IST)</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
