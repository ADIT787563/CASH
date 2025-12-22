'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Store, Globe, Smartphone, CreditCard } from 'lucide-react';

interface Business {
    id: string;
    name: string;
    slug: string;
    phone: string;
    sellerCode: string;
}

export default function SetupFinishPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [business, setBusiness] = useState<Business | null>(null);

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await fetch('/api/businesses/me');
                if (!res.ok) throw new Error("Failed to fetch business details");
                const data = await res.json();
                setBusiness(data);
            } catch (error) {
                console.error(error);
                toast.error("Could not load business details");
            } finally {
                setIsFetching(false);
            }
        };

        fetchBusiness();
    }, []);

    const handleFinish = async () => {
        if (!business) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/businesses/${business.id}/complete-onboarding`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error("Failed to complete onboarding");

            toast.success("Setup Complete! Welcome directly to your Dashboard.");
            router.push('/dashboard');

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <p className="mt-4 text-muted-foreground">Loading details...</p>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
                <p className="text-red-400">Error: Business details not found. Please try again.</p>
                <button
                    onClick={() => router.push('/setup-business')}
                    className="mt-4 text-primary underline"
                >
                    Go back to setup
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg glass-card rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="bg-primary/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <CheckCircle className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">You're All Set!</h1>
                    <p className="text-muted-foreground mt-2">Your store is ready to launch.</p>
                </div>

                <div className="bg-white/5 rounded-lg p-6 space-y-4 mb-8 border border-white/10 text-left">
                    <div className="flex items-center gap-3">
                        <Store className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Business Name</p>
                            <p className="font-semibold text-white">{business.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Store Link</p>
                            <p className="font-semibold text-primary">wavegroww.online/{business.slug}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Seller Code</p>
                            <p className="font-mono bg-white/10 px-2 py-0.5 rounded text-sm text-white">{business.sellerCode}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleFinish}
                    disabled={isLoading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5" />
                            <span>Finalizing...</span>
                        </>
                    ) : (
                        "Go to Dashboard 🚀"
                    )}
                </button>
            </div>
        </div>
    );
}
