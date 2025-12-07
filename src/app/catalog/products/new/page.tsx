"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
  ArrowLeft,
  Save,
  Eye,
  X,
  ChevronDown,
  Package,
  Settings,
  Upload,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Predefined sizes
const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];

interface SizeStock {
  size: string;
  stock: number | "";
}

interface ProductFormData {
  // Required fields
  name: string;
  price: number | "";
  imageUrl: string;
  inStock: boolean;
  stock: number | "";
  category: string;
  shortDescription: string;

  // Size variants
  sizesEnabled: boolean;
  selectedSizes: string[];
  sizeStocks: SizeStock[];

  // Advanced options (collapsed)
  compareAtPrice: number | "";
  barcode: string;
  vendor: string;
  template: string;
  returnPolicy: string;
  ageRestricted: boolean;
  viewTrackingEnabled: boolean;
}

export default function NewProductPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/catalog/products/new");
    }
  }, [session, isPending, router]);

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
    template: "basic",
    returnPolicy: "",
    ageRestricted: false,
    viewTrackingEnabled: true,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Protect against accidental navigation
  useUnsavedChanges(hasUnsavedChanges);

  // Track changes to form
  useEffect(() => {
    const hasData = formData.name.trim().length > 0 ||
      formData.imageUrl.trim().length > 0 ||
      formData.shortDescription.trim().length > 0;
    setHasUnsavedChanges(hasData && !isSaving);
  }, [formData, isSaving]);

  // Auto-save draft every 10 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.name.trim().length >= 3) {
        localStorage.setItem("product-draft", JSON.stringify(formData));
        toast.success("Draft saved", { duration: 1000 });
      }
    }, 10000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("product-draft");
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
        toast.info("Draft loaded");
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = "Product name must be at least 3 characters";
    }
    if (formData.name.trim().length > 120) {
      errors.name = "Product name must not exceed 120 characters";
    }
    if (formData.price === "" || formData.price < 0) {
      errors.price = "Valid price is required (≥ 0.00)";
    }
    if (!formData.imageUrl.trim()) {
      errors.imageUrl = "Primary image is required";
    }
    if (!formData.category.trim()) {
      errors.category = "Category is required";
    }
    if (!formData.shortDescription.trim()) {
      errors.shortDescription = "Short description is required";
    }
    if (formData.shortDescription && formData.shortDescription.length > 300) {
      errors.shortDescription = "Short description must not exceed 300 characters";
    }

    // Stock validation
    if (formData.inStock && !formData.sizesEnabled) {
      if (formData.stock === "" || formData.stock < 0) {
        errors.stock = "Valid stock quantity is required (≥ 0)";
      }
    }

    // Size variant validation
    if (formData.sizesEnabled) {
      if (formData.selectedSizes.length === 0) {
        errors.sizes = "Please select at least one size";
      } else {
        // Check that all selected sizes have stock values
        const missingStock = formData.sizeStocks.some(
          (ss) => formData.selectedSizes.includes(ss.size) && ss.stock === ""
        );
        if (missingStock) {
          errors.sizeStocks = "Please provide stock for all selected sizes";
        }
      }
    }

    // Barcode validation
    if (formData.barcode && formData.barcode.length > 30) {
      errors.barcode = "Barcode must not exceed 30 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);

    try {
      // Prepare payload
      const payload: any = {
        name: formData.name.trim(),
        price: Number(formData.price),
        imageUrl: formData.imageUrl.trim(),
        category: formData.category.trim(),
        shortDescription: formData.shortDescription.trim(),
        status: formData.inStock ? "active" : "out_of_stock",
        visibility: "active",
        currencyCode: "INR",
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
        barcode: formData.barcode.trim() || null,
        vendor: formData.vendor.trim() || null,
        template: formData.template,
        returnPolicy: formData.returnPolicy.trim() || null,
        ageRestricted: formData.ageRestricted,
        viewTrackingEnabled: formData.viewTrackingEnabled,
      };

      // Handle stock based on size variants
      if (formData.sizesEnabled && formData.selectedSizes.length > 0) {
        // Use size variants
        payload.variants = formData.selectedSizes.map((size) => {
          const sizeStock = formData.sizeStocks.find((ss) => ss.size === size);
          return {
            option: `Size: ${size}`,
            sku: "",
            price: payload.price,
            stock: sizeStock ? Number(sizeStock.stock) || 0 : 0,
            imageUrl: payload.imageUrl,
          };
        });
        // Set main stock to sum of all size stocks
        payload.stock = payload.variants.reduce((sum: number, v: any) => sum + v.stock, 0);
      } else {
        // Single-size product - ensure stock is always a valid number
        const stockValue = formData.stock === "" ? 0 : Number(formData.stock);
        payload.stock = formData.inStock ? stockValue : 0;
        payload.variants = null;
      }

      console.log('Sending payload:', payload); // Debug log

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Response:', response.status, data); // Debug log

      if (!response.ok) {
        if (data.validationErrors) {
          console.error('Validation errors:', data.validationErrors); // Debug log
          setValidationErrors(data.validationErrors);
          toast.error("Validation failed: " + JSON.stringify(data.validationErrors));
        } else {
          console.error('Error:', data.error); // Debug log
          toast.error(data.error || "Failed to create product");
        }
        setIsSaving(false);
        return;
      }

      // Success case
      toast.success("Product created successfully!");
      localStorage.removeItem("product-draft");
      setHasUnsavedChanges(false); // Clear unsaved changes flag

      // Use replace instead of push to avoid back button issues
      // and refresh to update the catalog without full reload
      router.replace("/catalog");
      router.refresh();
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
      setIsSaving(false);
    }
  };

  const handleSizeToggle = (size: string) => {
    const isSelected = formData.selectedSizes.includes(size);
    if (isSelected) {
      // Remove size
      setFormData((prev) => ({
        ...prev,
        selectedSizes: prev.selectedSizes.filter((s) => s !== size),
        sizeStocks: prev.sizeStocks.filter((ss) => ss.size !== size),
      }));
    } else {
      // Add size
      setFormData((prev) => ({
        ...prev,
        selectedSizes: [...prev.selectedSizes, size],
        sizeStocks: [...prev.sizeStocks, { size, stock: "" }],
      }));
    }
  };

  const handleSizeStockChange = (size: string, stock: number | "") => {
    setFormData((prev) => ({
      ...prev,
      sizeStocks: prev.sizeStocks.map((ss) =>
        ss.size === size ? { ...ss, stock } : ss
      ),
    }));
  };

  const handleLoadTestImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: "/mnt/data/34a9e2a5-345a-4bc4-a1ff-ba0560345504.png",
    }));
    toast.success("Test image loaded");
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/catalog"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Back to catalog"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Add New Product</h1>
                <p className="text-sm text-muted-foreground">
                  Fill in product details to add to your catalog
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("product-draft", JSON.stringify(formData));
                  toast.success("Draft saved");
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                aria-label="Save draft"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                aria-label="Save product"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Required Fields */}
              <div className="glass-card rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Product Information
                </h2>

                {/* Product Title */}
                <div>
                  <label htmlFor="product-name" className="block text-sm font-semibold mb-2">
                    Product Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Cotton Kurta — Men"
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-invalid={!!validationErrors.name}
                    aria-describedby={validationErrors.name ? "name-error" : "name-hint"}
                  />
                  {validationErrors.name && (
                    <p id="name-error" className="text-sm text-destructive mt-1" role="alert">
                      {validationErrors.name}
                    </p>
                  )}
                  <p id="name-hint" className="text-xs text-muted-foreground mt-1">
                    {formData.name.length}/120 characters. Clear, product-name-first.
                  </p>
                </div>

                {/* Primary Image */}
                <div>
                  <label htmlFor="primary-image" className="block text-sm font-semibold mb-2">
                    Primary Image <span className="text-destructive">*</span>
                  </label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {formData.imageUrl && (
                      <div className="relative w-full max-w-xs aspect-square rounded-lg border-2 border-border overflow-hidden bg-muted">
                        <Image
                          src={formData.imageUrl}
                          alt="Product preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                          className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                          aria-label="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Image Upload Button */}
                    <div>
                      <input
                        type="file"
                        id="image-file-upload"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Validate file type
                          const validTypes = ["image/jpeg", "image/png", "image/webp"];
                          if (!validTypes.includes(file.type)) {
                            toast.error("Please upload a JPG, PNG, or WebP image");
                            return;
                          }

                          // Validate file size (max 5MB)
                          const maxSize = 5 * 1024 * 1024; // 5MB in bytes
                          if (file.size > maxSize) {
                            toast.error("Image size must be less than 5MB");
                            return;
                          }

                          // Convert to data URL for preview
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const dataUrl = event.target?.result as string;
                            setFormData((prev) => ({ ...prev, imageUrl: dataUrl }));
                            toast.success("Image uploaded successfully");
                          };
                          reader.onerror = () => {
                            toast.error("Failed to read image file");
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <label
                        htmlFor="image-file-upload"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer font-medium"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </label>
                      <span className="ml-3 text-sm text-muted-foreground">
                        or enter URL below
                      </span>
                    </div>

                    {/* Image URL Input */}
                    <input
                      id="primary-image"
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                      }
                      placeholder="Enter image URL or upload"
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-invalid={!!validationErrors.imageUrl}
                      aria-describedby={validationErrors.imageUrl ? "image-error" : "image-hint"}
                    />

                    {/* Test Image Button */}
                    <button
                      type="button"
                      onClick={handleLoadTestImage}
                      className="text-sm text-primary hover:underline"
                    >
                      Use test/staging image
                    </button>

                    {validationErrors.imageUrl && (
                      <p id="image-error" className="text-sm text-destructive" role="alert">
                        {validationErrors.imageUrl}
                      </p>
                    )}
                    <p id="image-hint" className="text-xs text-muted-foreground">
                      JPG/PNG/WebP. Recommended: 800×800 px. Max file size: 5 MB.
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-semibold mb-2">
                    Price (₹) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                      ₹
                    </span>
                    <input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value === "" ? "" : Number(e.target.value),
                        }))
                      }
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-invalid={!!validationErrors.price}
                      aria-describedby={validationErrors.price ? "price-error" : undefined}
                    />
                  </div>
                  {validationErrors.price && (
                    <p id="price-error" className="text-sm text-destructive mt-1" role="alert">
                      {validationErrors.price}
                    </p>
                  )}
                </div>

                {/* Stock / Availability */}
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Stock / Availability <span className="text-destructive">*</span>
                  </label>

                  {/* In Stock Toggle */}
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, inStock: true }))}
                      className={`px-4 py-2 rounded-lg border transition-colors ${formData.inStock
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:bg-muted"
                        }`}
                      aria-pressed={formData.inStock}
                    >
                      In Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, inStock: false, stock: 0 }))}
                      className={`px-4 py-2 rounded-lg border transition-colors ${!formData.inStock
                        ? "bg-destructive text-destructive-foreground border-destructive"
                        : "bg-background border-input hover:bg-muted"
                        }`}
                      aria-pressed={!formData.inStock}
                    >
                      Out of Stock
                    </button>
                  </div>

                  {/* Stock Quantity (only if In Stock and no sizes) */}
                  {formData.inStock && !formData.sizesEnabled && (
                    <div>
                      <label htmlFor="stock-quantity" className="block text-sm font-medium mb-2">
                        Stock Quantity
                      </label>
                      <input
                        id="stock-quantity"
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            stock: e.target.value === "" ? "" : Number(e.target.value),
                          }))
                        }
                        placeholder="Enter quantity"
                        min="0"
                        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-invalid={!!validationErrors.stock}
                        aria-describedby={validationErrors.stock ? "stock-error" : undefined}
                      />
                      {validationErrors.stock && (
                        <p id="stock-error" className="text-sm text-destructive mt-1" role="alert">
                          {validationErrors.stock}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold mb-2">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-invalid={!!validationErrors.category}
                    aria-describedby={validationErrors.category ? "category-error" : undefined}
                  >
                    <option value="">Select a category</option>
                    <option value="clothing">Clothing</option>
                    <option value="electronics">Electronics</option>
                    <option value="accessories">Accessories</option>
                    <option value="footwear">Footwear</option>
                    <option value="home-decor">Home Décor</option>
                    <option value="beauty">Beauty & Personal Care</option>
                    <option value="sports">Sports & Fitness</option>
                    <option value="books">Books & Stationery</option>
                    <option value="toys">Toys & Games</option>
                    <option value="food">Food & Beverages</option>
                    <option value="other">Other</option>
                  </select>
                  {validationErrors.category && (
                    <p id="category-error" className="text-sm text-destructive mt-1" role="alert">
                      {validationErrors.category}
                    </p>
                  )}
                </div>

                {/* Short Description */}
                <div>
                  <label htmlFor="short-description" className="block text-sm font-semibold mb-2">
                    Short Description <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="short-description"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))
                    }
                    placeholder="1–2 sentence summary (appears in card preview)"
                    rows={2}
                    maxLength={300}
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    aria-invalid={!!validationErrors.shortDescription}
                    aria-describedby={validationErrors.shortDescription ? "description-error" : "description-hint"}
                  />
                  {validationErrors.shortDescription && (
                    <p id="description-error" className="text-sm text-destructive mt-1" role="alert">
                      {validationErrors.shortDescription}
                    </p>
                  )}
                  <p id="description-hint" className="text-xs text-muted-foreground mt-1">
                    {formData.shortDescription.length}/300 characters
                  </p>
                </div>

                {/* Sizes (variants) */}
                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-semibold">
                      Sizes (variants)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          sizesEnabled: !prev.sizesEnabled,
                          selectedSizes: [],
                          sizeStocks: [],
                        }))
                      }
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${formData.sizesEnabled
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:bg-muted"
                        }`}
                    >
                      {formData.sizesEnabled ? "Disable Sizes" : "Enable Sizes"}
                    </button>
                  </div>

                  {formData.sizesEnabled && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Select which sizes apply to this product and set stock for each size.
                      </p>

                      {/* Size Checkboxes */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {AVAILABLE_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleSizeToggle(size)}
                            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${formData.selectedSizes.includes(size)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-input hover:bg-muted"
                              }`}
                            aria-pressed={formData.selectedSizes.includes(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>

                      {/* Stock per Size */}
                      {formData.selectedSizes.length > 0 && (
                        <div className="space-y-3 pt-3 border-t border-border">
                          <p className="text-sm font-medium">Stock per size:</p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {formData.selectedSizes.map((size) => {
                              const sizeStock = formData.sizeStocks.find((ss) => ss.size === size);
                              return (
                                <div key={size} className="flex items-center gap-3">
                                  <label htmlFor={`size-stock-${size}`} className="text-sm font-medium w-16">
                                    {size}:
                                  </label>
                                  <input
                                    id={`size-stock-${size}`}
                                    type="number"
                                    value={sizeStock?.stock ?? ""}
                                    onChange={(e) =>
                                      handleSizeStockChange(
                                        size,
                                        e.target.value === "" ? "" : Number(e.target.value)
                                      )
                                    }
                                    placeholder="Qty"
                                    min="0"
                                    className="flex-1 px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {validationErrors.sizes && (
                        <p className="text-sm text-destructive" role="alert">
                          {validationErrors.sizes}
                        </p>
                      )}
                      {validationErrors.sizeStocks && (
                        <p className="text-sm text-destructive" role="alert">
                          {validationErrors.sizeStocks}
                        </p>
                      )}
                    </div>
                  )}

                  {!formData.sizesEnabled && (
                    <p className="text-sm text-muted-foreground">
                      If no size is selected, product will be treated as single-size controlled by main stock field.
                    </p>
                  )}
                </div>
              </div>

              {/* Advanced Options (Collapsible) */}
              <div className="glass-card rounded-xl p-6 space-y-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between group"
                  aria-expanded={showAdvanced}
                >
                  <h2 className="text-xl font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                    <Settings className="w-5 h-5 text-primary" />
                    Advanced Options
                  </h2>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                  />
                </button>

                {showAdvanced && (
                  <div className="space-y-6 pt-4 border-t border-border">
                    {/* Compare-at / MRP Price */}
                    <div>
                      <label htmlFor="mrp-price" className="block text-sm font-semibold mb-2">
                        Compare-at / MRP Price (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                          ₹
                        </span>
                        <input
                          id="mrp-price"
                          type="number"
                          value={formData.compareAtPrice}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              compareAtPrice: e.target.value === "" ? "" : Number(e.target.value),
                            }))
                          }
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Optional. Shows discount % automatically if set.
                      </p>
                    </div>

                    {/* Barcode */}
                    <div>
                      <label htmlFor="barcode" className="block text-sm font-semibold mb-2">
                        Barcode (EAN/UPC)
                      </label>
                      <input
                        id="barcode"
                        type="text"
                        value={formData.barcode}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, barcode: e.target.value }))
                        }
                        placeholder="Enter barcode"
                        maxLength={30}
                        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-invalid={!!validationErrors.barcode}
                        aria-describedby={validationErrors.barcode ? "barcode-error" : "barcode-hint"}
                      />
                      {validationErrors.barcode && (
                        <p id="barcode-error" className="text-sm text-destructive mt-1" role="alert">
                          {validationErrors.barcode}
                        </p>
                      )}
                      <p id="barcode-hint" className="text-xs text-muted-foreground mt-1">
                        Alphanumeric, max 30 characters
                      </p>
                    </div>

                    {/* Vendor / Brand */}
                    <div>
                      <label htmlFor="vendor" className="block text-sm font-semibold mb-2">
                        Vendor / Brand
                      </label>
                      <input
                        id="vendor"
                        type="text"
                        value={formData.vendor}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, vendor: e.target.value }))
                        }
                        placeholder="Brand or vendor name"
                        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    {/* Catalog Template */}
                    <div>
                      <label htmlFor="template" className="block text-sm font-semibold mb-2">
                        Catalog Template
                      </label>
                      <select
                        id="template"
                        value={formData.template}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, template: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="basic">Basic</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    {/* Return Policy */}
                    <div>
                      <label htmlFor="return-policy" className="block text-sm font-semibold mb-2">
                        Return Policy (per-product override)
                      </label>
                      <textarea
                        id="return-policy"
                        value={formData.returnPolicy}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, returnPolicy: e.target.value }))
                        }
                        placeholder="Optional return policy text for this product"
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>

                    {/* Age Restricted */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="age-restricted"
                        checked={formData.ageRestricted}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, ageRestricted: e.target.checked }))
                        }
                        className="w-4 h-4 mt-0.5 rounded border-input"
                      />
                      <div>
                        <label htmlFor="age-restricted" className="text-sm font-medium">
                          Age Restricted Product
                        </label>
                        {formData.ageRestricted && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ⚠️ Manual verification required at checkout
                          </p>
                        )}
                      </div>
                    </div>

                    {/* View Tracking */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="view-tracking"
                        checked={formData.viewTrackingEnabled}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            viewTrackingEnabled: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 mt-0.5 rounded border-input"
                      />
                      <label htmlFor="view-tracking" className="text-sm font-medium">
                        Enable View Tracking & Analytics
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Live Preview
              </h3>
              <div className="space-y-4">
                {/* WhatsApp Product Card Preview */}
                <div className="border-2 border-border rounded-xl overflow-hidden bg-card shadow-sm">
                  {formData.imageUrl ? (
                    <div className="relative w-full aspect-square bg-muted">
                      <Image
                        src={formData.imageUrl}
                        alt="Product preview"
                        fill
                        className="object-cover"
                      />
                      {!formData.inStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="px-4 py-2 bg-destructive text-destructive-foreground font-bold rounded-lg">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-muted flex items-center justify-center">
                      <Package className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-base line-clamp-2">
                      {formData.name || "Product Name"}
                    </h4>
                    {formData.shortDescription && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {formData.shortDescription}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl font-bold text-primary">
                        ₹{formData.price || "0.00"}
                      </span>
                      {formData.compareAtPrice && Number(formData.compareAtPrice) > Number(formData.price) && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{formData.compareAtPrice}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-success/10 text-success font-semibold rounded">
                            {Math.round(
                              ((Number(formData.compareAtPrice) - Number(formData.price)) /
                                Number(formData.compareAtPrice)) *
                              100
                            )}
                            % OFF
                          </span>
                        </>
                      )}
                    </div>

                    {/* Size Badges */}
                    {formData.sizesEnabled && formData.selectedSizes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">Sizes:</span>
                        {formData.selectedSizes.map((size) => (
                          <span
                            key={size}
                            className="px-2 py-0.5 bg-muted text-xs font-medium rounded"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    )}

                    {formData.category && (
                      <div className="pt-2 border-t border-border">
                        <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">
                          {formData.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Validation Status */}
                <div className="space-y-2 text-xs">
                  <p className="font-semibold text-muted-foreground">Form Status:</p>
                  <div className="space-y-1">
                    <p className={formData.name.length >= 3 ? "text-success" : "text-muted-foreground"}>
                      {formData.name.length >= 3 ? "✓" : "○"} Product Title
                    </p>
                    <p className={formData.imageUrl ? "text-success" : "text-muted-foreground"}>
                      {formData.imageUrl ? "✓" : "○"} Primary Image
                    </p>
                    <p className={formData.price !== "" && Number(formData.price) >= 0 ? "text-success" : "text-muted-foreground"}>
                      {formData.price !== "" && Number(formData.price) >= 0 ? "✓" : "○"} Price
                    </p>
                    <p className={formData.category ? "text-success" : "text-muted-foreground"}>
                      {formData.category ? "✓" : "○"} Category
                    </p>
                    <p className={formData.shortDescription ? "text-success" : "text-muted-foreground"}>
                      {formData.shortDescription ? "✓" : "○"} Short Description
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-lg border-t border-border z-30">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              localStorage.setItem("product-draft", JSON.stringify(formData));
              toast.success("Draft saved");
            }}
            className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-semibold"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}