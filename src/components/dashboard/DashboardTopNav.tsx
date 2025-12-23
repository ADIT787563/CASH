"use client";

import { Bell, Search, Menu, HelpCircle, LogOut } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function DashboardTopNav() {
    const [showNotifications, setShowNotifications] = useState(false);
    const router = useRouter();

    const notifications = [
        { id: 1, title: "New Order #1042", time: "2 min ago", read: false },
        { id: 2, title: "Payment ₹1,200 Received", time: "1 hour ago", read: false },
        { id: 3, title: "Low Stock: Red T-Shirt", time: "3 hours ago", read: true },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/");
    }

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-[#0f0518]/90 backdrop-blur-md border-b border-white/10 z-30 flex items-center justify-between px-4 md:px-6 lg:pl-72 transition-all duration-300">
            {/* Left: Mobile Menu Trigger (Visible only on mobile) */}
            <div className="lg:hidden flex items-center">
                {/* Placeholder for alignment, actual trigger is in Sidebar */}
                <div className="w-8" />
            </div>

            {/* Center/Right: Actions */}
            <div className="ml-auto flex items-center gap-2 md:gap-4">
                {/* Help Button */}
                <Link
                    href="/dashboard/help"
                    className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-colors hidden sm:flex"
                    title="Help & Support"
                >
                    <HelpCircle className="w-5 h-5" />
                </Link>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-colors relative"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-[#0f0518]" />
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowNotifications(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1025] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full">{unreadCount} New</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.map((n) => (
                                        <div key={n.id} className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!n.read ? 'bg-indigo-500/5' : ''}`}>
                                            <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-white/60'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-[10px] text-white/40 mt-1">{n.time}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-2 text-center border-t border-white/5 bg-white/5">
                                    <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                                        Mark all as read
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User Profile / Logout (Mobile/Tablet accessibility) */}
                <button
                    onClick={handleSignOut}
                    className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg border border-white/10 hover:opacity-90 transition-opacity"
                    title="Sign Out"
                >
                    M
                </button>
            </div>
        </header>
    );
}
