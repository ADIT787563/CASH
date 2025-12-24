"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    Package,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Image as ImageIcon,
    RefreshCw,
    Power,
    AlertCircle,
    CreditCard, Wallet, Banknote,
    MessageSquare, Eye, Share2, Stars, MoreVertical
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { ActionButton } from "@/components/ui/ActionButton";
import { useRole } from "@/hooks/useRole";
import { Lock } from "lucide-react";

interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
    stock: number;
    imageUrl: string | null;
    status: "ACTIVE" | "DISABLED" | "DRAFT";
    paymentMode: "ALL" | "ONLINE_ONLY" | "COD_ONLY";
    featured?: boolean;
    discount?: string;
    description?: string;
}

// Mock Data because existing API might be empty
const initialProducts: Product[] = [
    { id: 101, name: "Premium Leather Sneaker", price: 2999, category: "Footwear", stock: 12, imageUrl: null, status: "ACTIVE", paymentMode: "ALL" },
    { id: 102, name: "Urban Cargo Pants", price: 1499, category: "Apparel", stock: 0, imageUrl: null, status: "ACTIVE", paymentMode: "COD_ONLY" },
    { id: 103, name: "Summer Tee", price: 599, category: "Apparel", stock: 50, imageUrl: null, status: "DISABLED", paymentMode: "ONLINE_ONLY" },
];

export default function CatalogPage() {
    const router = useRouter();
    const { checkPermission } = useRole();
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("ALL");

    // Enhanced Mock Data
    const products: Product[] = [
        {
            id: 101,
            name: "Premium Wireless Earbuds",
            price: 1499,
            originalPrice: 2999,
            category: "Electronics",
            stock: 45,
            imageUrl: "https://images.unsplash.com/photo-1572569028738-411a09774e1c?w=800&q=80",
            status: "ACTIVE",
            paymentMode: "ALL",
            featured: true,
            discount: "50% OFF",
            description: "High-quality sound with active noise cancellation, 24-hour battery life."
        },
        {
            id: 102,
            name: "Smart Watch Pro",
            price: 2999,
            originalPrice: 4999,
            category: "Electronics",
            stock: 8,
            imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
            status: "ACTIVE",
            paymentMode: "ONLINE_ONLY",
            featured: true,
            discount: "40% OFF",
            description: "Track your fitness and stay connected with notifications."
        },
        {
            id: 103,
            name: "Portable Bluetooth Speaker",
            price: 999,
            originalPrice: 1499,
            category: "Audio",
            stock: 120,
            imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
            status: "ACTIVE",
            paymentMode: "ALL",
            featured: false,
            discount: "33% OFF",
            description: "Powerful bass with 12-hour battery life, waterproof design."
        },
        {
            id: 104,
            name: "Ergonomic Office Chair",
            price: 5499,
            originalPrice: 8999,
            category: "Furniture",
            stock: 15,
            imageUrl: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80",
            status: "ACTIVE",
            paymentMode: "COD_ONLY",
            featured: false,
            discount: "Save ₹3500",
            description: "Comfortable mesh back with lumbar support and adjustable height."
        },
        {
            id: 105,
            name: "Noise Cancelling Headphones",
            price: 8999,
            originalPrice: 12999,
            category: "Audio",
            stock: 0,
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
            status: "DISABLED",
            paymentMode: "ALL",
            featured: false,
            description: "Over-ear headphones with premium sound quality and plush comfort."
        }
    ];

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = filter === "ALL"
            || (filter === "LOW_STOCK" && p.stock < 10 && p.stock > 0)
            || (filter === "OUT_OF_STOCK" && p.stock === 0)
            || (filter === "DISABLED" && p.status === "DISABLED");
        return matchSearch && matchFilter;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Product Catalog</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage your products, prices, and inventory.
                    </p>
                </div>
                <div className="flex gap-3">
                    <ActionButton
                        onAction={() => router.push("/dashboard/catalog/products/new")}
                        icon={checkPermission("manage:catalog") ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        disabled={!checkPermission("manage:catalog")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 px-6 h-10 rounded-full font-medium transition-all"
                    >
                        Add Product
                    </ActionButton>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-zinc-900/50 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none text-zinc-900 dark:text-white"
                    />
                </div>
                <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-transparent text-sm font-medium text-zinc-600 dark:text-zinc-300 focus:outline-none cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <option value="ALL">All Status</option>
                        <option value="LOW_STOCK">Low Stock</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                        <option value="DISABLED">Disabled</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-zinc-500/10 dark:hover:shadow-black/40 transition-all duration-300 flex flex-col">

                        {/* Image Area */}
                        <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                    <ImageIcon className="w-12 h-12" />
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                {product.discount && (
                                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-rose-500 rounded-md shadow-sm">
                                        {product.discount}
                                    </span>
                                )}
                            </div>
                            {product.featured && (
                                <div className="absolute top-3 right-3">
                                    <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-950 bg-amber-400 rounded-md shadow-sm">
                                        <Stars className="w-3 h-3" /> Featured
                                    </span>
                                </div>
                            )}

                            {/* Hover Overlay Actions */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                <button
                                    onClick={() => router.push(`/dashboard/catalog/products/edit/${product.id}`)}
                                    className="w-10 h-10 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white hover:text-zinc-900 transition-all transform hover:scale-110"
                                    title="Edit Product"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-indigo-500 transition-colors">
                                    {product.name}
                                </h3>
                                <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" aria-label="Product Options">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 h-8">
                                {product.description || `Premium quality ${product.category} item.`}
                            </p>

                            <div className="mt-auto flex items-end justify-between">
                                <div>
                                    <p className="text-xs text-zinc-400 font-medium mb-0.5">Price</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold text-emerald-500">₹{product.price}</span>
                                        {product.originalPrice && (
                                            <span className="text-xs text-zinc-400 line-through">₹{product.originalPrice}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${product.stock > 10 ? 'bg-emerald-500/10 text-emerald-500' :
                                        product.stock > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                                        }`}>
                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
