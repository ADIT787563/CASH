"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingService } from '@/services/onboardingService';
import { Loader2, CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Step 1 Form Data
    const [profileData, setProfileData] = useState({
        fullName: '',
        businessName: '',
        businessCategory: '',
        phoneNumber: '',
        businessEmail: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        gstNumber: ''
    });

    // Step 2 Form Data
    const [whatsappData, setWhatsappData] = useState({
        phoneNumberId: '',
        wabaId: '',
        accessToken: ''
    });

    useEffect(() => {
        loadState();
    }, []);

    const loadState = async () => {
        try {
            const state = await onboardingService.getState();
            setStep(state.currentStep);
            if (state.profile) {
                setProfileData(prev => ({ ...prev, ...state.profile }));
            }
            if (state.whatsapp) {
                setWhatsappData(prev => ({ ...prev, ...state.whatsapp }));
            }
        } catch (error) {
            toast.error('Failed to load onboarding state');
        } finally {
            setLoading(false);
        }
    };

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await onboardingService.submitStep1(profileData);
            if (res.success) {
                setStep(res.nextStep);
                toast.success('Profile saved!');
            }
        } catch (error) {
            toast.error('Failed to save profile');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await onboardingService.submitStep2(whatsappData);
            if (res.success) {
                setStep(res.nextStep);
                toast.success('WhatsApp settings saved!');
            }
        } catch (error) {
            toast.error('Failed to save WhatsApp settings');
        } finally {
            setSubmitting(false);
        }
    };

    const handleComplete = async () => {
        setSubmitting(true);
        try {
            const res = await onboardingService.complete();
            if (res.success) {
                toast.success('Onboarding complete!');
                router.push(res.redirectTo);
            }
        } catch (error) {
            toast.error('Failed to complete onboarding');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-3xl space-y-8">

                {/* Stepper Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Welcome to WaveGroww</h2>
                    <p className="mt-2 text-gray-600">Let's get your business set up in just a few steps.</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center space-x-4">
                    <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                        {step > 1 ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        <span className="ml-2 font-medium">Business Profile</span>
                    </div>
                    <div className="w-16 h-0.5 bg-gray-200" />
                    <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                        {step > 2 ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        <span className="ml-2 font-medium">WhatsApp Setup</span>
                    </div>
                    <div className="w-16 h-0.5 bg-gray-200" />
                    <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                        {step === 3 ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        <span className="ml-2 font-medium">Complete</span>
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white shadow rounded-lg p-8">

                    {step === 1 && (
                        <form onSubmit={handleStep1Submit} className="space-y-6">
                            <h3 className="text-xl font-semibold mb-4">Step 1: Business Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    className="w-full p-3 border rounded-md"
                                    value={profileData.fullName}
                                    onChange={e => setProfileData({ ...profileData, fullName: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Business Name"
                                    required
                                    className="w-full p-3 border rounded-md"
                                    value={profileData.businessName}
                                    onChange={e => setProfileData({ ...profileData, businessName: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Category (e.g. Retail)"
                                    required
                                    className="w-full p-3 border rounded-md"
                                    value={profileData.businessCategory}
                                    onChange={e => setProfileData({ ...profileData, businessCategory: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    required
                                    className="w-full p-3 border rounded-md"
                                    value={profileData.phoneNumber}
                                    onChange={e => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                />
                                <input
                                    type="email"
                                    placeholder="Business Email"
                                    required
                                    className="w-full p-3 border rounded-md"
                                    value={profileData.businessEmail}
                                    onChange={e => setProfileData({ ...profileData, businessEmail: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="GST Number (Optional)"
                                    className="w-full p-3 border rounded-md"
                                    value={profileData.gstNumber}
                                    onChange={e => setProfileData({ ...profileData, gstNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    required
                                    className="w-full p-3 border rounded-md"
                                    value={profileData.street}
                                    onChange={e => setProfileData({ ...profileData, street: e.target.value })}
                                />
                                <div className="grid grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        required
                                        className="w-full p-3 border rounded-md"
                                        value={profileData.city}
                                        onChange={e => setProfileData({ ...profileData, city: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        required
                                        className="w-full p-3 border rounded-md"
                                        value={profileData.state}
                                        onChange={e => setProfileData({ ...profileData, state: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        required
                                        className="w-full p-3 border rounded-md"
                                        value={profileData.pincode}
                                        onChange={e => setProfileData({ ...profileData, pincode: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Next Step <ArrowRight className="ml-2 w-5 h-5" /></>}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleStep2Submit} className="space-y-6">
                            <h3 className="text-xl font-semibold mb-4">Step 2: WhatsApp Configuration</h3>
                            <div className="bg-blue-50 p-4 rounded-md text-blue-800 text-sm mb-6">
                                You can find these details in your Meta Developer Portal under WhatsApp Product Settings.
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone Number ID</label>
                                    <input
                                        type="text"
                                        required
                                        aria-label="Phone Number ID"
                                        className="w-full p-3 border rounded-md"
                                        value={whatsappData.phoneNumberId}
                                        onChange={e => setWhatsappData({ ...whatsappData, phoneNumberId: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">WhatsApp Business Account ID (WABA ID)</label>
                                    <input
                                        type="text"
                                        required
                                        aria-label="WhatsApp Business Account ID"
                                        className="w-full p-3 border rounded-md"
                                        value={whatsappData.wabaId}
                                        onChange={e => setWhatsappData({ ...whatsappData, wabaId: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Permanent Access Token</label>
                                    <input
                                        type="password"
                                        required
                                        aria-label="Permanent Access Token"
                                        className="w-full p-3 border rounded-md"
                                        value={whatsappData.accessToken}
                                        onChange={e => setWhatsappData({ ...whatsappData, accessToken: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Setup <ArrowRight className="ml-2 w-5 h-5" /></>}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">You're All Set!</h3>
                            <p className="text-gray-600 mb-8">Your account has been successfully configured. You can now start using WaveGroww.</p>
                            <button
                                onClick={handleComplete}
                                disabled={submitting}
                                className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
