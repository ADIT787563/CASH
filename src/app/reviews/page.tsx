"use client";

import { Star, MessageSquare, ArrowLeft, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Footer } from "@/components/home/Footer";

const allReviews = [
    {
        name: "Priya Sharma",
        role: "Meesho Seller",
        quote: "WaveGroww increased my conversions by 3x! The AI chatbot handles everything while I sleep. It understands Hinglish perfectly.",
        location: "Jaipur, Rajasthan",
        date: "2 days ago",
        rating: 5,
        avatar: "P"
    },
    {
        name: "Rajesh Kumar",
        role: "Shopify Store Owner",
        quote: "The auto-catalog feature saved me 10 hours a week. No more manual link sharing. Highly recommend for Indian sellers!",
        location: "Surat, Gujarat",
        date: "1 week ago",
        rating: 5,
        avatar: "R"
    },
    {
        name: "Anita Desai",
        role: "Local Shop Owner",
        quote: "Finally, a tool built for Indian businesses. The Hindi support is perfect! My customers feel like they are talking to a human.",
        location: "Pune, Maharashtra",
        date: "3 days ago",
        rating: 5,
        avatar: "A"
    },
    {
        name: "Vikram Singh",
        role: "Wholesaler",
        quote: "Bulk catalog sharing on WhatsApp was a pain. WaveGroww made it one-click. Best investment this year.",
        location: "Delhi NCR",
        date: "5 days ago",
        rating: 4,
        avatar: "V"
    },
    {
        name: "Sanya Malhotra",
        role: "Boutique Owner",
        quote: "The lead collection is a lifesaver. I never lose a customer number now. 100% recommended for small brands.",
        location: "Chandigarh",
        date: "1 week ago",
        rating: 5,
        avatar: "S"
    }
];

export default function ReviewsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="py-12 border-b border-border bg-muted/20">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold mb-8 hover:underline">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                Seller <span className="gradient-text">Trust 2k+</span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl">
                                See why thousands of Indian sellers rely on WaveGroww to automate their WhatsApp business.
                            </p>
                        </div>
                        <button className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black shadow-xl hover:shadow-primary/20 transition-all hover:scale-105">
                            <Plus className="w-5 h-5" />
                            Add Your Review
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 bg-card border border-border p-10 rounded-[2.5rem] shadow-sm">
                    <div className="text-center">
                        <div className="text-4xl font-black text-primary mb-1">4.9/5</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Average Rating</div>
                    </div>
                    <div className="text-center border-l border-border">
                        <div className="text-4xl font-black text-primary mb-1">2,100+</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Certified Reviews</div>
                    </div>
                    <div className="text-center border-l border-border">
                        <div className="text-4xl font-black text-primary mb-1">98%</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Seller Satisfaction</div>
                    </div>
                    <div className="text-center border-l border-border">
                        <div className="text-4xl font-black text-primary mb-1">15+</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Indian Cities</div>
                    </div>
                </div>

                {/* Reviews Grid */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {allReviews.map((review, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="break-inside-avoid bg-card border border-border p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex gap-1 mb-6 text-amber-400">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <p className="text-muted-foreground font-medium mb-8 leading-relaxed italic">
                                "{review.quote}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                    {review.avatar}
                                </div>
                                <div className="text-left overflow-hidden">
                                    <p className="font-bold truncate">{review.name}</p>
                                    <p className="text-xs text-muted-foreground font-medium truncate">{review.role} • {review.location}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
}
