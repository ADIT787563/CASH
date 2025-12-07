import React from 'react';
import { Footer } from "@/components/home/Footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
                    <p className="text-muted-foreground mb-8">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <div className="space-y-8">
                        {/* Section 1 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">1. Eligibility</h2>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                <li>You must be at least 18 years old.</li>
                                <li>You must provide correct and updated personal or business information.</li>
                                <li>You may not impersonate another individual or entity.</li>
                            </ul>
                        </section>

                        {/* Section 2 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">2. Account Registration</h2>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside mb-4">
                                <li>You are responsible for your login credentials.</li>
                                <li>You are responsible for any activity performed using your account.</li>
                            </ul>
                            <p className="text-muted-foreground mb-2 font-medium">We may suspend or terminate your account if:</p>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                                <li>False or misleading information is provided</li>
                                <li>You violate these Terms</li>
                                <li>Fraudulent or abusive activity is detected</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">3. Services Provided</h2>
                            <p className="text-muted-foreground mb-3">Wavegroww provides tools for businesses to:</p>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside mb-4">
                                <li>Manage catalogues, products, customers</li>
                                <li>Use marketing and automation tools</li>
                                <li>Access analytics and billing</li>
                                <li>Use built-in communications and business features</li>
                            </ul>
                            <p className="text-muted-foreground italic">We may modify, improve, or remove features at any time.</p>
                        </section>

                        {/* Section 4 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">4. Acceptable Use</h2>
                            <p className="text-muted-foreground mb-3 font-medium">You agree NOT to:</p>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                <li>Use the Platform for illegal or harmful activity.</li>
                                <li>Upload malware or harmful scripts.</li>
                                <li>Copy, reverse engineer, resell, or distribute the Platform's code or design.</li>
                                <li>Spam users or customers.</li>
                                <li>Use fake identity, fake business details, or misleading information.</li>
                            </ul>
                        </section>

                        {/* Section 5 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">5. Plans, Pricing & Payments</h2>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                <li>All prices are listed on the official pricing page.</li>
                                <li>Paid plans renew automatically unless cancelled.</li>
                                <li>Payment failures may result in temporary suspension of services.</li>
                                <li>Payments made are non-refundable unless required by law.</li>
                            </ul>
                        </section>

                        {/* Section 6 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">6. User Content</h2>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                <li>You retain ownership of content you upload (images, products, business info).</li>
                                <li>You allow Wavegroww to store and process your content to operate the platform.</li>
                                <li>You must ensure your content is lawful and does not infringe any rights.</li>
                            </ul>
                        </section>

                        {/* Section 7 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">7. Data & Privacy</h2>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                <li>Your data is processed according to our Privacy Policy.</li>
                                <li>We take reasonable security measures but cannot guarantee complete protection.</li>
                                <li>We may use anonymised, aggregated data for improvement and analytics.</li>
                            </ul>
                        </section>

                        {/* Section 8 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
                            <p className="text-muted-foreground mb-3 font-medium">Wavegroww may suspend or terminate your account if:</p>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside mb-4">
                                <li>You violate these Terms</li>
                                <li>Fraud or abuse is detected</li>
                                <li>Required by law</li>
                            </ul>
                            <p className="text-muted-foreground">You may delete your account anytime. After deletion, data may be permanently removed.</p>
                        </section>

                        {/* Section 9 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
                            <p className="text-muted-foreground mb-3">Wavegroww is offered "as-is" without warranties.</p>
                            <p className="text-muted-foreground mb-2 font-medium">We are not responsible for:</p>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside mb-4">
                                <li>Loss of business, revenue, or profits</li>
                                <li>Service downtime or errors</li>
                                <li>Data loss</li>
                                <li>Issues caused by your device, network, or misuse</li>
                            </ul>
                            <p className="text-muted-foreground italic">You use the Platform at your own risk.</p>
                        </section>

                        {/* Section 10 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                <li>We may update these Terms anytime.</li>
                                <li>If you continue using the Platform after changes, it means you accept the revised Terms.</li>
                            </ul>
                        </section>

                        {/* Section 11 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">11. Governing Law</h2>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                <li>These Terms are governed by the laws of India.</li>
                                <li>Disputes will be handled by the courts in your local jurisdiction.</li>
                            </ul>
                        </section>

                        {/* Section 12 */}
                        <section className="glass-card p-6 rounded-xl border-l-4 border-primary">
                            <h2 className="text-2xl font-bold mb-4">12. Contact</h2>
                            <p className="text-muted-foreground mb-2">For any questions:</p>
                            <a href="mailto:WaveGroww@gmail.com" className="text-primary font-semibold hover:underline">
                                WaveGroww@gmail.com
                            </a>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
