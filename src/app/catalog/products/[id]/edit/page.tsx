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
    imageUrl: string;
    inStock: boolean;
    stock: number | "";
    category: string;
    shortDescription: string;
    sizesEnabled: boolean;
    selectedSizes: string[];
    sizeStocks: SizeStock[];
    compareAtPrice: number | "";
    barcode: string;
    vendor: string;
    template: string;
    returnPolicy: string;
    ageRestricted: boolean;
    tags: string[];
}

function EditProductContent() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        price: "",
        imageUrl: "",
        inStock: true,
        stock: "",
        category: "",
        shortDescription: "",
        sizesEnabled: false,
        selectedSizes: [],
        sizeStocks: [],
        compareAtPrice: "",
        barcode: "",
        vendor: "",
        template: "",
        returnPolicy: "",
        ageRestricted: false,
        tags: [],
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [imagePreview, setImagePreview] = useState("");

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

                setFormData({
                    name: product.name || "",
                    price: product.price || "",
                    imageUrl: product.imageUrl || "",
                    inStock: product.inStock ?? true,
                    stock: product.stock || "",
                    category: product.category || "",
                    shortDescription: product.shortDescription || "",
                    sizesEnabled: product.sizesEnabled || false,
                    selectedSizes: product.selectedSizes || [],
                    sizeStocks: product.sizeStocks || [],
                    compareAtPrice: product.compareAtPrice || "",
                    barcode: product.barcode || "",
                    vendor: product.vendor || "",
                    template: product.template || "",
                    returnPolicy: product.returnPolicy || "",
                    ageRestricted: product.ageRestricted || false,
                    tags: product.tags || [],
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
                        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

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
                                    placeholder="Brief description of the product"
                                />
                            </div>

                            {/* Price & Category */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
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
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Stock Quantity *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "stock",
                                            e.target.value === "" ? "" : parseInt(e.target.value)
                                        )
                                    }
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="0"
                                />
                            </div>

                            {/* In Stock Toggle */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="inStock"
                                    checked={formData.inStock}
                                    onChange={(e) => handleInputChange("inStock", e.target.checked)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <label htmlFor="inStock" className="text-sm font-medium">
                                    Product is in stock
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="glass-card p-6 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-4">Product Image</h2>

                        <div className="space-y-4">
                            {imagePreview && (
                                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border">
                                    <Image
                                        src={imagePreview}
                                        alt="Product preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Upload New Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Or Enter Image URL
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

                    {/* Size Variants */}
                    <div className="glass-card p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Size Variants</h2>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.sizesEnabled}
                                    onChange={(e) =>
                                        handleInputChange("sizesEnabled", e.target.checked)
                                    }
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm">Enable sizes</span>
                            </label>
                        </div>

                        {formData.sizesEnabled && (
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_SIZES.map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => handleSizeToggle(size)}
                                            className={`px-4 py-2 rounded-lg border transition-all ${formData.selectedSizes.includes(size)
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "border-border hover:border-primary"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>

                                {formData.sizeStocks.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Stock per size:</p>
                                        {formData.sizeStocks.map((ss) => (
                                            <div key={ss.size} className="flex items-center gap-4">
                                                <span className="w-12 text-sm font-medium">{ss.size}</span>
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
                                                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
                        <h2 className="text-xl font-semibold mb-4">Tags</h2>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                                    className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Add a tag and press Enter"
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
                                            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-primary/70"
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
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>

                        <Link
                            href="/catalog"
                            className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors text-center"
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
