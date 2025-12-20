"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { motion, Variants } from "framer-motion";

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
        <section className="py-24 lg:py-36 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center mb-20"
                >
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">
                        Why Choose <span className="gradient-text">WaveGroww</span>?
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        We built this platform to solve the real-world problems that other legacy providers ignore.
                    </p>
                </motion.div>

                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-0 border border-border rounded-[2.5rem] overflow-hidden shadow-2xl bg-card">
                    {/* Others Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-muted/30 p-10 md:p-14 border-b md:border-b-0 md:border-r border-border"
                    >
                        <h3 className="text-2xl font-black mb-12 text-center text-muted-foreground uppercase tracking-widest">Other Platforms</h3>
                        <div className="space-y-10">
                            {comparisonData.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-5"
                                >
                                    <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                                    <div className="text-left">
                                        <p className="font-bold text-lg text-muted-foreground/60">{item.feature}</p>
                                        <p className="text-base text-muted-foreground/80">{item.others}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* WaveGroww Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-primary/[0.03] p-10 md:p-14 relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent opacity-50 transition-opacity group-hover:opacity-80" />
                        <h3 className="text-2xl font-black mb-12 text-center text-primary relative z-10 uppercase tracking-widest">WaveGroww</h3>
                        <div className="space-y-10 relative z-10">
                            {comparisonData.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ x: 5 }}
                                    className="flex items-start gap-5"
                                >
                                    <CheckCircle2 className="w-7 h-7 text-success flex-shrink-0 mt-0.5 shadow-sm" />
                                    <div className="text-left">
                                        <p className="font-black text-lg text-foreground">{item.feature}</p>
                                        <p className="text-base font-bold text-primary tracking-wide">{item.wavegroww}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
