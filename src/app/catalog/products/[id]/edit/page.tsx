"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
    ArrowLeft,
    Save,
    Loader2,
    Package,
    Upload,
    X,
    Lock,
    Info,
    Smartphone,
    TrendingUp,
    ShieldAlert,
    BrainCircuit,
    History
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProtectedPage from "@/components/ProtectedPage";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];

interface SizeStock {
    size: string;
    stock: number | "";
}

interface ProductFormData {
    name: string;
    price: number | "";
    costPrice: number | "";
    imageUrl: string;
    inStock: boolean;
    stock: number | "";
    lowStockThreshold: number | "";
    outOfStockBehavior: string;
    category: string;
    shortDescription: string;
    sizesEnabled: boolean;
    selectedSizes: string[];
    sizeStocks: SizeStock[];
    compareAtPrice: number | "";
    barcode: string;
    vendor: string;
    supplierName: string;
    template: string;
    returnPolicy: string;
    ageRestricted: boolean;
    tags: string[];
    minOrderValueCOD: number | "";
    partialPaymentPercentage: number | "";
    requiresCODConfirmation: boolean;
    visibleToAI: boolean;
    aiPriority: number | "";
    upsellPriority: number | "";
}

function EditProductContent() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        price: "",
        costPrice: "",
        imageUrl: "",
        inStock: true,
        stock: "",
        lowStockThreshold: 5,
        outOfStockBehavior: "stop_selling",
        category: "",
        shortDescription: "",
        sizesEnabled: false,
        selectedSizes: [],
        sizeStocks: [],
        compareAtPrice: "",
        barcode: "",
        vendor: "",
        supplierName: "",
        template: "",
        returnPolicy: "",
        ageRestricted: false,
        tags: [],
        minOrderValueCOD: "",
        partialPaymentPercentage: "",
        requiresCODConfirmation: false,
        visibleToAI: true,
        aiPriority: 0,
        upsellPriority: 0,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [userPlan, setUserPlan] = useState("starter_999"); // Default to starter

    // MVP: All users can access all edit features regardless of plan
    const isAdvanced = true;

    useUnsavedChanges(hasUnsavedChanges);

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem("bearer_token");
                const res = await fetch(`/api/products/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error("Failed to fetch product");

                const product = await res.json();

                // Also fetch user plan info if possible, or assume from session
                // For now, we'll just check if the product has advanced data or fetch session
                const sessionRes = await fetch("/api/auth/session");
                if (sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    setUserPlan(sessionData?.user?.planId || "starter_999");
                }

                setFormData({
                    name: product.name || "",
                    price: product.price || "",
                    costPrice: product.costPrice || "",
                    imageUrl: product.imageUrl || "",
                    inStock: product.status === 'active',
                    stock: product.stock !== undefined ? product.stock : "",
                    lowStockThreshold: product.lowStockThreshold || 5,
                    outOfStockBehavior: product.outOfStockBehavior || "stop_selling",
                    category: product.category || "",
                    shortDescription: product.shortDescription || "",
                    sizesEnabled: product.sizesEnabled || (product.sizeStocks && product.sizeStocks.length > 0) || false,
                    selectedSizes: product.selectedSizes || [],
                    sizeStocks: product.sizeStocks || [],
                    compareAtPrice: product.compareAtPrice || "",
                    barcode: product.barcode || "",
                    vendor: product.vendor || "",
                    supplierName: product.supplierName || "",
                    template: product.template || "",
                    returnPolicy: product.returnPolicy || "",
                    ageRestricted: product.ageRestricted || false,
                    tags: product.tags || [],
                    minOrderValueCOD: product.minOrderValueCOD || "",
                    partialPaymentPercentage: product.partialPaymentPercentage || "",
                    requiresCODConfirmation: product.requiresCODConfirmation || false,
                    visibleToAI: product.visibleToAI ?? true,
                    aiPriority: product.aiPriority || 0,
                    upsellPriority: product.upsellPriority || 0,
                });

                setImagePreview(product.imageUrl || "");
            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Failed to load product");
                router.replace("/catalog");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [productId, router]);

    const handleInputChange = (field: keyof ProductFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("bearer_token");
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const { url } = await res.json();
            handleInputChange("imageUrl", url);
            setImagePreview(url);
            toast.success("Image uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload image");
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            handleInputChange("tags", [...formData.tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tag: string) => {
        handleInputChange(
            "tags",
            formData.tags.filter((t) => t !== tag)
        );
    };

    const handleSizeToggle = (size: string) => {
        const isSelected = formData.selectedSizes.includes(size);
        if (isSelected) {
            handleInputChange(
                "selectedSizes",
                formData.selectedSizes.filter((s) => s !== size)
            );
            handleInputChange(
                "sizeStocks",
                formData.sizeStocks.filter((ss) => ss.size !== size)
            );
        } else {
            handleInputChange("selectedSizes", [...formData.selectedSizes, size]);
            handleInputChange("sizeStocks", [
                ...formData.sizeStocks,
                { size, stock: "" },
            ]);
        }
    };

    const handleSizeStockChange = (size: string, stock: number | "") => {
        handleInputChange(
            "sizeStocks",
            formData.sizeStocks.map((ss) => (ss.size === size ? { ...ss, stock } : ss))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const token = localStorage.getItem("bearer_token");
            const res = await fetch(`/api/products/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to update product");

            toast.success("Product updated successfully!");
            setHasUnsavedChanges(false);
            router.replace("/catalog");
            router.refresh();
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Failed to update product");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading product...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Catalog
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Package className="w-8 h-8 text-primary" />
                        <span className="gradient-text">Edit Product</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Update product details and save changes
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="glass-card p-6 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            Basic Information
                        </h2>

                        <div className="space-y-4">
                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Category *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.category}
                                        onChange={(e) => handleInputChange("category", e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="e.g., Clothing, Electronics"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Vendor / Brand
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.vendor}
                                        onChange={(e) => handleInputChange("vendor", e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="e.g., Nike, Samsung"
                                    />
                                </div>
                            </div>

                            {/* Short Description */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Short Description *
                                </label>
                                <textarea
                                    required
                                    value={formData.shortDescription}
                                    onChange={(e) =>
                                        handleInputChange("shortDescription", e.target.value)
                                    }
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    rows={3}
                                    placeholder="Brief description for catalog"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Advanced Logic */}
                    <div className="glass-card p-6 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Pricing & Advanced Options
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "price",
                                            e.target.value === "" ? "" : parseFloat(e.target.value)
                                        )
                                    }
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Compare at price (₹)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.compareAtPrice}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "compareAtPrice",
                                            e.target.value === "" ? "" : parseFloat(e.target.value)
                                        )
                                    }
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="MSRP"
                                />
                            </div>

                            <div className={!isAdvanced ? "opacity-60 relative group" : ""}>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                    Cost Price (₹)
                                    {!isAdvanced && <Lock className="w-3 h-3" />}
                                </label>
                                <input
                                    type="number"
                                    disabled={!isAdvanced}
                                    value={formData.costPrice}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "costPrice",
                                            e.target.value === "" ? "" : parseFloat(e.target.value)
                                        )
                                    }
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                                    placeholder="Your cost"
                                />
                                {!isAdvanced && (
                                    <div className="absolute inset-0 bg-background/5 hidden group-hover:flex items-center justify-center cursor-not-allowed">
                                        <span className="bg-primary text-white text-[10px] px-2 py-1 rounded">PRO FEATURE</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Inventory Control */}
                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <History className="w-5 h-5 text-primary" />
                                Inventory Control
                            </h2>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="inStock"
                                    checked={formData.inStock}
                                    onChange={(e) => handleInputChange("inStock", e.target.checked)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <label htmlFor="inStock" className="text-sm font-medium">
                                    Active / In Stock
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Main Stock Count
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "stock",
                                            e.target.value === "" ? "" : parseInt(e.target.value)
                                        )
                                    }
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Available units"
                                />
                            </div>

                            <div className={!isAdvanced ? "opacity-60" : ""}>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                    Low Stock Threshold
                                    {!isAdvanced && <Lock className="w-3 h-3 text-amber-500" />}
                                </label>
                                <input
                                    type="number"
                                    disabled={!isAdvanced}
                                    value={formData.lowStockThreshold}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "lowStockThreshold",
                                            e.target.value === "" ? "" : parseInt(e.target.value)
                                        )
                                    }
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                                    placeholder="Threshold for alerts"
                                />
                            </div>

                            <div className={!isAdvanced ? "opacity-60" : ""}>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                    Out of Stock Behavior
                                    {!isAdvanced && <Lock className="w-3 h-3 text-amber-500" />}
                                </label>
                                <select
                                    disabled={!isAdvanced}
                                    title="Out of Stock Behavior"
                                    aria-label="Out of Stock Behavior"
                                    value={formData.outOfStockBehavior}
                                    onChange={(e) => handleInputChange("outOfStockBehavior", e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                                >
                                    <option value="stop_selling">Stop Selling</option>
                                    <option value="hide">Hide Product</option>
                                    <option value="preorder">Allow Pre-orders</option>
                                    <option value="switch_to_online">Switch to Online Only (Prepaid)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Barcode / SKU (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.barcode}
                                    onChange={(e) => handleInputChange("barcode", e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="UPC / EAN / SKU"
                                />
                            </div>
                        </div>

                        {!isAdvanced && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                                <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                <div className="text-sm text-amber-800">
                                    <strong>Advanced Inventory Management</strong> is available on Growth and higher plans. Upgrade to unlock smart stock thresholds and behavior rules.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div className="glass-card p-6 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-primary" />
                            Media Assets
                        </h2>

                        <div className="space-y-4">
                            {imagePreview && (
                                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border bg-black/5 flex items-center justify-center">
                                    <Image
                                        src={imagePreview}
                                        alt="Product preview"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium mb-2">
                                        Upload Image
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        aria-label="Upload New Image"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        External Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={(e) => {
                                            handleInputChange("imageUrl", e.target.value);
                                            setImagePreview(e.target.value);
                                        }}
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Payment Rules */}
                    {isAdvanced && (
                        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-primary/50">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-primary" />
                                Advanced Payment Rules
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Min Order Value for COD (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minOrderValueCOD}
                                        onChange={(e) => handleInputChange("minOrderValueCOD", e.target.value === "" ? "" : parseFloat(e.target.value))}
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="e.g., 500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Partial Payment (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.partialPaymentPercentage}
                                        onChange={(e) => handleInputChange("partialPaymentPercentage", e.target.value === "" ? "" : parseInt(e.target.value))}
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="e.g., 20"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Require partial payment for COD orders.</p>
                                </div>

                                <div className="flex items-center gap-3 pt-8">
                                    <input
                                        type="checkbox"
                                        id="requiresCODConfirmation"
                                        checked={formData.requiresCODConfirmation}
                                        onChange={(e) => handleInputChange("requiresCODConfirmation", e.target.checked)}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="requiresCODConfirmation" className="text-sm font-medium">
                                        Force COD Confirmation
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI intelligence Section */}
                    <div className="glass-card p-6 rounded-2xl overflow-hidden relative">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-primary" />
                            AI Stock Intelligence
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <label htmlFor="visibleToAI">
                                    <p className="font-medium text-sm">Visible to AI</p>
                                    <p className="text-xs text-muted-foreground">Allow AI to suggest this product.</p>
                                </label>
                                <input
                                    type="checkbox"
                                    id="visibleToAI"
                                    title="Visible to AI"
                                    checked={formData.visibleToAI}
                                    onChange={(e) => handleInputChange("visibleToAI", e.target.checked)}
                                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                                />
                            </div>

                            <div className={!isAdvanced ? "opacity-60" : ""}>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                    AI Recommendation Priority
                                    {!isAdvanced && <Lock className="w-3 h-3 text-primary" />}
                                </label>
                                <input
                                    type="number"
                                    disabled={!isAdvanced}
                                    value={formData.aiPriority}
                                    onChange={(e) => handleInputChange("aiPriority", e.target.value === "" ? "" : parseInt(e.target.value))}
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                                    placeholder="Higher = More shown"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Size Variants */}
                    <div className="glass-card p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-primary" />
                                Product Variants
                            </h2>
                            <label className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full cursor-pointer hover:bg-muted/80 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.sizesEnabled}
                                    onChange={(e) =>
                                        handleInputChange("sizesEnabled", e.target.checked)
                                    }
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-xs font-medium">Enable Variations</span>
                            </label>
                        </div>

                        {formData.sizesEnabled && (
                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_SIZES.map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => handleSizeToggle(size)}
                                            className={`px-4 py-2 rounded-lg border transition-all ${formData.selectedSizes.includes(size)
                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                                : "border-border hover:border-primary/50"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>

                                {formData.sizeStocks.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-xl">
                                        {formData.sizeStocks.map((ss) => (
                                            <div key={ss.size} className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border">
                                                <span className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-md text-xs font-bold">{ss.size}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={ss.stock}
                                                    onChange={(e) =>
                                                        handleSizeStockChange(
                                                            ss.size,
                                                            e.target.value === ""
                                                                ? ""
                                                                : parseInt(e.target.value)
                                                        )
                                                    }
                                                    className="flex-1 px-3 py-1.5 rounded-md border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                                                    placeholder="Stock"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="glass-card p-6 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <X className="w-5 h-5 text-primary" />
                            Search & Indexing
                        </h2>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                                    className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Add tags (e.g. Summer, Men, Sale)"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Add
                                </button>
                            </div>

                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-primary/70 transition-colors"
                                                aria-label={`Remove tag ${tag}`}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 sticky bottom-6 z-10 p-2 bg-background/80 backdrop-blur-md border border-border rounded-2xl shadow-2xl">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Updating Product...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Catalog Changes
                                </>
                            )}
                        </button>

                        <Link
                            href="/catalog"
                            className="px-8 py-4 border border-border rounded-xl hover:bg-muted transition-colors text-center font-medium"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default function EditProductPage() {
    return (
        <ProtectedPage>
            <EditProductContent />
        </ProtectedPage>
    );
}
