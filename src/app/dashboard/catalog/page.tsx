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
    MessageSquare
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
    category: string;
    stock: number;
    imageUrl: string | null;
    status: "ACTIVE" | "DISABLED" | "DRAFT";
    paymentMode: "ALL" | "ONLINE_ONLY" | "COD_ONLY";
}

// Mock Data because existing API might be empty
const initialProducts: Product[] = [
    { id: 101, name: "Premium Leather Sneaker", price: 2999, category: "Footwear", stock: 12, imageUrl: null, status: "ACTIVE", paymentMode: "ALL" },
    { id: 102, name: "Urban Cargo Pants", price: 1499, category: "Apparel", stock: 0, imageUrl: null, status: "ACTIVE", paymentMode: "COD_ONLY" },
    { id: 103, name: "Summer Tee", price: 599, category: "Apparel", stock: 50, imageUrl: null, status: "DISABLED", paymentMode: "ONLINE_ONLY" },
];

export default function CatalogPage() {
    const router = useRouter();
    const { checkPermission, isPending: roleLoading } = useRole();
    const [products, setProducts] = useState(initialProducts); // Using local state for logic demo
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("ALL");

    // --- Logic Implementations ---

    const toggleStatus = async (id: number) => {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 600));
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                const newStatus = p.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
                return { ...p, status: newStatus };
            }
            return p;
        }));
    };

    const togglePaymentMode = (id: number) => {
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                const modes: Product["paymentMode"][] = ["ALL", "ONLINE_ONLY", "COD_ONLY"];
                const currentIndex = modes.indexOf(p.paymentMode);
                const nextMode = modes[(currentIndex + 1) % modes.length];
                toast.info(`Payment Mode updated to: ${nextMode}`);
                return { ...p, paymentMode: nextMode };
            }
            return p;
        }));
    };

    const updateStock = (id: number, delta: number) => {
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                const newStock = Math.max(0, p.stock + delta);
                return { ...p, stock: newStock };
            }
            return p;
        }));
    };

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = filter === "ALL"
            || (filter === "LOW_STOCK" && p.stock < 10 && p.stock > 0)
            || (filter === "OUT_OF_STOCK" && p.stock === 0)
            || (filter === "DISABLED" && p.status === "DISABLED");
        return matchSearch && matchFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Inventory Control</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Manage stock, logic, and payment rules.
                    </p>
                </div>
                <div className="flex gap-2">
                    <ActionButton icon={<RefreshCw className="w-4 h-4" />} variant="secondary" onClick={() => window.location.reload()} />
                    <ActionButton
                        onAction={() => router.push("/catalog/products/new")}
                        icon={checkPermission("manage:catalog") ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        disabled={!checkPermission("manage:catalog")}
                    >
                        Add Product
                    </ActionButton>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search SKU or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                        <option value="ALL">All Products</option>
                        <option value="LOW_STOCK">Low Stock</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                        <option value="DISABLED">Disabled</option>
                    </select>
                </div>
            </div>

            {/* Product Logic Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 w-16">Img</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Payment Logic</th>
                                <th className="px-6 py-4">State</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className={`transition-colors ${product.status === 'DISABLED' ? 'bg-slate-50 opacity-75' : 'hover:bg-slate-50'}`}>
                                    <td className="px-6 py-4">
                                        <div className="relative w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                            {product.imageUrl ? (
                                                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5 text-slate-300" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white">{product.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-500 px-1.5 py-0.5 rounded bg-slate-100">{product.category}</span>
                                            <span className="text-xs font-mono font-bold text-slate-700">₹{product.price}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`font-mono font-bold ${product.stock === 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                                                {product.stock}
                                            </span>
                                            <div className="flex gap-1">
                                                <button onClick={() => updateStock(product.id, -1)} className="w-6 h-6 flex items-center justify-center border rounded hover:bg-slate-100">-</button>
                                                <button onClick={() => updateStock(product.id, 1)} className="w-6 h-6 flex items-center justify-center border rounded hover:bg-slate-100">+</button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => togglePaymentMode(product.id)}
                                            className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-100 hover:border-indigo-300 transition-all uppercase tracking-wide"
                                        >
                                            {product.paymentMode === "ALL" && <><Wallet className="w-3 h-3" /> All Methods</>}
                                            {product.paymentMode === "ONLINE_ONLY" && <><CreditCard className="w-3 h-3 text-indigo-500" /> Online Only</>}
                                            {product.paymentMode === "COD_ONLY" && <><Banknote className="w-3 h-3 text-emerald-600" /> COD Only</>}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <ActionButton
                                            variant={product.status === 'ACTIVE' ? 'secondary' : 'ghost'}
                                            className={`h-6 text-[10px] px-2 uppercase tracking-wider ${product.status === 'ACTIVE' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-slate-500'}`}
                                            onAction={() => toggleStatus(product.id)}
                                            successMessage={product.status === "ACTIVE" ? "Product Disabled" : "Product Enabled"}
                                        >
                                            {product.status}
                                        </ActionButton>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <ActionButton
                                                variant="ghost"
                                                className="p-2 h-auto text-green-600 bg-green-50 hover:bg-green-100 border border-green-200"
                                                icon={<MessageSquare className="w-4 h-4" />}
                                                onAction={() => { toast.info("Opening WhatsApp Preview..."); }}
                                                title="See how customer sees this"
                                            />
                                            <ActionButton
                                                variant="ghost"
                                                className="p-2 h-auto"
                                                icon={<Edit className="w-4 h-4" />}
                                            />
                                            <ActionButton
                                                variant="ghost"
                                                requiresConfirm
                                                confirmMessage="Delete?"
                                                icon={checkPermission("delete:product") ? <Trash2 className="w-4 h-4 text-rose-400" /> : <Lock className="w-4 h-4 text-slate-300" />}
                                                disabled={!checkPermission("delete:product")}
                                                onAction={() => { toast.info("Delete simulated"); }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
