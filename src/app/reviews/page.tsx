"use client";

import { useState } from "react";
import { Star, Quote, ArrowRight, Send } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/home/Footer";

// Mock data for reviews
const REVIEWS = [
    {
        id: 1,
        name: "Rahul Sharma",
        business: "Fashion Hub",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
        rating: 5,
        text: "WaveGroww has completely transformed how I handle customer queries. The AI chatbot is incredibly accurate and handles 90% of my messages automatically.",
        date: "2 days ago"
    },
    {
        id: 2,
        name: "Priya Patel",
        business: "Ethnic Elegance",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
        rating: 5,
        text: "The catalog maker is a game changer! I used to spend hours creating product cards, now it takes seconds. My sales have increased by 40% since I started using it.",
        date: "1 week ago"
    },
    {
        id: 3,
        name: "Amit Kumar",
        business: "Gadget World",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
        rating: 4,
        text: "Great platform for managing leads. The CRM features are simple yet powerful. Highly recommend for any WhatsApp-first business.",
        date: "2 weeks ago"
    },
    {
        id: 4,
        name: "Sneha Gupta",
        business: "Home Decor & More",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
        rating: 5,
        text: "I love the broadcast feature. Sending offers to my customers is so easy now, and the open rates are amazing compared to email.",
        date: "3 weeks ago"
    },
    {
        id: 5,
        name: "Vikram Singh",
        business: "Sports Gear",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
        rating: 5,
        text: "Customer support is top-notch. They helped me set up everything and guided me on how to use the automation features effectively.",
        date: "1 month ago"
    },
    {
        id: 6,
        name: "Anjali Desai",
        business: "Kids Corner",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali",
        rating: 4,
        text: "Very useful tool for small businesses. The pricing is affordable and the features are exactly what we need to scale.",
        date: "1 month ago"
    }
];

export default function ReviewsPage() {
    const [showReviewForm, setShowReviewForm] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="text-sm font-medium text-primary">Trusted by 10,000+ Sellers</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Loved by <span className="gradient-text">Indian Sellers</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        Join thousands of successful sellers who are automating their business and growing sales with WaveGroww.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
                        >
                            Write a Review
                            <Send className="w-4 h-4" />
                        </button>
                        <Link
                            href="/case-studies"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-card text-foreground border border-border rounded-lg font-semibold hover:bg-muted transition-all"
                        >
                            Read More Case Studies
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Review Form (Collapsible) */}
                {showReviewForm && (
                    <div className="max-w-2xl mx-auto mb-16 glass-card p-8 rounded-2xl animate-fade-in">
                        <h3 className="text-2xl font-bold mb-6">Share your experience</h3>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Review submitted! (Demo)"); setShowReviewForm(false); }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-input bg-background" placeholder="Your Name" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Business Name</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-input bg-background" placeholder="Your Business" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="text-yellow-400 hover:scale-110 transition-transform"
                                            aria-label={`Rate ${star} stars`}
                                        >
                                            <Star className="w-6 h-6 fill-current" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Review</label>
                                <textarea className="w-full px-4 py-2 rounded-lg border border-input bg-background" rows={4} placeholder="Tell us about your experience..." required></textarea>
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                                Submit Review
                            </button>
                        </form>
                    </div>
                )}

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {REVIEWS.map((review) => (
                        <div key={review.id} className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <img src={review.image} alt={review.name} className="w-10 h-10 rounded-full bg-muted" />
                                    <div>
                                        <h4 className="font-semibold">{review.name}</h4>
                                        <p className="text-xs text-muted-foreground">{review.business}</p>
                                    </div>
                                </div>
                                <Quote className="w-8 h-8 text-primary/10 fill-primary/10" />
                            </div>

                            <div className="flex gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                    />
                                ))}
                            </div>

                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                "{review.text}"
                            </p>

                            <div className="text-xs text-muted-foreground border-t border-border pt-4">
                                Posted {review.date}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-3xl">
                    <h2 className="text-2xl font-bold mb-4">Ready to write your own success story?</h2>
                    <p className="text-muted-foreground mb-6">
                        Join the community of smart sellers automating their growth.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
                    >
                        Start Your Free Trial
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
