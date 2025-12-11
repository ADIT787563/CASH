
"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { type StoreData } from "@/lib/store-data";

interface StoreHeaderProps {
    storeData: StoreData;
    cartCount: number;
    onCartClick: () => void;
}

export function StoreHeader({ storeData, cartCount, onCartClick }: StoreHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Theme Config Safe Access
    const theme = (storeData.settings?.themeConfig as any) || {};
    const primaryColor = theme.primaryColor || "#000000";

    // Logo or Name
    const logoUrl = storeData.settings?.logoUrl || storeData.business.logoUrl;
    const storeName = storeData.settings?.businessName || storeData.business.name;

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Brand */}
                    <Link href={`/shop/${storeData.business.slug}`} className="flex items-center gap-2">
                        {logoUrl ? (
                            <img src={logoUrl} alt={storeName} className="h-10 w-auto object-contain max-w-[150px]" />
                        ) : (
                            <h1 className="text-xl font-bold" style={{ color: primaryColor }}>
                                {storeName}
                            </h1>
                        )}
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href={`/shop/${storeData.business.slug}`} className="text-sm font-medium hover:text-gray-600 transition">
                            Home
                        </Link>
                        <Link href={`/shop/${storeData.business.slug}/about`} className="text-sm font-medium hover:text-gray-600 transition">
                            About
                        </Link>
                        <Link href={`/shop/${storeData.business.slug}/contact`} className="text-sm font-medium hover:text-gray-600 transition">
                            Contact
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onCartClick}
                            className="relative p-2 rounded-full hover:bg-gray-100 transition"
                            aria-label="Cart"
                        >
                            <ShoppingBag className="w-6 h-6" style={{ color: primaryColor }} />
                            {cartCount > 0 && (
                                <span
                                    className="absolute -top-1 -right-1 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <button
                            className="md:hidden p-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t bg-white absolute w-full left-0 py-4 shadow-lg">
                    <div className="flex flex-col gap-4 px-4">
                        <Link href={`/shop/${storeData.business.slug}`} onClick={() => setIsMenuOpen(false)}>
                            Home
                        </Link>
                        <Link href={`/shop/${storeData.business.slug}/about`} onClick={() => setIsMenuOpen(false)}>
                            About
                        </Link>
                        <Link href={`/shop/${storeData.business.slug}/contact`} onClick={() => setIsMenuOpen(false)}>
                            Contact
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
