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
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
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
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#0f0518]/90 text-white rounded-md border border-white/10 backdrop-blur-md"
                aria-label="Toggle Mobile Menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar Container */}
            <aside
                className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-[#0f0518]/95 backdrop-blur-xl border-r border-white/10 text-white transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center px-6 border-b border-white/10">
                        <span className="text-lg font-bold gradient-text tracking-tight">WaveGroww</span>
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded">ENT</span>
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
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                                            ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(192,132,252,0.2)]"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                        }
                  `}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Loop */}
                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
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

