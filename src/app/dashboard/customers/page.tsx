
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import { Search, User, Mail, Phone, ShoppingBag, Loader2 } from "lucide-react";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetch(`/api/customers?search=${search}`);
                if (res.ok) {
                    const data = await res.json();
                    setCustomers(data);
                }
            } catch (error) {
                console.error("Failed to fetch customers", error);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchCustomers, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <ProtectedPage>
            <div className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900 mb-1">Customers</h1>
                        <p className="text-sm text-zinc-500">View and manage all your customer contacts.</p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-zinc-200 mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone or email..."
                            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-zinc-50/50 focus:bg-white transition-all shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-zinc-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3 text-xs uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-xs uppercase tracking-wider">Contact Info</th>
                                    <th className="px-6 py-3 text-xs uppercase tracking-wider">Orders</th>
                                    <th className="px-6 py-3 text-xs uppercase tracking-wider">Total Spent</th>
                                    <th className="px-6 py-3 text-xs uppercase tracking-wider">Last Active</th>
                                    <th className="px-6 py-3 text-xs uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                            <div className="flex justify-center mb-2"><Loader2 className="animate-spin w-6 h-6 text-indigo-500" /></div>
                                            Loading customers...
                                        </td>
                                    </tr>
                                ) : customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                            <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                                                <User className="w-6 h-6 text-zinc-300" />
                                            </div>
                                            No customers found.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shadow-sm">
                                                        {customer.name?.charAt(0) || <User className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-zinc-900">{customer.name || "Unknown"}</div>
                                                        <div className="text-zinc-500 text-xs font-mono">ID: {customer.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-600">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3 h-3 text-zinc-400" /> {customer.phone}
                                                    </div>
                                                    {customer.email && (
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-3 h-3 text-zinc-400" /> {customer.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 align-middle">
                                                    <ShoppingBag className="w-4 h-4 text-zinc-400" />
                                                    <span className="font-medium text-zinc-900">{customer.totalOrders || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-zinc-900">
                                                ₹{((customer.totalSpent || 0) / 100).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500 text-xs">
                                                {customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/dashboard/inbox`} className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors inline-block">
                                                    Message
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ProtectedPage>
    );
}
