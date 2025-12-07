"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  DollarSign,
  Layers,
  Tag,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ProductCardSkeleton, CatalogStatsSkeleton } from "@/components/ui/skeletons";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import ProtectedPage from "@/components/ProtectedPage";
import { Footer } from "@/components/home/Footer";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string | null;
  createdAt: string;
}

function CatalogContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: number | null; productName: string }>({
    isOpen: false,
    productId: null,
    productName: "",
  });

  // Fetch products with React Query
  const { data: products = [], isLoading, isError, refetch } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const token = localStorage.getItem("bearer_token");
      // Even if token is missing, the API might rely on cookies, so we proceed.
      // But passing the header is good practice if available.
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/products", { headers });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch products");
      }
      const data = await res.json();
      return Array.isArray(data) ? data : data.data || [];
    },
    retry: 1,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("bearer_token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed to delete product");
      return id;
    },
    onSuccess: () => {
      toast.success("Product moved to trash");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteConfirm({ isOpen: false, productId: null, productName: "" });
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });

  const handleDelete = (id: number, name: string) => {
    setDeleteConfirm({ isOpen: true, productId: id, productName: name });
  };

  const confirmDelete = () => {
    if (deleteConfirm.productId) {
      deleteMutation.mutate(deleteConfirm.productId);
    }
  };

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load products</h2>
          <p className="text-muted-foreground mb-6">
            There was an error loading your product catalog. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 w-full"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-grow">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              <span className="gradient-text">Product Catalog</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your products and create AI-powered catalog
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh Catalog"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <CatalogStatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Layers className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.max(0, categories.length - 1)}</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-lg">
                  <Tag className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {products.filter((p: Product) => p.stock > 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground">In Stock</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    ₹{products.reduce((sum: number, p: Product) => sum + p.price, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="glass-card p-4 rounded-2xl mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <select
                  aria-label="Select Category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat as string} value={cat as string}>
                      {cat === "all" ? "All Categories" : String(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <Link
                href="/catalog/products/new"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </Link>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your filters"
                : "Start by adding your first product"}
            </p>
            <Link
              href="/catalog/products/new"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product: Product) => (
              <div
                key={product.id}
                className="glass-card rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <span className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ₹{product.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {product.stock} units
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                      <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium">
                        {product.category}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${product.stock > 10
                        ? 'bg-success/10 text-success'
                        : product.stock > 0
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-destructive/10 text-destructive'
                        }`}>
                        {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/catalog/products/${product.id}/edit`)}
                      className="flex-1 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      aria-label="Delete product"
                      onClick={() => handleDelete(product.id, product.name)}
                      className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Catalog Builder CTA */}
        <div className="mt-8 glass-card p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-2xl">
              <Upload className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">
                AI <span className="gradient-text">Catalog Builder</span>
              </h3>
              <p className="text-muted-foreground">
                Upload CSV or images and let AI generate beautiful product cards automatically
              </p>
            </div>
            <Link
              href="/catalog/ai-builder"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload & Generate
            </Link>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, productId: null, productName: "" })}
        onConfirm={confirmDelete}
        title="Delete Product?"
        message={`Are you sure you want to delete "${deleteConfirm.productName}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />

      <Footer />
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