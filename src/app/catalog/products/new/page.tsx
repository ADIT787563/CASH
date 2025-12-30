"use client";

import ProtectedPage from "@/components/ProtectedPage";
import ProductForm from "@/components/products/ProductForm";

export default function AddProductPage() {
  return (
    <ProtectedPage>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ProductForm mode="create" />
      </div>
    </ProtectedPage>
  );
}