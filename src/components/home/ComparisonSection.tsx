
"use client";

import { CheckCircle2, XCircle } from "lucide-react";

export function ComparisonSection() {
    const comparisonData = [
        {
            feature: "Setup Time",
            wavegroww: "Under 2 Minutes",
            others: "Hours or Days",
        },
        {
            feature: "Coding Required",
            wavegroww: "Zero Coding",
            others: "Requires Developer",
        },
        {
            feature: "WhatsApp Integration",
            wavegroww: "One-Click Scan",
            others: "Complex API Approval",
        },
        {
            feature: "Pricing",
            wavegroww: "Affordable Flat Rates",
            others: "Per-Message Markup",
        },
        {
            feature: "Catalog Management",
            wavegroww: "Auto-Sync & Bulk Upload",
            others: "Manual Entry",
        },
        {
            feature: "Support",
            wavegroww: "24/7 Indian Support",
            others: "Email Only / Slow",
        },
        {
            feature: "User Interface",
            wavegroww: "Modern & Simple",
            others: "Cluttered & Tech-Heavy",
        },
    ];

    return (
        <section className="py-20 lg:py-32 bg-background">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Why Choose <span className="gradient-text">WaveGroww</span>?
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        We built this platform to solve the problems others ignore.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-0 border border-border rounded-3xl overflow-hidden shadow-lg">
                    {/* Others Column */}
                    <div className="bg-muted/30 p-8 md:p-12">
                        <h3 className="text-2xl font-bold mb-8 text-center text-muted-foreground">Other Platforms</h3>
                        <div className="space-y-8">
                            {comparisonData.map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                                    <div className="text-left">
                                        <p className="font-semibold text-muted-foreground">{item.feature}</p>
                                        <p className="text-sm text-muted-foreground/80">{item.others}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* WaveGroww Column */}
                    <div className="bg-primary/5 p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent opacity-50" />
                        <h3 className="text-2xl font-bold mb-8 text-center text-primary relative z-10">WaveGroww</h3>
                        <div className="space-y-8 relative z-10">
                            {comparisonData.map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                                    <div className="text-left">
                                        <p className="font-semibold text-foreground">{item.feature}</p>
                                        <p className="text-sm font-medium text-primary">{item.wavegroww}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
