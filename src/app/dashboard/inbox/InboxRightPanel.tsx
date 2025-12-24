'use client';

import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis } from 'recharts';
import { ShoppingBag, CheckCircle2, User, Clock } from 'lucide-react';

interface InboxRightPanelProps {
    orders?: any[];
    analyticsData?: any[];
}

export default function InboxRightPanel({ orders = [], analyticsData = [] }: InboxRightPanelProps) {
    return (
        <div className="flex flex-col gap-4 h-full overflow-hidden">
            {/* ORDERS SECTION */}
            <div className="flex-1 bg-white border border-zinc-200 rounded-2xl p-4 overflow-hidden flex flex-col shadow-sm">
                <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    Recent Orders
                </h3>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                    {orders.length === 0 ? (
                        <div className="text-zinc-400 text-center py-4 text-sm">No recent orders</div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="bg-zinc-50 rounded-xl p-3 flex items-start gap-3 hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-100">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium relative shrink-0 shadow-sm">
                                    {order.customerName?.[0] || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-zinc-900 font-semibold text-sm truncate pr-2">{order.customerName || 'Guest'}</h4>
                                        <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {order.status === 'confirmed' && <CheckCircle2 className="w-3 h-3 text-emerald-500 inline ml-0.5" />}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 truncate mb-1">
                                        {order.paymentStatus} via {order.paymentMethod || 'Online'}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <span className={`font-mono font-medium ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            ₹{(order.totalAmount / 100).toLocaleString()}
                                        </span>
                                        <span className="text-zinc-400 text-[10px]">#{order.id}</span>
                                    </div>
                                </div>
                            </div>
                        )))}
                </div>
            </div>

            {/* ANALYTICS SECTION */}
            <div className="h-48 bg-white border border-zinc-200 rounded-2xl p-4 shrink-0 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="text-zinc-500 text-sm font-medium">Revenue (7d)</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                            {/* Sum of val in analyticsData */}
                            <h2 className="text-2xl font-bold text-zinc-900">
                                ₹{analyticsData.reduce((acc, cur) => acc + (cur.value || 0), 0).toLocaleString()}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="h-24 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData}>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(str) => str ? str.slice(-2) : ''}
                                tick={{ fill: '#71717a', fontSize: 10 }}
                                dy={5}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {analyticsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={'#4f46e5'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
