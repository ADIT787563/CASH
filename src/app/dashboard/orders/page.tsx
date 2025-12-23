"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import {
    ShoppingBag,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Smartphone,
    CreditCard,
    MoreHorizontal,
    ArrowUpRight,
    Megaphone,
    Calendar,
    Clock,
    AlertTriangle,
    Eye
} from "lucide-react";

interface Order {
    id: number;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    orderDate: string;
    itemsCount: number;
    notesInternal?: string;
    invoiceUrl?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async (orderId: number) => {
        if (!confirm("Confirm successful receipt of payment? This will mark order as Paid.")) return;
        try {
            const res = await fetch(`/api/orders/${orderId}/confirm-payment`, { method: 'POST' });
            if (res.ok) {
                alert("Payment Confirmed!");
                fetchOrders(); // Refresh
            } else {
                alert("Failed to confirm payment.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Filter Logic
    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
            o.customerPhone.includes(searchText) ||
            o.id.toString().includes(searchText);

        if (!matchesSearch) return false;

        if (filterStatus === 'all') return true;
        if (filterStatus === 'pending_action') return o.paymentStatus === 'pending_verification' || o.status === 'pending';
        // Support for new payment method filters
        if (filterStatus === 'upi') return o.paymentMethod === 'upi';
        if (filterStatus === 'cod') return o.paymentMethod === 'cod';

        return o.status === filterStatus || o.paymentStatus === filterStatus;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount / 100);
    };

    return (
        <ProtectedPage>
            <div className="w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900 flex items-center gap-2 mb-1 tracking-tight">
                            Orders
                        </h1>
                        <p className="text-zinc-500 text-sm">Manage customer orders and payment confirmations.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-64 bg-white shadow-sm"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-700 font-medium text-sm hover:bg-zinc-50 shadow-sm transition-colors">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                    </div>
                </div>

                {/* Quick Stats / Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shadow-sm border ${filterStatus === 'all' ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => setFilterStatus('pending_action')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shadow-sm border flex items-center gap-2 ${filterStatus === 'pending_action' ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                    >
                        <AlertTriangle className="w-3 h-3" />
                        Requires Action
                    </button>
                    <button
                        onClick={() => setFilterStatus('paid')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shadow-sm border ${filterStatus === 'paid' ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                    >
                        Paid
                    </button>
                    <button
                        onClick={() => setFilterStatus('upi')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shadow-sm border flex items-center gap-2 ${filterStatus === 'upi' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                    >
                        <Smartphone className="w-3 h-3" /> UPI
                    </button>
                    <button
                        onClick={() => setFilterStatus('cod')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shadow-sm border flex items-center gap-2 ${filterStatus === 'cod' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                    >
                        <ShoppingBag className="w-3 h-3" /> COD
                    </button>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-xl border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-zinc-500">Loading orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                                <ShoppingBag className="w-6 h-6 text-zinc-300" />
                            </div>
                            <h3 className="text-lg font-medium text-zinc-900">No orders found</h3>
                            <p className="text-zinc-500 mt-1">Share your store link to start getting orders.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50/50 border-b border-zinc-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Order ID & Date</th>
                                    <th className="px-6 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-900">#{order.id}</div>
                                            <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(order.orderDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-900">{order.customerName}</div>
                                            <div className="text-xs text-zinc-500">{order.customerPhone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-zinc-900">{formatCurrency(order.totalAmount)}</div>
                                            <div className="text-xs text-zinc-500">{order.itemsCount} items</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                {order.paymentMethod === 'upi' && <Smartphone className="w-4 h-4 text-emerald-600" />}
                                                {order.paymentMethod === 'razorpay' && <CreditCard className="w-4 h-4 text-blue-600" />}
                                                {order.paymentMethod === 'cod' && <ShoppingBag className="w-4 h-4 text-orange-600" />}
                                                <span className="capitalize text-zinc-700 font-medium">{order.paymentMethod || 'N/A'}</span>
                                            </div>
                                            <div>
                                                {order.paymentStatus === 'paid' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <CheckCircle2 className="w-3 h-3" /> Paid
                                                    </span>
                                                )}
                                                {order.paymentStatus === 'pending_verification' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
                                                        <AlertTriangle className="w-3 h-3" /> Verify
                                                    </span>
                                                )}
                                                {(order.paymentStatus === 'unpaid' || order.paymentStatus === 'pending_cod') && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${order.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {order.paymentStatus === 'pending_verification' && (
                                                    <button
                                                        onClick={() => handleConfirmPayment(order.id)}
                                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                                                        title="Customer uploaded proof. Verify & Confirm."
                                                    >
                                                        <CheckCircle2 className="w-3 h-3" /> Confirm
                                                    </button>
                                                )}

                                                <Link
                                                    href={`/dashboard/orders/${order.id}`}
                                                    className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {/* Pagination placeholder */}
                    <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/50 text-xs text-zinc-500 text-center">
                        Showing latest 50 orders
                    </div>
                </div>
            </div>
        </ProtectedPage>
    );
}
