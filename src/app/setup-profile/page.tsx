"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, User, Phone, ArrowRight, ShieldCheck, MessageSquare } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

export default function SetupProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    phone: '',
    otp: ''
  });

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate sending OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      toast.success("OTP sent to " + formData.phone);
    }, 1500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          otp: formData.otp,
          name: formData.name
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      toast.success("Phone verified!");
      // Redirect to the NEW onboarding flow
      router.push('/onboarding/step-2-business');

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Background elements are handled by global styles, or we can add subtle overlays here if needed */}

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary shadow-lg shadow-primary/20 mb-4">
            <span className="text-2xl font-bold">W</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground text-sm">Step 1 of 4: Personal Details</p>
        </div>

        {/* Glassmorphic Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in-up">
          {step === 'details' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground"><User className="w-5 h-5" /></span>
                  <input
                    type="text"
                    title="Full Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground"><Phone className="w-5 h-5" /></span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Phone <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Enter OTP</h3>
                <p className="text-muted-foreground text-sm">Sent to {formData.phone}</p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.otp}
                  onChange={e => setFormData({ ...formData, otp: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 text-center text-2xl tracking-[0.5em] font-mono text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-center text-muted-foreground">Use <strong>123456</strong> for testing</p>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm & Continue <ShieldCheck className="w-5 h-5" /></>}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full text-muted-foreground hover:text-white text-sm transition-colors py-2"
                >
                  Change Number
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/60">
          Secure 256-bit encryption. Your data is safe.
        </p>
      </div>
    </div>
  );
}
