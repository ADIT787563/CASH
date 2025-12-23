'use client';

import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis } from 'recharts';
import { ShoppingBag, CheckCircle2, User, Clock } from 'lucide-react';
import Image from 'next/image';

const CHECK_ICON = "https://cdn-icons-png.flaticon.com/512/10629/10629607.png"; // Placeholder or use Lucide

interface InboxRightPanelProps {
    orders?: any[];
    analyticsData?: any[];
}

export default function InboxRightPanel({ orders = [], analyticsData = [] }: InboxRightPanelProps) {
    return (
        <div className="flex flex-col gap-4 h-full overflow-hidden">
            {/* ORDERS SECTION */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 overflow-hidden flex flex-col">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    Orders
                </h3>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                    {orders.length === 0 ? (
                        <div className="text-white/30 text-center py-4 text-sm">No recent orders</div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="bg-white/5 rounded-xl p-3 flex items-start gap-3 hover:bg-white/10 transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium relative shrink-0">
                                    {order.customerName?.[0] || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-white font-medium text-sm truncate pr-2">{order.customerName || 'Guest'}</h4>
                                        <span className="text-[10px] text-white/40 whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {order.status === 'confirmed' && <CheckCircle2 className="w-3 h-3 text-green-500 inline ml-0.5" />}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/50 truncate mb-1">
                                        {order.paymentStatus} via {order.paymentMethod || 'Online'}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <span className={`font-mono font-medium ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            ₹{(order.totalAmount / 100).toLocaleString()}
                                        </span>
                                        <span className="text-white/30 text-[10px]">#{order.id}</span>
                                    </div>
                                </div>
                            </div>
                        )))}
                </div>
            </div>

            {/* ANALYTICS SECTION */}
            <div className="h-48 bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="text-white/60 text-sm font-medium">Revenue (7d)</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                            {/* Sum of val in analyticsData */}
                            <h2 className="text-2xl font-bold text-white">
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
                                tick={{ fill: '#ffffff60', fontSize: 10 }}
                                dy={5}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {analyticsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={'#22c55e'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
