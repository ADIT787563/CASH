"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    MoreVertical,
    Edit,
    Trash2,
    Copy,
    Eye,
    EyeOff,
    Check,
    Image as ImageIcon
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
}

interface ProductCardProps {
    product: Product;
    isSelected: boolean;
    onSelect: (checked: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onToggleStatus: () => void;
}

export function ProductCard({
    product,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onDuplicate,
    onToggleStatus
}: ProductCardProps) {
    // Determine status badge color
    const isActive = product.status === "active" || product.status === undefined; // Default active if undefined?
    const hasStock = product.stock > 0;

    return (
        <div className={cn(
            "group relative bg-card border rounded-xl overflow-hidden transition-all hover:shadow-md",
            isSelected ? "border-primary ring-1 ring-primary bg-primary/5" : "border-border"
        )}>
            {/* Selection Checkbox (Absolute) */}
            <div className="absolute top-3 left-3 z-10">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(checked as boolean)}
                    className="bg-background/80 backdrop-blur-sm border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
            </div>

            {/* Actions Menu (Absolute) */}
            <div className="absolute top-3 right-3 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={onEdit}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDuplicate}>
                            <Copy className="w-4 h-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onToggleStatus}>
                            {isActive ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                            {isActive ? "Disable" : "Enable"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Image Section */}
            <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                )}
                {!hasStock && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-center backdrop-blur-sm">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Out of Stock</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-4 space-y-3">
                <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                        <Badge variant={isActive ? "outline" : "secondary"} className="text-[10px] px-1.5 h-5">
                            {isActive ? "Active" : "Draft"}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{product.description || "No description"}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="font-bold text-lg">
                        ₹{product.price.toLocaleString()}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                        {product.stock} in stock
                    </div>
                </div>

                {/* Primary Action Button (Edit) */}
                <Button
                    onClick={onEdit}
                    variant="default"
                    className="w-full h-9 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                >
                    Edit Product
                </Button>
            </div>
        </div>
    );
}
