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
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const NAV_ITEMS = [
    { label: "Home", href: "/dashboard" },
    { label: "Orders", href: "/dashboard/orders" },
    { label: "Customers", href: "/dashboard/customers" },
    { label: "Inbox", href: "/dashboard/inbox" },
    { label: "AI Chatbot", href: "/dashboard/chatbot" },
    { label: "Leads", href: "/dashboard/leads" },
    { label: "Catalog", href: "/dashboard/catalog" },
    { label: "Analytics", href: "/dashboard/analytics" },
    { label: "Templates", href: "/dashboard/templates" },
];

export function DashboardTopNav() {
    const pathname = usePathname();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Theme toggle removed

    const handleSignOut = async () => {
        await authClient.signOut();
        window.location.href = "/";
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-[#0f0518]/80 backdrop-blur-xl border-b border-white/10 z-50 px-4 flex items-center justify-between">
            {/* Left: Logo & Nav */}
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/20 text-primary flex items-center justify-center rounded-md font-bold text-sm tracking-tighter">
                        WG
                    </div>
                    <span className="font-semibold text-white hidden sm:block">WaveGroww</span>
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
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-white"
                                    }
                `}
                            >
                                {item.label}
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(192,132,252,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Date Range Selector Placeholder */}
                <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:text-white transition-colors">
                    <span>Today, Dec 17</span>
                    <ChevronDown className="w-3 h-3" />
                </button>

                {/* Theme Toggle Removed */}

                <button className="relative p-2 text-muted-foreground hover:text-white transition-colors" aria-label="Notifications">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-[#0f0518]" />
                </button>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 pl-2 border-l border-white/10 ml-2"
                        aria-label="User Menu"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium border border-primary/20">
                            JD
                        </div>
                    </button>

                    {isUserMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsUserMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a0b2e] border border-white/10 rounded-lg shadow-lg py-1 z-50">
                                <Link
                                    href="/dashboard/settings"
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-white"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 text-left"
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
