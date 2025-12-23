"use client";

import { Check, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const plans = [
    {
        id: "starter",
        name: "Basic",
        price: 999,
        tagline: "Ideal for new sellers",
        features: [
            "Up to 20 products",
            "250 auto-replies/mo",
            "1 WhatsApp Number",
            "Basic Auto-invoice",
            "Basic Analytics",
            "No AI Generation" // Explicitly mention absence or keep hidden
        ],
        popular: false,
        cta: "Start Free Trial"
    },
    {
        id: "growth",
        name: "Growth",
        price: 1699,
        tagline: "Perfect for scaling sellers",
        features: [
            "Up to 40 products",
            "800 auto-replies/mo",
            "3 WhatsApp Numbers",
            "5 AI Templates/mo", // New Limit
            "Revenue Analytics",
            "Abandoned Cart Recovery"
        ],
        popular: false,
        cta: "Start Free Trial"
    },
    {
        id: "pro",
        name: "Pro / Agency",
        price: 2499, // Fixing price while I'm here
        tagline: "For high-volume stores",
        features: [
            "Up to 130 products",
            "Unlimited auto-replies",
            "Unlimited AI Templates", // Unlimited
            "10 WhatsApp Numbers",
            "Branded Invoices",
            "Multi-Agent Support"
        ],
        popular: true,
        cta: "Subscribe Now"
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: 8999,
        tagline: "Custom solution for brands",
        features: [
            "Unlimited Products",
            "AI Chatbot (NLP)",
            "Unlimited AI Templates",
            "Dedicated Manager",
            "ERP / CRM Sync",
            "White-label Option"
        ],
        popular: false,
        cta: "Contact Sales"
    }
];

export function PricingSection() {
    return (
        <section id="pricing" className="py-24 lg:py-36 bg-transparent relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-primary uppercase tracking-widest">Pricing Plans</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
                    >
                        Simple, <span className="gradient-text">Transparent Pricing</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-muted-foreground"
                    >
                        Choose the plan that fits your business. Scale as you grow.
                        <br />
                        <span className="text-sm font-semibold text-primary/80 mt-2 block">
                            ✨ 3-day limited-feature trial for every plan — no card required
                        </span>
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className={`relative glass-card p-8 rounded-[2.5rem] border border-border flex flex-col h-full ${plan.popular ? "border-primary shadow-primary/10 shadow-2xl" : ""
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground font-medium">{plan.tagline}</p>
                            </div>

                            <div className="mb-8 flex items-baseline gap-1">
                                <span className="text-5xl font-black">₹{plan.price.toLocaleString()}</span>
                                <span className="text-muted-foreground font-bold">/mo</span>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1 text-left">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-primary stroke-[3]" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground/80">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.id === "enterprise" ? "/contact" : `/register?plan=${plan.id}`}
                                className={`w-full py-4 rounded-2xl font-black text-center transition-all flex items-center justify-center gap-2 group ${plan.popular
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl"
                                    : "bg-foreground text-background hover:opacity-90"
                                    }`}
                            >
                                {plan.cta}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <Link
                        href="/plans"
                        className="text-primary font-black hover:underline inline-flex items-center gap-2"
                    >
                        Compare All Features <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
