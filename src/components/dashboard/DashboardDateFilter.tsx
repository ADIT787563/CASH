"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

export type DateRange = "today" | "yesterday" | "last7" | "last30" | "custom";

interface DashboardDateFilterProps {
    value: DateRange;
    onChange: (value: DateRange) => void;
}

export function DashboardDateFilter({ value, onChange }: DashboardDateFilterProps) {
    const [isOpen, setIsOpen] = useState(false);

    const options = [
        { id: "today", label: "Today" },
        { id: "yesterday", label: "Yesterday" },
        { id: "last7", label: "Last 7 Days" },
        { id: "last30", label: "Last 30 Days" },
        { id: "custom", label: "Custom Range", disabled: true },
    ];

    const currentLabel = options.find(o => o.id === value)?.label || "Select Range";

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            >
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                {currentLabel}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                disabled={opt.disabled}
                                onClick={() => {
                                    onChange(opt.id as DateRange);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full text-left px-4 py-2 text-xs font-medium transition-colors
                                    ${value === opt.id
                                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }
                                    ${opt.disabled ? "opacity-30 cursor-not-allowed" : ""}
                                `}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
