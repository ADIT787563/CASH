"use client";

import React, { useState } from "react";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "destructive" | "ghost";
    isLoading?: boolean;
    requiresConfirm?: boolean;
    confirmMessage?: string;
    onAction?: () => Promise<void> | void;
    successMessage?: string;
    icon?: React.ReactNode;
}

export function ActionButton({
    children,
    variant = "primary",
    isLoading = false,
    requiresConfirm = false,
    confirmMessage = "Are you sure you want to proceed? This action cannot be undone.",
    onAction,
    successMessage,
    icon,
    className = "",
    disabled,
    ...props
}: ActionButtonProps) {
    const [internalLoading, setInternalLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const isLoaadingState = isLoading || internalLoading;

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (disabled || isLoaadingState) return;

        if (requiresConfirm && !showConfirm) {
            setShowConfirm(true);
            return;
        }

        if (onAction) {
            try {
                setInternalLoading(true);
                await onAction();
                if (successMessage) {
                    toast.success(successMessage);
                }
            } catch (error) {
                console.error(error);
                toast.error("Action failed. Please try again.");
            } finally {
                setInternalLoading(false);
                setShowConfirm(false);
            }
        }
    };

    const getVariantClasses = () => {
        switch (variant) {
            case "primary": return "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm";
            case "secondary": return "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800";
            case "destructive": return "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900";
            case "ghost": return "bg-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white";
            default: return "";
        }
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                <span className="text-xs font-bold text-rose-600 hidden sm:inline">{confirmMessage}</span>
                <button
                    onClick={handleClick}
                    className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded hover:bg-rose-700 transition-colors"
                >
                    Confirm
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded hover:bg-slate-200 transition-colors"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={disabled || isLoaadingState}
            className={`
        relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${getVariantClasses()}
        ${className}
      `}
            {...props}
        >
            {isLoaadingState && <Loader2 className="w-4 h-4 animate-spin" />}
            {!isLoaadingState && icon}
            {children}
        </button>
    );
}
