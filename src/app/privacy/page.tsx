import React from 'react';
import { Footer } from "@/components/home/Footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
                    <p className="text-muted-foreground mb-8">
                        Last Updated: {new Date().toLocaleDateString()}
                    </p>

                    <div className="glass-card p-6 rounded-xl mb-8 border-l-4 border-primary">
                        <p className="text-muted-foreground mb-3">
                            Wavegroww ("we", "our", "us") is committed to protecting your privacy.
                            This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform ("Service").
                        </p>
                        <p className="text-muted-foreground font-medium">
                            By accessing or using Wavegroww, you agree to this Privacy Policy.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Section 1 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">1.1 Personal Information</h3>
                                    <p className="text-muted-foreground mb-2">We may collect the following personal details when you create an account or use the Service:</p>
                                    <ul className="space-y-1 text-muted-foreground list-disc list-inside ml-4">
                                        <li>Full name</li>
                                        <li>Email address</li>
                                        <li>Phone number</li>
                                        <li>Business name and details</li>
                                        <li>Address or location (if provided)</li>
                                        <li>Password (encrypted)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">1.2 Business & Operational Data</h3>
                                    <ul className="space-y-1 text-muted-foreground list-disc list-inside ml-4">
                                        <li>Product details</li>
                                        <li>Catalog information</li>
                                        <li>Customer information added by you</li>
                                        <li>Prices, invoices, and order details</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">1.3 Technical Information</h3>
                                    <ul className="space-y-1 text-muted-foreground list-disc list-inside ml-4">
                                        <li>IP address</li>
                                        <li>Browser type and device information</li>
                                        <li>Login and activity logs</li>
                                        <li>Cookies and similar technologies</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">1.4 Payment Information</h3>
                                    <p className="text-muted-foreground mb-1">We do not store card or bank details directly.</p>
                                    <p className="text-muted-foreground italic">All payment data is handled securely by third-party payment processors.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                            <p className="text-muted-foreground mb-3">We use your information for:</p>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                <li>Account creation and authentication</li>
                                <li>Operating and improving the Platform</li>
                                <li>Managing products, catalogues, analytics, and automation tools</li>
                                <li>Customer communications (emails, notifications, alerts)</li>
                                <li>Processing payments for subscription plans</li>
                                <li>Security, fraud detection, and misuse prevention</li>
                                <li>Legal compliance</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">3. How We Share Your Information</h2>
                            <p className="text-muted-foreground mb-3">We may share information only with:</p>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside mb-4">
                                <li>Service providers (hosting, email services, analytics, payment gateways).</li>
                                <li>Legal authorities, if required by law or court order.</li>
                                <li>Business partners, only with your permission.</li>
                            </ul>
                            <p className="text-muted-foreground font-semibold">We do not sell your data to any third party.</p>
                        </section>

                        {/* Section 4 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">4. Cookies & Tracking Technologies</h2>
                            <p className="text-muted-foreground mb-3">We use cookies to:</p>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside mb-4">
                                <li>Keep you logged in</li>
                                <li>Improve user experience</li>
                                <li>Analyse performance</li>
                                <li>Save preferences (theme, language, settings)</li>
                            </ul>
                            <p className="text-muted-foreground italic">You can disable cookies in your browser, but some features may not work properly.</p>
                        </section>

                        {/* Section 5 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
                            <p className="text-muted-foreground mb-3">We implement:</p>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside mb-4">
                                <li>Encrypted passwords</li>
                                <li>HTTPS and SSL protection</li>
                                <li>Firewall and server-level security</li>
                                <li>Regular monitoring for suspicious activity</li>
                            </ul>
                            <p className="text-muted-foreground italic">No system can guarantee 100% protection, but we take strong steps to safeguard your data.</p>
                        </section>

                        {/* Section 6 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
                            <p className="text-muted-foreground mb-3">We retain your information as long as your account is active.</p>
                            <p className="text-muted-foreground mb-2 font-medium">After account deletion:</p>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                <li>Your data may be permanently removed</li>
                                <li>Some data may remain for legal obligations (tax, audit, compliance)</li>
                            </ul>
                        </section>

                        {/* Section 7 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
                            <p className="text-muted-foreground mb-3">You may request to:</p>
                            <ul className="space-y-2 text-muted-foreground list-disc list-inside mb-4">
                                <li>Access your data</li>
                                <li>Update incorrect information</li>
                                <li>Delete your account</li>
                                <li>Disable communications</li>
                                <li>Withdraw consent</li>
                            </ul>
                            <p className="text-muted-foreground italic">Requests can be made through support.</p>
                        </section>

                        {/* Section 8 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
                            <p className="text-muted-foreground mb-2">Wavegroww is not intended for individuals under 18 years of age.</p>
                            <p className="text-muted-foreground">We do not knowingly collect data from minors.</p>
                        </section>

                        {/* Section 9 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">9. International Transfers</h2>
                            <p className="text-muted-foreground mb-2">Your data may be processed in servers located inside or outside India.</p>
                            <p className="text-muted-foreground">By using the Platform, you consent to such transfers.</p>
                        </section>

                        {/* Section 10 */}
                        <section className="glass-card p-6 rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">10. Changes to This Privacy Policy</h2>
                            <p className="text-muted-foreground mb-2">We may update this Privacy Policy occasionally.</p>
                            <p className="text-muted-foreground">Continued use of the Service means you accept the updated policy.</p>
                        </section>

                        {/* Section 11 */}
                        <section className="glass-card p-6 rounded-xl border-l-4 border-primary">
                            <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
                            <p className="text-muted-foreground mb-2">For questions or concerns, contact us at:</p>
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
