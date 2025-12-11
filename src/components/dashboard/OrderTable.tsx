"use client";

import { Plus, Download, Trash, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Order {
    id: number | string;
    reference?: string;
    customerName: string;
    shippingAddress?: string;
    totalAmount: number;
    status: string;
    currency?: string;
}

interface OrderTableProps {
    orders?: Order[];
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'delivered':
        case 'paid':
        case 'success':
            return 'bg-emerald-500';
        case 'shipped':
        case 'confirmed':
        case 'process':
            return 'bg-blue-500';
        case 'pending':
        case 'open':
            return 'bg-amber-500';
        case 'cancelled':
        case 'failed':
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
};

export function OrderTable({ orders = [] }: OrderTableProps) {
    return (
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-lg font-bold">Order Status</h2>
                    <p className="text-xs text-muted-foreground">Overview of latest orders</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <Link href="/dashboard/orders/new">
                        <button className="flex items-center gap-1 bg-pink-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-pink-600 transition-colors">
                            <Plus className="w-3 h-3" /> Add
                        </button>
                    </Link>
                    <button className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80" title="Download Report">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-black text-white text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 rounded-l-lg">Reference</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3 rounded-r-lg text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            orders.map((order, index) => (
                                <tr key={index} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-4 font-medium">{order.reference || `#${order.id}`}</td>
                                    <td className="px-4 py-4 text-muted-foreground">{order.customerName}</td>
                                    <td className="px-4 py-4 text-muted-foreground truncate max-w-[150px]">
                                        {order.shippingAddress || 'N/A'}
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground">
                                        {order.currency || '₹'}{(order.totalAmount / 100).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`${getStatusColor(order.status)} text-white px-3 py-1 rounded-lg text-xs font-medium shadow-sm block w-full max-w-[80px] mx-auto capitalize`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
