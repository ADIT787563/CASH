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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Business Profile</h1>
                    <p className="text-gray-500">Step 2 of 4: Tell us about your store</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Business Name</label>
                        <input
                            title="Business Name"
                            placeholder="Business Name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Store Handle (URL)</label>
                        <div className="flex items-center">
                            <span className="bg-gray-100 p-2 border border-r-0 rounded-l-lg text-gray-500">wavegroww.online/</span>
                            <input
                                title="Store Handle"
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                                className="w-full p-2 border rounded-r-lg"
                                placeholder="my-store"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                            title="Business Type"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option>Individual</option>
                            <option>MSME</option>
                            <option>Company</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                            title="Business Category"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-2 border rounded-lg"
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
                        <label className="block text-sm font-medium mb-1">Business Phone</label>
                        <input
                            title="Business Phone"
                            placeholder="Business Phone"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Business Email</label>
                        <input
                            title="Business Email"
                            placeholder="Business Email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            type="email"
                            required
                        />
                    </div>

                    {/* Address Block */}
                    <div className="md:col-span-2 mt-2">
                        <label className="block text-sm font-bold text-gray-700">Business Address</label>
                    </div>

                    <div className="md:col-span-2">
                        <input
                            placeholder="Street Address"
                            value={formData.addressLine1}
                            onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <input
                            placeholder="City"
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <input
                            placeholder="State"
                            value={formData.state}
                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <input
                            placeholder="Pincode"
                            value={formData.pincode}
                            onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">GSTIN (Optional)</label>
                        <input
                            value={formData.gstin}
                            onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            placeholder="22AAAAA0000A1Z5"
                        />
                    </div>

                    <div className="md:col-span-2 mt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "Save & Continue"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
