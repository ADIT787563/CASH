"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import {
    CreditCard,
    Smartphone,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ArrowLeft
} from "lucide-react";

interface PaymentMethods {
    paymentPreference: string; // 'online', 'cod', 'both'
    razorpayLink?: string;
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
    upiId?: string;
    phoneNumber?: string;
    qrImageUrl?: string;
}

export default function PaymentSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [methods, setMethods] = useState<PaymentMethods>({
        paymentPreference: 'both',
        razorpayKeyId: '',
        razorpayKeySecret: '',
        upiId: '',
        phoneNumber: ''
    });

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            const res = await fetch('/api/sellers/payment-methods');
            if (res.ok) {
                const data = await res.json();
                if (data && Object.keys(data).length > 0) {
                    setMethods({
                        paymentPreference: data.paymentPreference || 'both',
                        razorpayKeyId: data.razorpayKeyId || '',
                        razorpayKeySecret: data.razorpayKeySecret || '',
                        upiId: data.upiId || '',
                        phoneNumber: data.phoneNumber || ''
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch payment methods");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/sellers/payment-methods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(methods)
            });
            if (res.ok) {
                alert("Payment settings saved successfully!");
            } else {
                alert("Failed to save settings.");
            }
        } catch (error) {
            console.error(error);
            alert("Error saving settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <ProtectedPage><div className="p-10 text-center">Loading settings...</div></ProtectedPage>;

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/dashboard/settings" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-indigo-600" />
                            Payment Settings
                        </h1>
                        <p className="text-gray-500">Configure how you accept payments from customers.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* 1. Preference */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Preference</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['online', 'cod', 'both'].map((type) => (
                                    <label key={type} className={`
                                        cursor-pointer border p-4 rounded-lg flex flex-col items-center gap-2 transition-all
                                        ${methods.paymentPreference === type
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'}
                                    `}>
                                        <input
                                            type="radio"
                                            name="pref"
                                            value={type}
                                            checked={methods.paymentPreference === type}
                                            onChange={(e) => setMethods({ ...methods, paymentPreference: e.target.value })}
                                            className="sr-only"
                                        />
                                        <span className="font-semibold capitalize">{type === 'cod' ? 'Cash on Delivery' : type}</span>
                                        <span className="text-xs text-center opacity-80">
                                            {type === 'online' && 'Accept UPI/Cards only'}
                                            {type === 'cod' && 'Cash collection only'}
                                            {type === 'both' && 'Give customers choice'}
                                        </span>
                                        {methods.paymentPreference === type && <CheckCircle2 className="w-4 h-4 mt-2" />}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 2. Razorpay */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                Razorpay Configuration
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">Required for automatic payment verification and instant order confirmation.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Key ID</label>
                                    <input
                                        type="text"
                                        value={methods.razorpayKeyId}
                                        onChange={(e) => setMethods({ ...methods, razorpayKeyId: e.target.value })}
                                        placeholder="rzp_test_..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Key Secret</label>
                                    <input
                                        type="password"
                                        value={methods.razorpayKeySecret}
                                        onChange={(e) => setMethods({ ...methods, razorpayKeySecret: e.target.value })}
                                        placeholder="Enter your Razorpay Key Secret"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. UPI / Manual */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-green-600" />
                                UPI Configuration
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">For manual payment collection. Customers will see this VPA/QR code.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID (VPA)</label>
                                    <input
                                        type="text"
                                        value={methods.upiId}
                                        onChange={(e) => setMethods({ ...methods, upiId: e.target.value })}
                                        placeholder="username@upi"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone Number</label>
                                    <input
                                        type="text"
                                        value={methods.phoneNumber}
                                        onChange={(e) => setMethods({ ...methods, phoneNumber: e.target.value })}
                                        placeholder="+91 98765 43210"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save */}
                        <div className="flex justify-end sticky bottom-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-70 disabled:scale-100"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Settings
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </ProtectedPage>
    );
}
