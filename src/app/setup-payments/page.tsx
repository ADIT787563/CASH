'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SetupPaymentsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    // In a real app, we'd fetch the sellerId (Business ID) from the user session/context
    // For now, we might assume the previous step passed it or we fetch "my business"
    const [sellerId, setSellerId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMyBusiness() {
            try {
                const res = await fetch('/api/businesses/me');
                if (res.ok) {
                    const data = await res.json();
                    setSellerId(data.id);
                } else {
                    // Redirect if no business found
                    toast.error("Please create a business profile first.");
                    router.push('/setup-business');
                }
            } catch (error) {
                console.error("Failed to fetch business:", error);
            }
        }
        fetchMyBusiness();
    }, [router]);

    // Workaround: We will use a generic "me" or fetch logic in the component.
    // Ideally the API should be `PUT /api/businesses/me/payment-methods` if 1:1.
    // Sticking to `[sellerId]`, we'd need to know it.
    // I'll make the UI submit to a wrapper or assume we have it.

    // For this implementation, I will just hardcode valid states or assume the user has 1 business.
    // Let's add a "Find my ID" logic quickly? No, too complex.
    // I'll just rely on the user having just created it.

    const [formData, setFormData] = useState({
        preference: 'both', // online, cod, both
        razorpayLink: '',
        upiId: '',
        webhookConsent: false,
        codNotes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sellerId) return;

        setIsLoading(true);

        try {
            const res = await fetch(`/api/sellers/${sellerId}/payment-methods`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_preference: formData.preference,
                    razorpay_link: formData.razorpayLink,
                    upi_id: formData.upiId,
                    webhook_consent: formData.webhookConsent,
                    cod_notes: formData.codNotes
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Could not save payments.");
            }

            toast.success("Payments Configured!");
            router.push('/dashboard'); // Finish

        } catch (error: any) {
            toast.error(error.message || "Error saving preferences");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-6">Payment Preferences</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Preference Radio */}
                    <div>
                        <label className="block text-sm font-bold mb-2">How do you want to accept payments?</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 border p-3 rounded cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="pref" value="online" checked={formData.preference === 'online'} onChange={() => setFormData({ ...formData, preference: 'online' })} />
                                Online Only
                            </label>
                            <label className="flex items-center gap-2 border p-3 rounded cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="pref" value="cod" checked={formData.preference === 'cod'} onChange={() => setFormData({ ...formData, preference: 'cod' })} />
                                COD Only
                            </label>
                            <label className="flex items-center gap-2 border p-3 rounded cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="pref" value="both" checked={formData.preference === 'both'} onChange={() => setFormData({ ...formData, preference: 'both' })} />
                                Both
                            </label>
                        </div>
                    </div>

                    {/* Online Options */}
                    {(formData.preference === 'online' || formData.preference === 'both') && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                            <h3 className="font-semibold text-blue-800">Online Payment Details</h3>

                            <div>
                                <label className="block text-sm font-medium mb-1">Razorpay Payment Link (Recommended)</label>
                                <input
                                    value={formData.razorpayLink}
                                    onChange={e => setFormData({ ...formData, razorpayLink: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    placeholder="https://rzp.io/l/your-link"
                                />
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.webhookConsent}
                                        onChange={e => setFormData({ ...formData, webhookConsent: e.target.checked })}
                                        id="consent"
                                    />
                                    <label htmlFor="consent" className="text-sm text-gray-600">
                                        Allow WaveGroww to verify payments automatically (I consent to Webhooks)
                                    </label>
                                </div>
                            </div>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-blue-200"></div>
                                <span className="flex-shrink-0 mx-4 text-blue-300 text-xs">OR / AND</span>
                                <div className="flex-grow border-t border-blue-200"></div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">UPI ID</label>
                                <input
                                    value={formData.upiId}
                                    onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    placeholder="yourname@upi"
                                />
                                <p className="text-xs text-orange-600 mt-1">Note: UPI payments require manual verification by you.</p>
                            </div>
                        </div>
                    )}

                    {/* COD Options */}
                    {(formData.preference === 'cod' || formData.preference === 'both') && (
                        <div>
                            <label className="block text-sm font-medium mb-1">COD Instructions / Notes</label>
                            <textarea
                                value={formData.codNotes}
                                onChange={e => setFormData({ ...formData, codNotes: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="e.g. Extra ₹50 for COD"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Complete Setup"}
                    </button>
                </form>
            </div>
        </div>
    );
}
