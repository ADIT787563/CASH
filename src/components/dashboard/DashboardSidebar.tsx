"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Settings,
    Bot,
    BarChart3,
    Users,
    ShoppingBag,
    FileText,
    LogOut,
    Menu
} from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Leads", href: "/dashboard/leads", icon: Users },
    { label: "Catalog", href: "/dashboard/catalog", icon: ShoppingBag },
    { label: "AI Chatbot", href: "/dashboard/chatbot", icon: Bot },
    { label: "Templates", href: "/dashboard/templates", icon: FileText },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleSignOut = async () => {
        await authClient.signOut();
        window.location.href = "/";
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-md"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar Container */}
            <aside
                className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-slate-950 border-r border-slate-800 text-slate-300 transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-800">
                        <span className="text-lg font-bold text-white tracking-tight">WaveGroww</span>
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-indigo-500/20 text-indigo-400 rounded">ENT</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                                            ? "bg-indigo-600/10 text-indigo-400"
                                            : "hover:bg-slate-900 hover:text-white"
                                        }
                  `}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Loop */}
                    <div className="p-4 border-t border-slate-800">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                />
            )}
        </>
    );
}

