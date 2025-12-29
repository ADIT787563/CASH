"use client";

import { LucideIcon } from "lucide-react";

interface Tab {
    id: string;
    label: string;
    icon?: LucideIcon;
}

interface EditTabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
}

export function EditTabs({ tabs, activeTab, onChange }: EditTabsProps) {
    return (
        <div className="flex overflow-x-auto border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10 no-scrollbar">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button" // Prevent form submission
                        onClick={() => onChange(tab.id)}
                        className={`
              flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap
              ${isActive
                                ? "border-primary text-primary bg-primary/5"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"}
            `}
                    >
                        {Icon && <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
