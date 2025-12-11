
"use client";

import { useMemo } from "react";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
    product: any;
    themeConfig: any;
    onAddToCart: (product: any) => void;
}

export function ProductCard({ product, themeConfig, onAddToCart }: ProductCardProps) {
    const primaryColor = themeConfig.primaryColor || '#000000';
    const borderRadius = themeConfig.borderRadius === 'none' ? '0px' : themeConfig.borderRadius === 'large' ? '1.5rem' : '0.75rem';

    const price = useMemo(() => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(product.price);
    }, [product.price]);

    return (
        <div
            className="group relative bg-white border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
            style={{ borderRadius }}
        >
            {/* Image */}
            <div className="aspect-[4/5] w-full bg-gray-100 relative overflow-hidden">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <span className="text-4xl">📷</span>
                    </div>
                )}

                {/* Badges */}
                {product.stock <= 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        SOLD OUT
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-gray-900 font-medium text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>

                <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-gray-900">
                        {price}
                    </span>

                    {product.stock > 0 && (
                        <button
                            onClick={() => onAddToCart(product)}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                            aria-label="Add to cart"
                            style={{
                                '--hover-color': primaryColor
                            } as React.CSSProperties}
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
