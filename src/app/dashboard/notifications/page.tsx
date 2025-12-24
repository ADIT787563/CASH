"use client";

import { useState } from "react";
import { Bell, Check, Trash2, Calendar, ShoppingBag, Megaphone, Info } from "lucide-react";
import { ActionButton } from "@/components/ui/ActionButton";

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        title: "New Order #1042",
        time: "2 min ago",
        read: false,
        description: "A new order has been placed for \u20b91,200.",
        type: "order",
        date: "2025-12-23"
    },
    {
        id: 2,
        title: "Payment Received",
        time: "1 hour ago",
        read: false,
        description: "Payment for order #1039 has been confirmed and settled.",
        type: "payment",
        date: "2025-12-23"
    },
    {
        id: 3,
        title: "Campaign Completed",
        time: "3 hours ago",
        read: true,
        description: "Your 'Winter Sale' campaign has finished sending to 450 recipients.",
        type: "campaign",
        date: "2025-12-23"
    },
    {
        id: 4,
        title: "System Update",
        time: "Yesterday",
        read: true,
        description: "We've added new features to the analytics dashboard. Check them out!",
        type: "info",
        date: "2025-12-22"
    },
    {
        id: 5,
        title: "New Lead Captured",
        time: "Yesterday",
        read: true,
        description: "A new lead 'Aditya' has messaged your WhatsApp business account.",
        type: "info",
        date: "2025-12-22"
    }
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const deleteNotification = (id: number) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "order": return <ShoppingBag className="w-5 h-5 text-indigo-600" />;
            case "payment": return <Check className="w-5 h-5 text-emerald-600" />;
            case "campaign": return <Megaphone className="w-5 h-5 text-amber-600" />;
            default: return <Info className="w-5 h-5 text-zinc-400" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 text-zinc-900 pb-10">
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-4 py-8">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-2">
                    <Bell className="w-8 h-8 text-zinc-900" />
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight italic">Notifications</h1>
                    <p className="text-sm text-zinc-500 mt-1 font-medium">Stay updated with your latest business activity.</p>
                </div>
                <div className="flex gap-4">
                    <ActionButton
                        variant="secondary"
                        onClick={markAllRead}
                        className="bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 px-6 h-11"
                    >
                        Mark All Read
                    </ActionButton>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {notifications.length === 0 ? (
                    <div className="bg-white border border-dashed border-zinc-200 rounded-2xl p-20 text-center">
                        <p className="text-zinc-400 font-medium">No notifications yet.</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`
                                flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200
                                ${notification.read
                                    ? "bg-white border-zinc-100 opacity-80"
                                    : "bg-indigo-50/30 border-indigo-100 shadow-sm ring-1 ring-indigo-500/5"
                                }
                            `}
                        >
                            <div className={`mt-1 p-2.5 rounded-xl border ${notification.read ? 'bg-zinc-50 border-zinc-100' : 'bg-white border-indigo-100 shadow-sm'}`}>
                                {getIcon(notification.type)}
                            </div>

                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h3 className={`font-bold transition-colors ${notification.read ? 'text-zinc-600' : 'text-zinc-900 text-lg'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{notification.time}</span>
                                </div>
                                <p className={`text-sm leading-relaxed ${notification.read ? 'text-zinc-500' : 'text-zinc-700 font-medium'}`}>
                                    {notification.description}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Mark as read"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
