"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Upload,
    FileSpreadsheet,
    Image as ImageIcon,
    ArrowLeft,
    Sparkles,
    CheckCircle,
    XCircle,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ProtectedPage from "@/components/ProtectedPage";

type UploadMode = "csv" | "images" | null;

interface ParsedProduct {
    name: string;
    price: number;
    category: string;
    description: string;
    imageUrl?: string;
    stock?: number;
}

interface ProcessingResult {
    success: boolean;
    product: ParsedProduct;
    error?: string;
}

function AIBuilderContent() {
    const router = useRouter();
    const [uploadMode, setUploadMode] = useState<UploadMode>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [results, setResults] = useState<ProcessingResult[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            handleFiles(files);
        }
    };

    const handleFiles = (files: File[]) => {
        if (uploadMode === "csv") {
            const csvFiles = files.filter(f => f.name.endsWith(".csv"));
            if (csvFiles.length === 0) {
                toast.error("Please upload CSV files only");
                return;
            }
            setSelectedFiles(csvFiles);
        } else if (uploadMode === "images") {
            const imageFiles = files.filter(f => f.type.startsWith("image/"));
            if (imageFiles.length === 0) {
                toast.error("Please upload image files only");
                return;
            }
            setSelectedFiles(imageFiles);
        }
    };

    const processFiles = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please select files to process");
            return;
        }

        setIsProcessing(true);
        setResults([]);

        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append("files", file);
            });
            formData.append("mode", uploadMode || "");

            const response = await fetch("/api/ai-catalog-builder", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to process files");
            }

            const data = await response.json();
            setResults(data.results);

            const successCount = data.results.filter((r: ProcessingResult) => r.success).length;
            toast.success(`Successfully processed ${successCount} of ${data.results.length} items`);
        } catch (error) {
            console.error("Processing error:", error);
            toast.error("Failed to process files");
        } finally {
            setIsProcessing(false);
        }
    };

    const saveProducts = async () => {
        const successfulProducts = results.filter(r => r.success).map(r => r.product);

        if (successfulProducts.length === 0) {
            toast.error("No products to save");
            return;
        }

        setIsProcessing(true);

        try {
            const responses = await Promise.all(
                successfulProducts.map(product =>
                    fetch("/api/products", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...product,
                            status: "active",
                            visibility: "active",
                            currencyCode: "INR",
                        }),
                    })
                )
            );

            const successCount = responses.filter(r => r.ok).length;
            toast.success(`Added ${successCount} products to catalog!`);

            // Redirect to catalog
            router.replace("/catalog");
            router.refresh();
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save products");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Catalog
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold">
                            AI <span className="gradient-text">Catalog Builder</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Upload CSV or product images and let AI automatically create your catalog
                    </p>
                </div>

                {/* Mode Selection */}
                {!uploadMode && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <button
                            onClick={() => setUploadMode("csv")}
                            className="glass-card p-8 rounded-2xl hover:shadow-xl transition-all group"
                        >
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="p-6 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                                    <FileSpreadsheet className="w-16 h-16 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Upload CSV File</h3>
                                    <p className="text-muted-foreground">
                                        Import multiple products from a CSV spreadsheet with columns: name, price, category, description, stock
                                    </p>
                                </div>
                                <div className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold">
                                    Choose CSV Upload
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => setUploadMode("images")}
                            className="glass-card p-8 rounded-2xl hover:shadow-xl transition-all group"
                        >
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="p-6 bg-accent/10 rounded-2xl group-hover:bg-accent/20 transition-colors">
                                    <ImageIcon className="w-16 h-16 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Upload Product Images</h3>
                                    <p className="text-muted-foreground">
                                        Upload product images and AI will analyze them to generate names, descriptions, and categories
                                    </p>
                                </div>
                                <div className="mt-4 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold">
                                    Choose Image Upload
                                </div>
                            </div>
                        </button>
                    </div>
                )}

                {/* Upload Area */}
                {uploadMode && !results.length && (
                    <div className="glass-card p-8 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">
                                Upload {uploadMode === "csv" ? "CSV File" : "Product Images"}
                            </h2>
                            <button
                                onClick={() => {
                                    setUploadMode(null);
                                    setSelectedFiles([]);
                                }}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Change Mode
                            </button>
                        </div>

                        {/* Drag & Drop Zone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${isDragging
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                        >
                            <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                Drag and drop {uploadMode === "csv" ? "CSV file" : "images"} here
                            </h3>
                            <p className="text-muted-foreground mb-4">or</p>
                            <label className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors cursor-pointer inline-block">
                                Browse Files
                                <input
                                    type="file"
                                    multiple={uploadMode === "images"}
                                    accept={uploadMode === "csv" ? ".csv" : "image/*"}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Selected Files */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-semibold mb-3">
                                    Selected Files ({selectedFiles.length})
                                </h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {selectedFiles.map((file, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                        >
                                            <span className="text-sm">{file.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={processFiles}
                                    disabled={isProcessing}
                                    className="w-full mt-6 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing with AI...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Process with AI
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Processing Results</h2>
                                    <p className="text-muted-foreground">
                                        {results.filter(r => r.success).length} of {results.length} products ready to add
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setResults([]);
                                            setSelectedFiles([]);
                                        }}
                                        className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        Start Over
                                    </button>
                                    <button
                                        onClick={saveProducts}
                                        disabled={isProcessing || results.filter(r => r.success).length === 0}
                                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                Add to Catalog
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {results.map((result, i) => (
                                <div
                                    key={i}
                                    className={`glass-card p-6 rounded-2xl ${result.success ? "border-l-4 border-success" : "border-l-4 border-destructive"
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {result.success ? (
                                            <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                                        )}
                                        <div className="flex-1">
                                            {result.success ? (
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg mb-2">{result.product.name}</h3>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            {result.product.description}
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">
                                                                {result.product.category}
                                                            </span>
                                                            {result.product.stock !== undefined && (
                                                                <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-full">
                                                                    Stock: {result.product.stock}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-2xl font-bold text-primary">
                                                                ₹{result.product.price.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        {result.product.imageUrl && (
                                                            <img
                                                                src={result.product.imageUrl}
                                                                alt={result.product.name}
                                                                className="w-24 h-24 object-cover rounded-lg"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h3 className="font-bold text-destructive mb-1">Processing Failed</h3>
                                                    <p className="text-sm text-muted-foreground">{result.error}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function AIBuilderPage() {
    return (
        <ProtectedPage>
            <AIBuilderContent />
        </ProtectedPage>
    );
}
