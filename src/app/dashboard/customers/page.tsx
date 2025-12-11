
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
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Customers</h1>
                        {/* <Link href="/dashboard/customers/new" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">Add Customer</Link> */}
                    </div>

                    {/* Search */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, phone or email..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Contact Info</th>
                                        <th className="px-6 py-4">Orders</th>
                                        <th className="px-6 py-4">Total Spent</th>
                                        <th className="px-6 py-4">Last Active</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex justify-center mb-2"><Loader2 className="animate-spin w-6 h-6" /></div>
                                                Loading customers...
                                            </td>
                                        </tr>
                                    ) : customers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                No customers found.
                                            </td>
                                        </tr>
                                    ) : (
                                        customers.map((customer) => (
                                            <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {customer.name?.charAt(0) || <User className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{customer.name || "Unknown"}</div>
                                                            <div className="text-gray-500 text-xs">Customer ID: {customer.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-3 h-3" /> {customer.phone}
                                                        </div>
                                                        {customer.email && (
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="w-3 h-3" /> {customer.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 align-middle">
                                                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                                                        {customer.totalOrders || 0}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium">
                                                    ₹{((customer.totalSpent || 0) / 100).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link href={`/dashboard/inbox`} className="text-primary hover:underline text-xs font-semibold">
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
            </div>
        </ProtectedPage>
    );
}
