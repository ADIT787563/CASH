"use client";

import { AlertCircle, Package, RefreshCw, Plus, Sparkles, Search, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 1. Error State
interface CatalogErrorStateProps {
    error: Error | null;
    reset: () => void;
}

export function CatalogErrorState({ error, reset }: CatalogErrorStateProps) {
    const isAuthError = error?.message?.includes("401") || error?.message?.toLowerCase().includes("unauthorized");
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border rounded-xl bg-destructive/5 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-destructive/10 p-4 rounded-full mb-4">
                <AlertCircle className="w-10 h-10 text-destructive" />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">Failed to load catalog</h3>

            <p className="text-muted-foreground max-w-md mb-6">
                {isAuthError
                    ? "Your session has expired. Please log in again to manage your products."
                    : "We couldn’t fetch your products right now. This might be a temporary connection issue."}
            </p>

            <div className="flex gap-3">
                {isAuthError ? (
                    <Button onClick={() => router.push("/login")} variant="default" className="gap-2">
                        <LogIn className="w-4 h-4" />
                        Log In Again
                    </Button>
                ) : (
                    <Button onClick={reset} variant="default" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </Button>
                )}
            </div>
        </div>
    );
}

// 2. Empty Catalog State (No products at all)
export function CatalogEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl bg-muted/20 animate-in fade-in duration-500">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Package className="w-12 h-12 text-primary opacity-80" />
            </div>
            <h3 className="text-xl font-bold mb-2">No products yet</h3>
            <p className="text-muted-foreground max-w-sm mb-8">
                Get started by adding your first product to the catalog or use AI to upload in bulk.
            </p>
            <div className="flex gap-4">
                <Link href="/catalog/products/new">
                    <Button size="lg" className="gap-2 shadow-sm">
                        <Plus className="w-4 h-4" />
                        Add Product
                    </Button>
                </Link>
                <Link href="/catalog/ai-builder">
                    <Button variant="outline" size="lg" className="gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        AI Upload
                    </Button>
                </Link>
            </div>
        </div>
    );
}

// 3. No Search Results State (Products exist but filtered out)
export function NoSearchResultsState({ clearFilters }: { clearFilters: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card">
            <div className="bg-muted p-3 rounded-full mb-3">
                <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No products found</h3>
            <p className="text-sm text-muted-foreground mb-4">
                No products match your current search or filters.
            </p>
            <Button variant="outline" onClick={clearFilters}>
                Clear Filters
            </Button>
        </div>
    );
}
