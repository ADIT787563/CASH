"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmDeleteProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemCount?: number;
    requireTyping?: boolean;
    confirmText?: string;
    isLoading?: boolean;
}

export function ConfirmDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemCount = 1,
    requireTyping = false,
    confirmText = "DELETE",
    isLoading = false,
}: ConfirmDeleteProps) {
    const [typedText, setTypedText] = useState("");

    if (!isOpen) return null;

    const canConfirm = !requireTyping || typedText === confirmText;
    const isBulk = itemCount > 1;

    const handleConfirm = () => {
        if (canConfirm && !isLoading) {
            onConfirm();
            setTypedText("");
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
            setTypedText("");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass-card max-w-md w-full p-6 rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-destructive" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{title}</h3>
                            {isBulk && (
                                <span className="text-sm text-muted-foreground">
                                    {itemCount} items selected
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Message */}
                <p className="text-muted-foreground mb-6">{message}</p>

                {/* Typing Confirmation (for bulk deletes) */}
                {requireTyping && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Type <code className="px-2 py-1 bg-muted rounded text-destructive font-mono">{confirmText}</code> to confirm
                        </label>
                        <input
                            type="text"
                            value={typedText}
                            onChange={(e) => setTypedText(e.target.value)}
                            placeholder={`Type ${confirmText}`}
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-destructive disabled:opacity-50"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm || isLoading}
                        className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </>
                        )}
                    </button>
                </div>

                {/* Info Note */}
                <p className="text-xs text-muted-foreground mt-4 text-center">
                    {isBulk
                        ? "Items will be moved to trash and can be restored within 30 days"
                        : "This item will be moved to trash and can be restored within 30 days"}
                </p>
            </div>
        </div>
    );
}
