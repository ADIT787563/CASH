"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, ArrowLeft, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Footer } from "@/components/home/Footer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Review {
    id: string;
    userName: string;
    userRole: string;
    location: string;
    rating: number;
    comment: string;
    avatar?: string;
}

const staticReviews: Review[] = [
    {
        id: "static-1",
        userName: "Priya Sharma",
        userRole: "Meesho Seller",
        comment: "WaveGroww increased my conversions by 3x! The AI chatbot handles everything while I sleep. It understands Hinglish perfectly.",
        location: "Jaipur, Rajasthan",
        rating: 5,
        avatar: "P"
    },
    {
        id: "static-2",
        userName: "Rajesh Kumar",
        userRole: "Shopify Store Owner",
        comment: "The auto-catalog feature saved me 10 hours a week. No more manual link sharing. Highly recommend for Indian sellers!",
        location: "Surat, Gujarat",
        rating: 5,
        avatar: "R"
    },
    {
        id: "static-3",
        userName: "Anita Desai",
        userRole: "Local Shop Owner",
        comment: "Finally, a tool built for Indian businesses. The Hindi support is perfect! My customers feel like they are talking to a human.",
        location: "Pune, Maharashtra",
        rating: 5,
        avatar: "A"
    },
    {
        id: "static-4",
        userName: "Vikram Singh",
        userRole: "Wholesaler",
        comment: "Bulk catalog sharing on WhatsApp was a pain. WaveGroww made it one-click. Best investment this year.",
        location: "Delhi NCR",
        rating: 4,
        avatar: "V"
    },
    {
        id: "static-5",
        userName: "Sanya Malhotra",
        userRole: "Boutique Owner",
        comment: "The lead collection is a lifesaver. I never lose a customer number now. 100% recommended for small brands.",
        location: "Chandigarh",
        rating: 5,
        avatar: "S"
    }
];

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>(staticReviews);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [role, setRole] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch("/api/reviews");
            if (res.ok) {
                const data = await res.json();
                // Merge fetched reviews with static ones.
                // Assuming fetched reviews have the same structure (mapped below if needed)
                // The API returns fields matching the interface roughly, except avatar.
                const formattedReviews: Review[] = data.map((r: any) => ({
                    id: r.id,
                    userName: r.userName,
                    userRole: r.userRole || "User",
                    location: r.location || "",
                    rating: r.rating,
                    comment: r.comment,
                    avatar: r.userName.charAt(0).toUpperCase()
                }));

                // Prepend new reviews to static ones or just show all
                // Let's prepend fetched reviews followed by static
                setReviews([...formattedReviews, ...staticReviews]);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, comment, role, location }),
            });

            if (res.ok) {
                toast.success("Review submitted successfully!");
                setIsDialogOpen(false);
                // Reset form
                setComment("");
                setRole("");
                setLocation("");
                setRating(5);
                // Refresh list
                fetchReviews();
            } else {
                const data = await res.json();
                if (res.status === 401) {
                    toast.error("Please login to submit a review");
                } else {
                    toast.error(data.error || "Failed to submit review");
                }
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

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

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <button className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black shadow-xl hover:shadow-primary/20 transition-all hover:scale-105 cursor-pointer">
                                    <Plus className="w-5 h-5" />
                                    Add Your Review
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add Your Review</DialogTitle>
                                    <DialogDescription>
                                        Share your experience with WaveGroww.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Rating</Label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    className={`p-1 rounded-full transition-colors ${rating >= star ? 'text-amber-400' : 'text-muted-foreground/30'}`}
                                                    aria-label={`Rate ${star} stars`}
                                                >
                                                    <Star className="w-6 h-6 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Your Role</Label>
                                        <Input
                                            id="role"
                                            placeholder="e.g. Shopify Seller"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            placeholder="e.g. Mumbai"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="comment">Review</Label>
                                        <Textarea
                                            id="comment"
                                            placeholder="Tell us what you think..."
                                            required
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                "Submit Review"
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
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
                    {reviews.map((review, idx) => (
                        <motion.div
                            key={review.id || idx}
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
                                "{review.comment}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                    {review.avatar}
                                </div>
                                <div className="text-left overflow-hidden">
                                    <p className="font-bold truncate">{review.userName}</p>
                                    <p className="text-xs text-muted-foreground font-medium truncate">
                                        {review.userRole} {review.location && `• ${review.location}`}
                                    </p>
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

