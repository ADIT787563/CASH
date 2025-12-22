"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, User, MapPin, Phone, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BusinessStep() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        businessName: "",
        ownerName: "",
        category: "retail",
        whatsappNumber: "",
        supportNumber: "",
        city: "",
        state: "",
        gst: "",
        address: "",
        description: "",
    });

    const validateField = (name: string, value: string) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'whatsappNumber':
            case 'supportNumber':
                if (value && !/^[+]?[\d\s-()]{10,15}$/.test(value)) {
                    newErrors[name] = 'Invalid phone number format';
                } else {
                    delete newErrors[name];
                }
                break;
            case 'gst':
                if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value.toUpperCase())) {
                    newErrors[name] = 'Invalid GST format';
                } else {
                    delete newErrors[name];
                }
                break;
        }

        setErrors(newErrors);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.businessName || !formData.ownerName || !formData.whatsappNumber || !formData.city) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (Object.keys(errors).length > 0) {
            toast.error("Please fix validation errors");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/onboarding/business", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to save details");
            }

            toast.success("Business profile created!");
            router.push("/onboarding/step-3-payments");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto glass-card rounded-2xl p-4 sm:p-6 md:p-8">
            <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Tell us about your business</h2>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    These details will be used for customer communication and order confirmation on WhatsApp.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Owner & Business Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            Owner Name <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground"><User className="w-4 h-4 sm:w-5 sm:h-5" /></span>
                            <input
                                name="ownerName"
                                placeholder="Your Name"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-9 sm:pl-10 pr-4 text-sm sm:text-base text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                value={formData.ownerName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            Business Name <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground"><Building2 className="w-4 h-4 sm:w-5 sm:h-5" /></span>
                            <input
                                name="businessName"
                                placeholder="Shop Name"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-9 sm:pl-10 pr-4 text-sm sm:text-base text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                value={formData.businessName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Category & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Category</label>
                        <select
                            name="category"
                            title="Business Category"
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all [&>option]:bg-[#1a0b2e]"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="retail">Retail & Shopping</option>
                            <option value="fashion">Fashion & Apparel</option>
                            <option value="electronics">Electronics</option>
                            <option value="food">Food & Beverage</option>
                            <option value="services">Services</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            City / State <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground"><MapPin className="w-4 h-4 sm:w-5 sm:h-5" /></span>
                            <input
                                name="city"
                                placeholder="e.g. Mumbai, Maharashtra"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-9 sm:pl-10 pr-4 text-sm sm:text-base text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-primary tracking-wider flex items-center gap-1">
                            Selling WhatsApp <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground"><Phone className="w-4 h-4 sm:w-5 sm:h-5" /></span>
                            <input
                                name="whatsappNumber"
                                placeholder="+91 98765 43210"
                                className={`w-full bg-white/5 border ${errors.whatsappNumber ? 'border-red-500' : 'border-primary/50'} rounded-lg py-2.5 pl-9 sm:pl-10 pr-4 text-sm sm:text-base text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                                value={formData.whatsappNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {errors.whatsappNumber && (
                            <p className="text-red-400 text-xs mt-1">{errors.whatsappNumber}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Support Contact</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground"><Phone className="w-4 h-4 sm:w-5 sm:h-5" /></span>
                            <input
                                name="supportNumber"
                                placeholder="Same as WhatsApp"
                                className={`w-full bg-white/5 border ${errors.supportNumber ? 'border-red-500' : 'border-white/10'} rounded-lg py-2.5 pl-9 sm:pl-10 pr-4 text-sm sm:text-base text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                                value={formData.supportNumber}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.supportNumber && (
                            <p className="text-red-400 text-xs mt-1">{errors.supportNumber}</p>
                        )}
                    </div>
                </div>

                {/* GST & Address */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">GSTIN (Optional)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground"><FileText className="w-4 h-4 sm:w-5 sm:h-5" /></span>
                        <input
                            name="gst"
                            placeholder="GST Number"
                            className={`w-full bg-white/5 border ${errors.gst ? 'border-red-500' : 'border-white/10'} rounded-lg py-2.5 pl-9 sm:pl-10 pr-4 text-sm sm:text-base text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all uppercase`}
                            value={formData.gst}
                            onChange={handleChange}
                        />
                    </div>
                    {errors.gst && (
                        <p className="text-red-400 text-xs mt-1">{errors.gst}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Business Address (Optional)</label>
                    <textarea
                        name="address"
                        placeholder="Full Address"
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-sm sm:text-base text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none h-20"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading || Object.keys(errors).length > 0}
                        className="w-full relative group overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 sm:py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Continue to Payments
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                    <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-center text-muted-foreground/60">
                        Secure connection. Your data is encrypted.
                    </p>
                </div>
            </form>
        </div>
    );
}
