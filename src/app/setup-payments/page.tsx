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
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl glass-card rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-6 text-white text-center">Payment Preferences</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Preference Radio */}
                    <div>
                        <label className="block text-sm font-bold mb-2 text-white">How do you want to accept payments?</label>
                        <div className="flex gap-4">
                            <label className={`flex items-center gap-2 border p-3 rounded-xl cursor-pointer transition-all ${formData.preference === 'online' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}>
                                <input type="radio" name="pref" value="online" checked={formData.preference === 'online'} onChange={() => setFormData({ ...formData, preference: 'online' })} className="accent-primary" />
                                Online Only
                            </label>
                            <label className={`flex items-center gap-2 border p-3 rounded-xl cursor-pointer transition-all ${formData.preference === 'cod' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}>
                                <input type="radio" name="pref" value="cod" checked={formData.preference === 'cod'} onChange={() => setFormData({ ...formData, preference: 'cod' })} className="accent-primary" />
                                COD Only
                            </label>
                            <label className={`flex items-center gap-2 border p-3 rounded-xl cursor-pointer transition-all ${formData.preference === 'both' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}>
                                <input type="radio" name="pref" value="both" checked={formData.preference === 'both'} onChange={() => setFormData({ ...formData, preference: 'both' })} className="accent-primary" />
                                Both
                            </label>
                        </div>
                    </div>

                    {/* Online Options */}
                    {(formData.preference === 'online' || formData.preference === 'both') && (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
                            <h3 className="font-semibold text-white">Online Payment Details</h3>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-muted-foreground">Razorpay Payment Link (Recommended)</label>
                                <input
                                    value={formData.razorpayLink}
                                    onChange={e => setFormData({ ...formData, razorpayLink: e.target.value })}
                                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="https://rzp.io/l/your-link"
                                />
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.webhookConsent}
                                        onChange={e => setFormData({ ...formData, webhookConsent: e.target.checked })}
                                        id="consent"
                                        className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="consent" className="text-sm text-muted-foreground cursor-pointer">
                                        Allow WaveGroww to verify payments automatically (I consent to Webhooks)
                                    </label>
                                </div>
                            </div>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs">OR / AND</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-muted-foreground">UPI ID</label>
                                <input
                                    value={formData.upiId}
                                    onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="yourname@upi"
                                />
                                <p className="text-xs text-amber-500 mt-1">Note: UPI payments require manual verification by you.</p>
                            </div>
                        </div>
                    )}

                    {/* COD Options */}
                    {(formData.preference === 'cod' || formData.preference === 'both') && (
                        <div>
                            <label className="block text-sm font-medium mb-1 text-muted-foreground">COD Instructions / Notes</label>
                            <textarea
                                value={formData.codNotes}
                                onChange={e => setFormData({ ...formData, codNotes: e.target.value })}
                                className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[80px]"
                                placeholder="e.g. Extra ₹50 for COD"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] flex justify-center"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Complete Setup"}
                    </button>
                </form>
            </div>
        </div>
    );
}
