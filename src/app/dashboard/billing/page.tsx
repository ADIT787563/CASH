"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/providers/AuthProvider";
import {
    CreditCard,
    Download,
    FileText,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight
} from "lucide-react";

interface BillingOrder {
    id: number;
    totalAmount: number;
    currency: string;
    status: string;
    paymentStatus: string;
    invoiceUrl: string | null;
    invoiceNumber: string | null;
    createdAt: string;
    notesInternal: string; // e.g., "Plan: pro, Cycle: monthly"
}

export default function BillingPage() {
    const { user } = useAuth() as any;
    const [history, setHistory] = useState<BillingOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/billing/history');
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error("Failed to fetch billing history");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
        }).format(amount / 100);
    };

    return (
        <ProtectedPage>
            <div className="p-6 max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
                    <p className="text-gray-500">Manage your plan and view payment history.</p>
                </div>

                {/* Current Plan Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex gap-4 items-start">
                        <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Current Plan</p>
                            <h2 className="text-2xl font-bold text-gray-900 capitalize">
                                {user?.plan || 'Free'} Plan
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {user?.plan === 'enterprise'
                                    ? 'Custom billing cycle'
                                    : 'Renews automatically'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href="/pricing"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Upgrade Plan
                        </Link>
                        <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                            Manage Payment Method
                        </button>
                    </div>
                </div>

                {/* Billing History */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            Payment History
                        </h3>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No billing history found.
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900 font-medium">Subscription Charge</span>
                                            <div className="text-xs text-gray-500">{order.notesInternal || `Order #${order.id}`}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {formatCurrency(order.totalAmount, order.currency)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.paymentStatus === 'paid' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle2 className="w-3 h-3" /> Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <AlertCircle className="w-3 h-3" /> {order.paymentStatus}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {order.invoiceUrl || order.paymentStatus === 'paid' ? (
                                                <Link
                                                    href={order.invoiceUrl || `/invoices/${order.id}`}
                                                    target="_blank"
                                                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    PDF
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Generating...</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </ProtectedPage>
    );
}
