"use client";

import { useEffect, useState, use } from "react";
import {
    CheckCircle2,
    Smartphone,
    CreditCard,
    Upload,
    Copy,
    ArrowLeft,
    Info,
    Clock,
    AlertCircle,
    Check
} from "lucide-react";
import Link from "next/link";

const ShoppingBag = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);

export default function PublicPaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = use(params);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [utrNumber, setUtrNumber] = useState("");
    const [screenshotUrl, setScreenshotUrl] = useState("");
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/public/${orderId}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Failed to fetch order");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyUpi = () => {
        if (data?.sellerPayment?.upiId) {
            navigator.clipboard.writeText(data.sellerPayment.upiId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSubmitProof = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/payment-proof`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: parseInt(orderId),
                    transactionId: utrNumber,
                    screenshotUrl: screenshotUrl,
                })
            });

            if (res.ok) {
                setSuccess(true);
                fetchOrder();
            } else {
                alert("Failed to submit proof. Please try again.");
            }
        } catch (error) {
            alert("An error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!data?.order) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
                <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h1>
                <p className="text-slate-500 mb-6">The link you followed might be invalid or expired.</p>
                <Link href="/" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Return Home</Link>
            </div>
        </div>
    );

    const { order, items, sellerPayment } = data;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-xl mx-auto">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                        <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">WaveGroww Payments</h1>
                    <p className="text-slate-500 font-medium">Safe & Secure Payment Portal</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                    {/* Order Summary Header */}
                    <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Order Ref</p>
                            <h2 className="text-xl font-black">{order.reference || `#${order.id}`}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Amount</p>
                            <h2 className="text-2xl font-black text-indigo-400">₹{order.totalAmount / 100}</h2>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Status Alert */}
                        {order.paymentStatus === 'paid' ? (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center mb-8">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                <h3 className="text-xl font-bold text-emerald-900">Payment Successful!</h3>
                                <p className="text-emerald-700 text-sm">Your order is confirmed and being processed.</p>
                            </div>
                        ) : order.paymentStatus === 'pending_verification' ? (
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center mb-8">
                                <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                                <h3 className="text-xl font-bold text-amber-900">Verification Pending</h3>
                                <p className="text-amber-700 text-sm">Seller is reviewing your payment proof. You'll get an update soon!</p>
                            </div>
                        ) : (
                            <>
                                {/* Payment Methods Selection */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Info className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Select Payment Method</span>
                                    </div>

                                    {/* UPI Option */}
                                    <div className="relative group">
                                        <div className="border-2 border-slate-100 rounded-2xl p-6 hover:border-indigo-500 transition-all bg-slate-50/50">
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                                                    <Smartphone className="w-6 h-6 text-indigo-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-900">Instant UPI Transfer</h3>
                                                    <p className="text-sm text-slate-500">Pay directly using any UPI app (PhonePe, GPay, PayTM)</p>
                                                </div>
                                            </div>

                                            {sellerPayment?.upiId && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                                                        <div className="flex-1 truncate font-mono text-sm font-bold text-slate-700">
                                                            {sellerPayment.upiId}
                                                        </div>
                                                        <button
                                                            onClick={handleCopyUpi}
                                                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-indigo-600"
                                                        >
                                                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                        </button>
                                                    </div>

                                                    {sellerPayment.qrImageUrl && (
                                                        <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-center">
                                                            <img src={sellerPayment.qrImageUrl} alt="UPI QR" className="w-48 h-48 object-contain" />
                                                        </div>
                                                    )}

                                                    {/* Proof Form */}
                                                    <form onSubmit={handleSubmitProof} className="pt-4 border-t border-slate-200 mt-6 pt-6">
                                                        <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Submit Payment Proof</p>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="text-xs font-bold text-slate-600 block mb-2 px-1">UTR / Transaction ID</label>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    placeholder="Enter 12-digit UTR number"
                                                                    value={utrNumber}
                                                                    onChange={(e) => setUtrNumber(e.target.value)}
                                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-bold text-slate-600 block mb-2 px-1">Screenshot URL (Optional)</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Link to payment screenshot"
                                                                    value={screenshotUrl}
                                                                    onChange={(e) => setScreenshotUrl(e.target.value)}
                                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                                                />
                                                            </div>
                                                            <button
                                                                type="submit"
                                                                disabled={submitting}
                                                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                                            >
                                                                {submitting ? "Submitting..." : (
                                                                    <><Upload className="w-5 h-5" /> SUBMIT FOR REVIEW</>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Razorpay Option */}
                                    {sellerPayment?.razorpayEnabled && (
                                        <div className="border-2 border-slate-100 rounded-2xl p-6 hover:border-indigo-500 transition-all bg-slate-50/50 flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                                                    <CreditCard className="w-6 h-6 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">Pay via Cards / Netbanking</h3>
                                                    <p className="text-sm text-slate-500">Automated instant confirmation</p>
                                                </div>
                                            </div>
                                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 rotate-180 transition-all" />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer / Summary */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-500 font-bold text-sm uppercase">Order Summary</span>
                            <span className="text-slate-400 text-xs">{(items || []).length} items</span>
                        </div>
                        <div className="space-y-3">
                            {(items || []).map((item: any) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600 font-medium">{item.productName} <span className="text-slate-400 ml-1">x{item.quantity}</span></span>
                                    <span className="text-slate-900 font-bold">₹{(item.unitPrice * item.quantity) / 100}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    POWERED BY WAVEGROWW SAAS
                </div>
            </div>
        </div>
    );
}
