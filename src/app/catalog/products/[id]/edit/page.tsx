"use client";

import ProtectedPage from "@/components/ProtectedPage";
import ProductForm from "@/components/products/ProductForm";
import { useParams } from "next/navigation";

function EditProductContent() {
    const params = useParams();
    const productId = params.id as string;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <ProductForm mode="edit" productId={productId} />
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
