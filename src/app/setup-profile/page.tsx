'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
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
          otp: formData.otp
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      toast.success("Phone verified!");
      router.push('/setup-business'); // Next Step

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-gray-500">Step 1 of 4: Personal Details</p>
        </div>

        {step === 'details' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                title="Full Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Verify Phone"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Enter OTP</label>
              <input
                type="text"
                value={formData.otp}
                onChange={e => setFormData({ ...formData, otp: e.target.value })}
                className="w-full p-2 border rounded-lg text-center tracking-widest text-xl"
                placeholder="123456"
                required
              />
              <p className="text-xs text-gray-400 mt-2 text-center">Use 123456 for testing</p>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Confirm & Continue"}
            </button>
            <button
              type="button"
              onClick={() => setStep('details')}
              className="w-full text-gray-500 text-sm hover:underline"
            >
              Change Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
