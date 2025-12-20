"use client";

import { Star, MessageSquare, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const testimonials = [
    {
        name: "Priya Sharma",
        role: "Meesho Seller",
        quote: "WaveGroww increased my conversions by 3x! The AI chatbot handles everything while I sleep.",
        avatar: "P",
        rating: 5
    },
    {
        name: "Rajesh Kumar",
        role: "Shopify Store Owner",
        quote: "The auto-catalog feature saved me 10 hours a week. Highly recommend for Indian sellers!",
        avatar: "R",
        rating: 5
    },
    {
        name: "Anita Desai",
        role: "Local Shop Owner",
        quote: "Finally, a tool built for Indian businesses. The Hindi support is perfect!",
        avatar: "A",
        rating: 5
    }
];

export function TestimonialsSection() {
    return (
        <section className="py-24 lg:py-36 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
                    >
                        Loved by <span className="gradient-text">Indian Sellers</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground"
                    >
                        Join thousands of successful sellers using WaveGroww
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                    {testimonials.map((t, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="glass-card p-8 rounded-[2rem] border border-border flex flex-col"
                        >
                            <div className="flex gap-1 mb-6 text-amber-400">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current" />
                                ))}
                            </div>

                            <p className="text-lg font-medium italic text-foreground/80 mb-8 flex-1">
                                "{t.quote}"
                            </p>

                            <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black shadow-lg">
                                    {t.avatar}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-foreground">{t.name}</p>
                                    <p className="text-sm text-muted-foreground font-medium">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link
                        href="/reviews"
                        className="inline-flex items-center gap-2 text-primary font-black hover:underline"
                    >
                        Read All 2k+ Reviews <MessageSquare className="w-5 h-5" />
                    </Link>
                    <Link
                        href="/reviews#add"
                        className="inline-flex items-center gap-3 px-8 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-bold transition-all shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add Your Review
                    </Link>
                </div>
            </div>
        </section>
    );
}
