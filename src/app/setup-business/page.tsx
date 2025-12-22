'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SetupBusinessPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        type: 'Individual',
        category: 'Retail',
        phone: '',
        email: '',
        gstin: '',
        addressLine1: '',
        city: '',
        state: '',
        pincode: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/businesses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    address: {
                        line1: formData.addressLine1,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                        country: 'India'
                    }
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success("Business Profile Created!");
            // Store business ID if needed or rely on backend session/user context
            router.push('/setup-payments');

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl glass-card rounded-xl shadow-lg p-8">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-white">Business Profile</h1>
                    <p className="text-muted-foreground">Step 2 of 4: Tell us about your store</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Business Name</label>
                        <input
                            title="Business Name"
                            placeholder="Business Name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Store Handle (URL)</label>
                        <div className="flex items-center">
                            <span className="bg-white/10 p-2 border border-white/10 border-r-0 rounded-l-lg text-muted-foreground">wavegroww.online/</span>
                            <input
                                title="Store Handle"
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                                className="w-full p-2 bg-white/5 border border-white/10 rounded-r-lg text-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="my-store"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Type</label>
                        <select
                            title="Business Type"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all [&>option]:bg-[#1a0b2e]"
                        >
                            <option>Individual</option>
                            <option>MSME</option>
                            <option>Company</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Category</label>
                        <select
                            title="Business Category"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all [&>option]:bg-[#1a0b2e]"
                        >
                            <option>Retail</option>
                            <option>Services</option>
                            <option>Food</option>
                            <option>Healthcare</option>
                            <option>Fashion</option>
                            <option>Electronics</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Business Phone</label>
                        <input
                            title="Business Phone"
                            placeholder="Business Phone"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">Business Email</label>
                        <input
                            title="Business Email"
                            placeholder="Business Email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            type="email"
                            required
                        />
                    </div>

                    {/* Address Block */}
                    <div className="md:col-span-2 mt-2">
                        <label className="block text-sm font-bold text-white">Business Address</label>
                    </div>

                    <div className="md:col-span-2">
                        <input
                            placeholder="Street Address"
                            value={formData.addressLine1}
                            onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <input
                            placeholder="City"
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <input
                            placeholder="State"
                            value={formData.state}
                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <input
                            placeholder="Pincode"
                            value={formData.pincode}
                            onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-muted-foreground">GSTIN (Optional)</label>
                        <input
                            value={formData.gstin}
                            onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="22AAAAA0000A1Z5"
                        />
                    </div>

                    <div className="md:col-span-2 mt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] flex justify-center"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "Save & Continue"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
