"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Printer, Ban } from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import { Order } from "@/types/order";
import OrderInfo from "@/components/dashboard/orders/OrderInfo";
import OrderItems from "@/components/dashboard/orders/OrderItems";
import OrderActions from "@/components/dashboard/orders/OrderActions";
import OrderTimeline from "@/components/dashboard/orders/OrderTimeline";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/orders/${id}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error("Order not found");
                if (res.status === 403) throw new Error("Access denied");
                throw new Error("Failed to load order");
            }
            const data = await res.json();
            setOrder(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handlePrintInvoice = () => {
        if (order?.invoiceUrl) {
            window.open(order.invoiceUrl, '_blank');
        } else {
            alert('Invoice not generated yet');
        }
    };

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/orders"
                                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    Order #{order?.reference || id}
                                    {order && (
                                        <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium capitalize border ${order.status === 'delivered' || order.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                            {order.status}
                                        </span>
                                    )}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Placed on {order ? new Date(order.createdAt).toLocaleDateString() : '...'}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        {order && (
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePrintInvoice}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700"
                                >
                                    <Printer className="w-4 h-4" />
                                    Invoice
                                </button>
                                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
                                        <Ban className="w-4 h-4" />
                                        Cancel
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                            <p className="text-gray-500">Loading order details...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 bg-white rounded-xl border border-red-200 text-center shadow-sm">
                            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <ArrowLeft className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{error}</h3>
                            <Link href="/dashboard/orders" className="text-indigo-600 hover:underline">
                                Go back to Orders List
                            </Link>
                        </div>
                    ) : order && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Info & Items */}
                                <div className="lg:col-span-2 space-y-6">
                                    <OrderItems items={order.items || []} currency={order.currency || 'INR'} />
                                    <OrderTimeline timeline={order.timeline || []} />
                                </div>

                                {/* Right Column: Customer & Actions */}
                                <div className="lg:col-span-1 space-y-6">
                                    <OrderInfo order={order} />
                                    <OrderActions
                                        orderId={order.id}
                                        currentStatus={order.status}
                                        onStatusUpdate={fetchOrder}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedPage>
    );
}
