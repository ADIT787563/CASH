"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Upload,
  Sparkles,
  Trash2,
  CheckCircle2,
  X
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CatalogStatsSkeleton, ProductCardSkeleton } from "@/components/ui/skeletons";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import ProtectedPage from "@/components/ProtectedPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string | null;
  status?: "active" | "inactive";
  createdAt: string;
}

function CatalogContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: number | null; productName: string }>({
    isOpen: false,
    productId: null,
    productName: "",
  });

  // Fetch products
  const { data: products = [], isLoading, isError, refetch } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const token = localStorage.getItem("bearer_token");
      const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch("/api/products", { headers });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      return Array.isArray(data) ? data : data.data || [];
    },
    retry: 1,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const token = localStorage.getItem("bearer_token");
      // Loop or bulk API
      // MVP: Delete one by one or assume single ID if length 1 for now if Bulk API missing
      const promises = ids.map(id =>
        fetch(`/api/products/${id}`, {
          method: "DELETE",
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        })
      );
      await Promise.all(promises);
      return ids;
    },
    onSuccess: (deletedIds) => {
      toast.success(deletedIds.length > 1 ? `${deletedIds.length} products deleted` : "Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteConfirm({ isOpen: false, productId: null, productName: "" });
      setSelectedIds(new Set());
    },
    onError: () => toast.error("Failed to delete product(s)"),
  });

  // Duplicate Mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("bearer_token");
      const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};

      // 1. Fetch original product details
      const res = await fetch(`/api/products/${id}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch product details");
      const original = await res.json();

      // 2. Prepare copy
      const { id: _id, createdAt, updatedAt, userId, shareableSlug, ...rest } = original;
      const newProduct = {
        ...rest,
        name: `${rest.name} (Copy)`,
        status: "inactive", // Default to inactive for copies
      };

      // 3. Create new product
      const createRes = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers
        },
        body: JSON.stringify(newProduct),
      });

      if (!createRes.ok) throw new Error("Failed to create copy");
      return await createRes.json();
    },
    onSuccess: () => {
      toast.success("Product duplicated successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Failed to duplicate product"),
  });

  // Status Toggle Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const token = localStorage.getItem("bearer_token");
      const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...headers
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Product status updated");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  // Actions
  const handleSelect = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) newSelected.add(id);
    else newSelected.delete(id);
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDelete = (id: number, name: string) => {
    setDeleteConfirm({ isOpen: true, productId: id, productName: name });
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) {
      deleteMutation.mutate(Array.from(selectedIds));
    }
  };

  const handleDuplicate = (id: number) => {
    toast.promise(duplicateMutation.mutateAsync(id), {
      loading: "Duplicating product...",
      success: "Product duplicated",
      error: "Failed to duplicate",
    });
  };

  const handleToggleStatus = (id: number) => {
    const product = products.find((p: Product) => p.id === id);
    if (!product) return;

    const newStatus = product.status === "active" ? "inactive" : "active";
    toggleStatusMutation.mutate({ id, status: newStatus });
  };

  // Filtering
  const categories = ["all", ...new Set(products.map((p: Product) => p.category))];
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold">Failed to load catalog</h3>
        <Button onClick={() => refetch()} className="mt-4">Retry</Button>
      </div>
    );
  }

  const isAllSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="container mx-auto px-4 md:px-6 py-8 flex-grow">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Product Catalog</h1>
            <p className="text-muted-foreground">Manage your inventory and AI catalog.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/catalog/ai-builder">
              <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
                <Sparkles className="w-4 h-4 text-purple-500" />
                AI Upload Catalog
              </Button>
            </Link>
            <Link href="/catalog/products/new">
              <Button className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters & Toolbar */}
        <div className="bg-card border rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="py-2 pl-3 pr-8 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat as string} value={cat as string}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredProducts.length} Products
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-foreground text-background px-6 py-3 rounded-full shadow-lg flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <span className="font-medium text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              {selectedIds.size} Selected
            </span>
            <div className="h-4 w-px bg-background/20" />
            <div className="flex items-center gap-2">
              <button onClick={handleBulkDelete} className="text-sm hover:text-red-400 transition-colors flex items-center gap-1 font-medium">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="text-sm hover:text-primary transition-colors ml-4 opacity-70 hover:opacity-100">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
            <Package className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {searchTerm ? "Try adjusting your search or filters." : "Get started by adding your first product to the catalog."}
            </p>
            <Link href="/catalog/products/new">
              <Button>Add Product</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Select All Row */}
            <div className="flex items-center gap-2 mb-4 px-1">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                aria-label="Select all products"
                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={selectedIds.has(product.id)}
                  onSelect={(checked) => handleSelect(product.id, checked)}
                  onEdit={() => router.push(`/catalog/products/${product.id}/edit`)}
                  onDelete={() => handleDelete(product.id, product.name)}
                  onDuplicate={() => handleDuplicate(product.id)}
                  onToggleStatus={() => handleToggleStatus(product.id)}
                />
              ))}
            </div>
          </>
        )}

      </main>

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, productId: null, productName: "" })}
        onConfirm={() => deleteConfirm.productId && deleteMutation.mutate([deleteConfirm.productId])}
        title="Delete Product?"
        message={`Are you sure you want to delete "${deleteConfirm.productName}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <ProtectedPage>
      <CatalogContent />
    </ProtectedPage>
  );
}