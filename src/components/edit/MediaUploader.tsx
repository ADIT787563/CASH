"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
    value?: string;
    onChange: (url: string) => void;
    disabled?: boolean;
    className?: string;
}

export function MediaUploader({
    value,
    onChange,
    disabled = false,
    className,
}: MediaUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await handleUpload(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        if (disabled) return;

        // Validation
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("Image size should be less than 5MB");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "unsigned_preset"); // Using default unsigned preset

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            if (!cloudName) {
                throw new Error("Cloudinary configuration missing");
            }

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            onChange(data.secure_url);
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        if (disabled) return;
        onChange("");
    };

    return (
        <div className={cn("space-y-4", className)}>
            {value ? (
                <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/30 aspect-video md:aspect-[2/1] max-w-2xl mx-auto">
                    <Image
                        src={value}
                        alt="Product visual"
                        fill
                        className="object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleRemove}
                            disabled={disabled || isUploading}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Remove
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                            disabled={disabled || isUploading}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Change
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-colors cursor-pointer bg-muted/5",
                        dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/10",
                        disabled && "opacity-60 cursor-not-allowed hover:border-muted-foreground/25 hover:bg-muted/5"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !disabled && inputRef.current?.click()}
                >
                    <div className="flex flex-col items-center gap-4 text-center p-4">
                        <div className="p-4 bg-background rounded-full shadow-sm">
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                {isUploading ? "Uploading..." : "Click or drag image to upload"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                SVG, PNG, JPG or GIF (max. 5MB)
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={disabled || isUploading}
                title="File Upload"
                aria-label="File Upload"
            />
        </div>
    );
}
