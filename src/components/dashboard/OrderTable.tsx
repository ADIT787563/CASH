"use client";

import { Plus, Download, Trash, AlertCircle } from "lucide-react";

const orders = [
    { id: "#45453", customer: "Charly dues", location: "Russia", price: "$2652", status: "Process", color: "bg-pink-500" },
    { id: "#86453", customer: "Charly dues", location: "Italy", price: "$2652", status: "Open", color: "bg-indigo-500" },
    { id: "#58983", customer: "Charly dues", location: "France", price: "$2652", status: "On Hold", color: "bg-sky-500" },
    { id: "#23453", customer: "Charly dues", location: "Japan", price: "$2652", status: "Process", color: "bg-pink-500" },
    { id: "#65453", customer: "Charly dues", location: "USA", price: "$2652", status: "Open", color: "bg-indigo-500" },
];

export function OrderTable() {
    return (
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-lg font-bold">Order Status</h2>
                    <p className="text-xs text-muted-foreground">Overview of latest month</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex items-center gap-1 bg-pink-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-pink-600 transition-colors">
                        <Plus className="w-3 h-3" /> Add
                    </button>
                    <button className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80">
                        <Trash className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80">
                        <AlertCircle className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-black text-white text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 rounded-l-lg">Invoice</th>
                            <th className="px-4 py-3">Customers</th>
                            <th className="px-4 py-3">From</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3 rounded-r-lg text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.map((order, index) => (
                            <tr key={index} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-4 font-medium">{order.id}</td>
                                <td className="px-4 py-4 text-muted-foreground">{order.customer}</td>
                                <td className="px-4 py-4 text-muted-foreground">{order.location}</td>
                                <td className="px-4 py-4 text-muted-foreground">{order.price}</td>
                                <td className="px-4 py-4 text-center">
                                    <span className={`${order.color} text-white px-3 py-1 rounded-lg text-xs font-medium shadow-sm block w-full max-w-[80px] mx-auto`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
