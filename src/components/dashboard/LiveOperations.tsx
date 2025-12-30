"use client";

import { MessageSquare, Package, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LiveOperationsProps {
    inbox: any[]; // Use specific type if available
    orders: any[]; // Use specific type if available
}

export function LiveOperations({ inbox, orders }: LiveOperationsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Live Inbox Widget */}
            <div className="bg-card border rounded-xl p-5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">Live Inbox</h3>
                    </div>
                    <Link href="/dashboard/inbox">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                            View All <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                    </Link>
                </div>

                <div className="flex-1 space-y-3">
                    {inbox && inbox.length > 0 ? (
                        inbox.slice(0, 4).map((msg, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                                    {msg.initials || msg.name?.substring(0, 2).toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-medium text-sm truncate">{msg.name || "Unknown User"}</h4>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">{msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{msg.message || "New message received"}</p>
                                </div>
                                {msg.unread && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
                            <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">No recent messages</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders Widget */}
            <div className="bg-card border rounded-xl p-5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">Recent Orders</h3>
                    </div>
                    <Link href="/dashboard/orders">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                            View All <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                    </Link>
                </div>

                <div className="flex-1 space-y-3">
                    {orders && orders.length > 0 ? (
                        orders.slice(0, 4).map((order, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-muted rounded-md text-muted-foreground">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">Order #{order.id || "000"}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Just now"}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="font-semibold text-sm">₹{order.totalAmount?.toLocaleString() || "0"}</div>
                                        <Badge variant={order.status === "paid" ? "default" : "secondary"} className="text-[10px] px-1.5 h-5">
                                            {order.status || "Pending"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
                            <Package className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">No orders yet</p>
                            <Link href="/catalog" className="mt-2 text-primary text-xs hover:underline">
                                Share catalog to get orders
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
