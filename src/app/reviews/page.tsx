
"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle2, User, Loader2 } from "lucide-react";
import { Footer } from "@/components/home/Footer";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        userName: "",
        userRole: "",
        rating: 5,
        comment: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch("/api/reviews");
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSubmitted(true);
                setFormData({ userName: "", userRole: "", rating: 5, comment: "" });
            } else {
                const data = await res.json();
                setError(data.error || "Failed to submit review");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Trusted by <span className="gradient-text">Indian Sellers</span>
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        See what our users are saying about WaveGroww.
                    </p>
                </div>
            </section>

            {/* Reviews Grid */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} className="glass-card p-6 rounded-xl hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? "fill-secondary text-secondary" : "text-muted"}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-muted-foreground mb-6 italic">"{review.comment}"</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{review.userName}</p>
                                                <p className="text-sm text-muted-foreground">{review.userRole || "User"}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No reviews yet. Be the first to share your experience!
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Submission Form */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="glass-card p-8 rounded-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-center">Share Your Experience</h2>

                        {submitted ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-success" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                                <p className="text-muted-foreground">Your review has been submitted and is pending approval.</p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="mt-6 text-primary font-medium hover:underline"
                                >
                                    Submit another review
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.userName}
                                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="e.g. Rahul Verma"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Role / Business Type (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.userRole}
                                        onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="e.g. Meesho Seller"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                title={`Rate ${star} stars`}
                                                onClick={() => setFormData({ ...formData, rating: star })}
                                                className="p-1 focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${star <= formData.rating ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Your Review</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.comment}
                                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                                        placeholder="Tell us about your experience..."
                                    />
                                </div>

                                {error && <p className="text-destructive text-sm text-center">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Submit Review
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
