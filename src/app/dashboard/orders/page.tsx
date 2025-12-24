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
    Eye,
    ChevronDown
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
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchText, setSearchText] = useState("");

    // Enhanced Mock Data to match image
    const ordersList: Order[] = [
        {
            id: 2024001,
            customerName: "Vikram Singh",
            customerPhone: "+91 98765 43210",
            totalAmount: 2998,
            status: "Confirmed",
            paymentStatus: "paid",
            paymentMethod: "upi",
            orderDate: "2024-12-21T11:35:00",
            itemsCount: 1,
        },
        {
            id: 2024002,
            customerName: "Priya Sharma",
            customerPhone: "+91 87654 32109",
            totalAmount: 2999,
            status: "Shipped",
            paymentStatus: "paid",
            paymentMethod: "razorpay",
            orderDate: "2024-12-21T11:35:00",
            itemsCount: 1,
        }
    ];

    const [orders, setOrders] = useState<Order[]>(ordersList);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Filter Logic
    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
            o.id.toString().includes(searchText);
        const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Confirmed": return "text-blue-400 border-blue-400/30 bg-blue-400/10";
            case "Shipped": return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
            default: return "text-zinc-400 border-zinc-700 bg-zinc-800";
        }
    };

    const getPaymentBadge = (status: string) => {
        if (status === 'paid') return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
        return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }

    return (
        <ProtectedPage>
            <div className="w-full space-y-6 animate-in fade-in duration-500">
                {/* Header handled by layout or simplified here */}

                {/* Toolbar */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg hover:border-zinc-700 transition-all">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search by order ID, name, or phone..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                        />
                    </div>
                    <div className="w-full md:w-auto">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg text-sm px-4 py-2.5 text-zinc-400 focus:outline-none focus:border-indigo-500 hover:border-zinc-700 transition-colors cursor-pointer w-full md:w-40"
                            aria-label="Filter by Status"
                        >
                            <option value="all">All Status</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                        </select>
                    </div>
                </div>

                {/* Orders List */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Order</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Items</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-zinc-200">ORD-{order.id}</div>
                                            <div className="text-zinc-600 text-xs mt-1">
                                                {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(order.orderDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-300">{order.customerName}</div>
                                            <div className="text-zinc-600 text-xs">{order.customerPhone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-zinc-400">{order.itemsCount} items</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-emerald-400">{formatCurrency(order.totalAmount)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center justify-between px-3 py-1.5 rounded-md border text-xs font-semibold w-32 ${getStatusColor(order.status)}`}>
                                                {order.status}
                                                <ChevronDown className="w-3 h-3 opacity-50" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getPaymentBadge(order.paymentStatus)}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" aria-label="Order Actions">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ProtectedPage>
    );
}
