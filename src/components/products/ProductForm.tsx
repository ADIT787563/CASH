"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
    Package,
    TrendingUp,
    History,
    Upload,
    BrainCircuit,
    MessageSquare,
    ShieldAlert,
    Save,
    ArrowLeft,
    Loader2,
    Lock,
    X,
    Smartphone
} from "lucide-react";
import Link from "next/link";
import { EditTabs } from "@/components/edit/EditTabs";
import { EditActionBar } from "@/components/edit/EditActionBar";
import { EditFormField } from "@/components/edit/EditFormField";
import { MediaUploader } from "@/components/edit/MediaUploader";
import { usePlanUsage } from "@/hooks/usePlanUsage";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];

interface SizeStock {
    size: string;
    stock: number | "";
}

export interface ProductFormData {
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
    barcode: string; // SKU
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

    // New Fields
    whatsappMessage: string;
    aiExplanation: boolean;
    autoAnswerFAQs: boolean;
    internalNotes: string;
    sku: string; // Separate SKU if needed, or map to barcode
}

interface ProductFormProps {
    mode: "create" | "edit";
    productId?: string;
}

export default function ProductForm({ mode, productId }: ProductFormProps) {
    const router = useRouter();

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
        whatsappMessage: "Hi! I'm interested in this product.",
        aiExplanation: true,
        autoAnswerFAQs: true,
        internalNotes: "",
        sku: "",
    });

    const [isLoading, setIsLoading] = useState(mode === "edit");
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [activeTab, setActiveTab] = useState("general");

    // Plan Usage
    const { data: planData } = usePlanUsage();
    const isAdvanced = planData?.plan.limits.productFields === 'advanced' || planData?.plan.limits.productFields === 'full';

    // Delete Modal State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    useUnsavedChanges(hasUnsavedChanges);

    useEffect(() => {
        const fetchProduct = async () => {
            if (mode === "create") return;

            try {
                const token = localStorage.getItem("bearer_token");
                const res = await fetch(`/api/products/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error("Failed to fetch product");
                const product = await res.json();

                // Merge with default values to ensure no undefineds
                setFormData(prev => ({
                    ...prev,
                    ...product,
                    // Ensure numbers are strings if needed or keep numbers
                    stock: product.stock !== undefined ? product.stock : "",
                    // Map existing fields if necessary
                }));

            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Failed to load product");
                router.replace("/catalog");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [mode, productId, router]);

    const handleInputChange = (field: keyof ProductFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            handleInputChange("tags", [...formData.tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tag: string) => {
        handleInputChange("tags", formData.tags.filter((t) => t !== tag));
    };

    const handleSizeToggle = (size: string) => {
        const isSelected = formData.selectedSizes.includes(size);
        if (isSelected) {
            handleInputChange("selectedSizes", formData.selectedSizes.filter((s) => s !== size));
            handleInputChange("sizeStocks", formData.sizeStocks.filter((ss) => ss.size !== size));
        } else {
            handleInputChange("selectedSizes", [...formData.selectedSizes, size]);
            handleInputChange("sizeStocks", [...formData.sizeStocks, { size, stock: "" }]);
        }
    };

    const handleSizeStockChange = (size: string, stock: number | "") => {
        handleInputChange("sizeStocks", formData.sizeStocks.map((ss) => (ss.size === size ? { ...ss, stock } : ss)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error("Product name is required");
            return;
        }
        if (formData.price === "" || Number(formData.price) < 0) {
            toast.error("Valid price is required");
            return;
        }
        if (!formData.category) {
            toast.error("Category is required");
            return;
        }

        setIsSaving(true);

        try {
            const token = localStorage.getItem("bearer_token");
            const url = mode === "create" ? "/api/products" : `/api/products/${productId}`;
            const method = mode === "create" ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error(`Failed to ${mode} product`);

            toast.success(`Product ${mode === "create" ? "created" : "updated"} successfully!`);
            setHasUnsavedChanges(false);
            router.push("/catalog");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error(`Failed to ${mode} product`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem("bearer_token");
            const res = await fetch(`/api/products/${productId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to delete product");

            toast.success("Product deleted successfully");
            router.push("/catalog");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete product");
            setIsSaving(false);
            setDeleteConfirmOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Package className="w-8 h-8 text-primary" />
                        <span className="gradient-text">{mode === "create" ? "Add New Product" : "Edit Product"}</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {mode === "create" ? "Create a new product to your catalog" : "Update product details and configuration"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/catalog" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                        Cancel
                    </Link>
                </div>
            </div>

            <EditTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={[
                    { id: "general", label: "General", icon: Package },
                    { id: "pricing_stock", label: "Pricing & Stock", icon: TrendingUp },
                    { id: "media", label: "Media", icon: Upload },
                    { id: "whatsapp_ai", label: "WhatsApp & AI", icon: MessageSquare },
                    { id: "advanced", label: "Advanced", icon: ShieldAlert },
                ]}
            />

            {/* General Tab */}
            {activeTab === "general" && (
                <div className="glass-card p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Basic Information
                    </h2>
                    <div className="space-y-4">
                        <EditFormField
                            label="Product Name"
                            value={formData.name}
                            onChange={(val) => handleInputChange("name", val)}
                            required
                            placeholder="Enter product name"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EditFormField
                                label="Category"
                                value={formData.category}
                                onChange={(val) => handleInputChange("category", val)}
                                required
                                placeholder="e.g., Clothing, Electronics"
                            />
                            <EditFormField
                                type="select"
                                label="Status"
                                value={formData.inStock ? "active" : "inactive"}
                                onChange={(val) => handleInputChange("inStock", val === "active")}
                                options={[
                                    { label: "Active", value: "active" },
                                    { label: "Inactive", value: "inactive" }
                                ]}
                            />
                        </div>
                        <EditFormField
                            label="Short Description"
                            value={formData.shortDescription}
                            onChange={(val) => handleInputChange("shortDescription", val)}
                            required
                            type="textarea"
                            rows={3}
                            placeholder="Brief description for catalog"
                        />
                    </div>
                </div>
            )}

            {/* Pricing & Stock Tab */}
            {activeTab === "pricing_stock" && (
                <div className="glass-card p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                    {/* Pricing Section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Pricing Logic
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <EditFormField
                                label="Price (₹)"
                                type="number"
                                value={formData.price}
                                onChange={(val) => handleInputChange("price", val)}
                                required
                                min={0}
                            />
                            <EditFormField
                                label="MRP (Compare at)"
                                type="number"
                                value={formData.compareAtPrice}
                                onChange={(val) => handleInputChange("compareAtPrice", val)}
                                min={0}
                            />
                            <EditFormField
                                label="Cost Price (₹)"
                                type="number"
                                value={formData.costPrice}
                                onChange={(val) => handleInputChange("costPrice", val)}
                                locked={!isAdvanced}
                            />
                        </div>
                    </div>

                    {/* Stock Section */}
                    <div className="pt-6 border-t border-border">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            Inventory & Stock
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <EditFormField
                                label="Stock Quantity"
                                type="number"
                                value={formData.stock}
                                onChange={(val) => handleInputChange("stock", val)}
                                min={0}
                            />
                            <EditFormField
                                label="Low Stock Alert Threshold"
                                type="number"
                                value={formData.lowStockThreshold}
                                onChange={(val) => handleInputChange("lowStockThreshold", val)}
                                locked={!isAdvanced}
                            />
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="font-medium">Product Variants</label>
                                <EditFormField
                                    type="checkbox"
                                    label="Enable Variations"
                                    value={formData.sizesEnabled}
                                    onChange={(val) => handleInputChange("sizesEnabled", val)}
                                />
                            </div>
                            {formData.sizesEnabled && (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {AVAILABLE_SIZES.map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => handleSizeToggle(size)}
                                                className={`px-4 py-2 rounded-lg border transition-all ${formData.selectedSizes.includes(size) ? "bg-primary text-primary-foreground" : "border-border"}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                    {formData.sizeStocks.map(ss => (
                                        <div key={ss.size} className="flex items-center gap-4">
                                            <span className="w-10 font-bold">{ss.size}</span>
                                            <EditFormField
                                                type="number"
                                                label=""
                                                placeholder="Stock"
                                                value={ss.stock}
                                                onChange={(val) => handleSizeStockChange(ss.size, val)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Media Tab */}
            {activeTab === "media" && (
                <div className="glass-card p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary" />
                        Media Assets
                    </h2>
                    <MediaUploader
                        value={formData.imageUrl}
                        onChange={(url) => handleInputChange("imageUrl", url)}
                    />
                </div>
            )}

            {/* WhatsApp & AI Tab */}
            {activeTab === "whatsapp_ai" && (
                <div className="glass-card p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        WhatsApp & AI Configuration
                    </h2>

                    <EditFormField
                        label="Default WhatsApp Reply Message"
                        value={formData.whatsappMessage}
                        onChange={(val) => handleInputChange("whatsappMessage", val)}
                        type="textarea"
                        rows={3}
                        helperText="Message pre-filled when customer clicks 'Buy on WhatsApp'"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 border border-border rounded-xl">
                            <EditFormField
                                type="checkbox"
                                label="AI Product Explanation"
                                value={formData.aiExplanation}
                                onChange={(val) => handleInputChange("aiExplanation", val)}
                            />
                            <p className="text-sm text-muted-foreground mt-2">Allow AI to answer detailed questions about this product using description and attributes.</p>
                        </div>
                        <div className="p-4 border border-border rounded-xl">
                            <EditFormField
                                type="checkbox"
                                label="Auto-answer FAQs"
                                value={formData.autoAnswerFAQs}
                                onChange={(val) => handleInputChange("autoAnswerFAQs", val)}
                            />
                            <p className="text-sm text-muted-foreground mt-2">AI will automatically handle common queries (Price, Stock, Delivery) for this item.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Tab */}
            {activeTab === "advanced" && (
                <div className="glass-card p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-primary" />
                        Advanced
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EditFormField
                            label="SKU (Stock Keeping Unit)"
                            value={formData.sku || formData.barcode}
                            onChange={(val) => {
                                handleInputChange("sku", val);
                                handleInputChange("barcode", val);
                            }}
                        />
                        <EditFormField
                            label="Internal Notes"
                            value={formData.internalNotes}
                            onChange={(val) => handleInputChange("internalNotes", val)}
                            type="textarea"
                            placeholder="Private notes for staff..."
                        />
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h3 className="font-semibold mb-4">Payment Rules</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <EditFormField
                                label="Min Order Value (COD)"
                                type="number"
                                value={formData.minOrderValueCOD}
                                onChange={(val) => handleInputChange("minOrderValueCOD", val)}
                            />
                            <EditFormField
                                label="Partial Payment %"
                                type="number"
                                value={formData.partialPaymentPercentage}
                                onChange={(val) => handleInputChange("partialPaymentPercentage", val)}
                            />
                            <div className="flex items-center pt-8">
                                <EditFormField
                                    type="checkbox"
                                    label="Force COD Confirmation"
                                    value={formData.requiresCODConfirmation}
                                    onChange={(val) => handleInputChange("requiresCODConfirmation", val)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    {mode === "edit" && (
                        <div className="pt-6 border-t border-destructive/20 mt-8">
                            <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>
                            <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                                <div>
                                    <p className="font-medium text-destructive">Delete Product</p>
                                    <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDeleteConfirmOpen(true)}
                                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <EditActionBar isSaving={isSaving} onCancel={() => router.push("/catalog")} />

            <ConfirmDeleteModal
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                isLoading={isSaving}
            />
        </form>
    );
}
