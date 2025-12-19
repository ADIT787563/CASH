"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Bell,
    ChevronDown,
    LogOut,
    Settings,
    User
} from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "AI Chatbot", href: "/dashboard/chatbot" },
    { label: "Leads", href: "/dashboard/leads" },
    { label: "Catalog", href: "/dashboard/catalog" },
    { label: "Analytics", href: "/dashboard/analytics" },
    { label: "Templates", href: "/dashboard/templates" },
];

export function DashboardTopNav() {
    const pathname = usePathname();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await authClient.signOut();
        window.location.href = "/";
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 z-50 px-4 flex items-center justify-between">
            {/* Left: Logo & Nav */}
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center rounded-md font-bold text-sm tracking-tighter">
                        WG
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white hidden sm:block">WaveGroww</span>
                </div>

                <nav className="hidden md:flex items-center gap-6">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`text-sm font-medium transition-colors relative py-4
                  ${isActive
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    }
                `}
                            >
                                {item.label}
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Date Range Selector Placeholder */}
                <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span>Today, Dec 17</span>
                    <ChevronDown className="w-3 h-3" />
                </button>

                <button className="relative p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-950" />
                </button>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 ml-2"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-medium">
                            JD
                        </div>
                    </button>

                    {isUserMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsUserMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-50">
                                <Link
                                    href="/dashboard/settings"
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-left"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
