"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import {
  MessageCircle,
  Menu,
  X,
  LayoutDashboard,
  Bot,
  Package,
  Users,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useContent } from "@/hooks/useConfig";
import { Logo } from "@/components/Logo";

export const Header = () => {
  const pathname = usePathname();

  // Hide header on store pages
  if (pathname.startsWith('/shop/')) {
    return null;
  }

  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [customLogos, setCustomLogos] = useState<{ light: string | null; dark: string | null }>({ light: null, dark: null });

  useEffect(() => {
    if (user) {
      fetch("/api/business-settings", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("bearer_token")}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setCustomLogos({
              light: data.logoUrl || null,
              dark: data.logoUrlDark || null
            });
          }
        })
        .catch(err => console.error("Failed to fetch branding:", err));
    }
  }, [user]);

  const [scrolled, setScrolled] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      window.location.href = "/";
      toast.success("Signed out successfully");
    }
  };

  const navItems = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Chatbot", href: "/chatbot", icon: Bot },
    { name: "Catalog", href: "/catalog", icon: Package },
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Templates", href: "/templates", icon: FileText },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  const { data: content } = useContent();

  // Landing page navigation items
  const landingNavItems: { name: string; href: string }[] = content?.header_menu || [
    { name: "Product", href: "/product" },
    { name: "Pricing", href: "/plans" },
    { name: "Features", href: "/features" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const profileMenuItems = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  // Landing page routes allowlist
  const landingRoutes = ["/", "/product", "/plans", "/about", "/features", "/reviews", "/contact"];

  // Check if current path is a landing page
  const isLandingPage = landingRoutes.some(route =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );

  // Everything else is considered a dashboard/app route (except auth)
  const isAuthRoute = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";
  const isDashboardRoute = !isLandingPage && !isAuthRoute;

  // Only show nav items on dashboard pages when user is logged in
  const showNavItems = isDashboardRoute && user;

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setMobileMenuOpen(false);
      }
    }
  };

  // Dynamic header classes based on page and scroll
  const headerClasses = isLandingPage
    ? "fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl rounded-full glass-card transition-all duration-500"
    : "sticky top-0 z-[100] w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60";

  return (
    <header className={headerClasses}>
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo
              className="w-8 h-8"
              lightLogo={customLogos.light}
              darkLogo={customLogos.dark}
            />
            <span className="text-xl font-bold gradient-text">WaveGroww</span>
          </Link>

          {/* Desktop Navigation - Landing Page */}
          {isLandingPage && (
            <nav className="hidden lg:flex items-center gap-6">
              {landingNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Desktop Navigation - Dashboard Pages */}
          {showNavItems && (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-medium transition-all duration-200 active:scale-[0.98] ${isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Side - Theme Toggle & Profile/Auth */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Theme Toggle Removed */}

            {/* Show loading state during session check */}
            {loading && (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            )}
            {/* Show loading spinner while session pending for catalog navigation */}
            {loading && (
              <span className="ml-2 text-sm text-muted-foreground">Checking auth…</span>
            )}
            {/* Profile Menu - Show when logged in on ANY page */}
            {!loading && user && (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200 active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {/* <p className="text-[10px] text-muted-foreground/70">
                      {(user as any).plan && (user as any).plan !== 'starter' ? (user as any).plan.charAt(0).toUpperCase() + (user as any).plan.slice(1) : "Free"} Plan
                    </p> */}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                      {profileMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            {item.name}
                          </Link>
                        );
                      })}
                      <hr className="my-1 border-border" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-all duration-200 active:scale-95 w-full text-left text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Auth Buttons - Only show when NOT logged in */}
            {!loading && !user && (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-all duration-200 active:scale-95"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-all duration-200 active:scale-95"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4">
            <nav className="flex flex-col gap-1">
              {/* Landing Page Navigation in Mobile */}
              {isLandingPage && landingNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    handleSmoothScroll(e, item.href);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {item.name}
                </Link>
              ))}

              {/* Dashboard Navigation in Mobile */}
              {showNavItems && navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Profile Menu Items - Show for logged in users */}
              {!loading && user && (
                <>
                  <hr className="my-2 border-border" />
                  {profileMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-muted transition-colors text-left w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              )}

              {/* Mobile Auth Buttons - Show for guests */}
              {!loading && !user && (
                <>
                  <hr className="my-2 border-border" />
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};