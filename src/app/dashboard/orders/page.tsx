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
    status: string; // 'pending', 'confirmed', 'shipped', 'cancelled'
    paymentStatus: string; // 'unpaid', 'paid', 'pending_verification', 'pending_cod'
    paymentMethod: string; // 'upi', 'razorpay', 'cod'
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
            // Need to build this API endpoint too if it doesn't exist broadly
            // Assuming /api/orders/list or similar. Let's try /api/orders
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
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <ShoppingBag className="w-6 h-6 text-indigo-600" />
                                Orders
                            </h1>
                            <p className="text-gray-500">Manage customer orders and payment confirmations.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search order ID or phone..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                                <Filter className="w-4 h-4" /> Filter
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats / Filter Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            All Orders
                        </button>
                        <button
                            onClick={() => setFilterStatus('pending_action')}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${filterStatus === 'pending_action' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <AlertTriangle className="w-3 h-3" />
                            Requires Action
                        </button>
                        <button
                            onClick={() => setFilterStatus('paid')}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'paid' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Paid
                        </button>
                    </div>

                    {/* Orders List */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">Loading orders...</div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="p-12 text-center">
                                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                                <p className="text-gray-500">Share your store link to start getting orders.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
                                    <tr>
                                        <th className="px-6 py-4">Order ID & Date</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Payment</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">#{order.id}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(order.orderDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{order.customerName}</div>
                                                <div className="text-xs text-gray-500">{order.customerPhone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</div>
                                                <div className="text-xs text-gray-500">{order.itemsCount} items</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {order.paymentMethod === 'upi' && <Smartphone className="w-4 h-4 text-green-600" />}
                                                    {order.paymentMethod === 'razorpay' && <CreditCard className="w-4 h-4 text-blue-600" />}
                                                    {order.paymentMethod === 'cod' && <ShoppingBag className="w-4 h-4 text-orange-600" />}

                                                    <span className="capitalize">{order.paymentMethod || 'N/A'}</span>
                                                </div>
                                                <div className="mt-1">
                                                    {order.paymentStatus === 'paid' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            <CheckCircle2 className="w-3 h-3" /> Paid
                                                        </span>
                                                    )}
                                                    {order.paymentStatus === 'pending_verification' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                                                            <AlertTriangle className="w-3 h-3" /> Verify Proof
                                                        </span>
                                                    )}
                                                    {order.paymentStatus === 'unpaid' || order.paymentStatus === 'pending_cod' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                            <Clock className="w-3 h-3" /> Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-50 text-blue-700'
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
                                                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
                            Showing latest 50 orders
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedPage>
    );
}
