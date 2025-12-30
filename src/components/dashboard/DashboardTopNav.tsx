"use client";

import { Bell, Search, HelpCircle, LogOut, LayoutDashboard, MessageSquare, Users, ShoppingBag, Zap, FileText, BarChart3, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/ui/ModeToggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const NAV_ITEMS = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Leads", href: "/dashboard/leads", icon: Users },
    { label: "Catalog", href: "/dashboard/catalog", icon: ShoppingBag },
    { label: "Templates", href: "/dashboard/templates", icon: FileText },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export function DashboardTopNav() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/");
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        try {
            await fetch("/api/notifications", { method: "PATCH" });
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const userInitial = session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "M";

    return (
        <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-zinc-200 supports-[backdrop-filter]:bg-white/80">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">

                {/* Left: Logo Area */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            W
                        </div>
                        <span className="font-bold text-xl tracking-tight text-zinc-900 hidden md:block">WaveGroww</span>
                    </Link>
                </div>

                {/* Center: Desktop Navigation */}
                <nav className="hidden xl:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                        flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                                        ${isActive
                                        ? "bg-zinc-900 text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                                    }
                                    `}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    <ModeToggle />

                    <div className="relative">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors relative"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
                                <DropdownMenuLabel className="p-4 flex items-center justify-between border-b border-zinc-100">
                                    <span>Notifications</span>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </DropdownMenuLabel>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-pointer relative ${!n.read ? 'bg-indigo-50/30' : ''}`}
                                            >
                                                {!n.read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full" />}
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-sm font-semibold ${!n.read ? 'text-zinc-900' : 'text-zinc-500'}`}>{n.title}</span>
                                                    <span className="text-[10px] text-zinc-400 font-medium">{n.time}</span>
                                                </div>
                                                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{n.description}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <p className="text-sm text-zinc-400">No notifications yet</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-center">
                                    <Link
                                        href="/dashboard/notifications"
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest"
                                    >
                                        View all notifications
                                    </Link>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="ml-2 w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-sm font-bold text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all hover:scale-105 active:scale-95 shadow-sm"
                                title="Account Settings"
                            >
                                {userInitial}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2">
                            <DropdownMenuLabel className="font-normal p-4">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-semibold text-zinc-900 italic">{session?.user?.name || "User Account"}</p>
                                    <p className="text-xs text-zinc-400 font-medium truncate italic">{session?.user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-100" />
                            <DropdownMenuItem asChild className="p-3 cursor-pointer focus:bg-zinc-50">
                                <Link href="/dashboard/settings" className="flex items-center w-full">
                                    <Settings className="mr-3 h-4 w-4 text-zinc-400" />
                                    <span className="font-medium text-zinc-700">Settings</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild className="p-3 cursor-pointer focus:bg-zinc-50">
                                <Link href="/dashboard/help" className="flex items-center w-full">
                                    <HelpCircle className="mr-3 h-4 w-4 text-zinc-400" />
                                    <span className="font-medium text-zinc-700">Help Center</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-100" />
                            <DropdownMenuItem
                                onClick={handleSignOut}
                                className="p-3 cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700 font-semibold"
                            >
                                <LogOut className="mr-3 h-4 w-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Mobile Nav (Horizontal Scroll) - Visible on smaller screens */}
            <div className="xl:hidden border-t border-zinc-100 overflow-x-auto no-scrollbar">
                <nav className="flex items-center px-4 h-12 gap-2 min-w-max">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                        ${isActive
                                        ? "bg-zinc-900 text-white"
                                        : "text-zinc-500 hover:text-zinc-900"
                                    }
                                    `}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}

