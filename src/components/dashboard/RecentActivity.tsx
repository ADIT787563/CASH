"use client";

import { CheckCircle2, Briefcase, FileText, Zap } from "lucide-react";

const activities = [
    {
        id: 1,
        title: "Task Updated",
        desc: "Nikolai Updated a Task",
        time: "42 Mins Ago",
        icon: CheckCircle2,
        color: "bg-pink-500",
    },
    {
        id: 2,
        title: "Deal Added",
        desc: "Pralesh Added a new Deal",
        time: "1 Hour Ago",
        icon: Briefcase,
        color: "bg-indigo-500",
    },
    {
        id: 3,
        title: "Published Article",
        desc: "Sansh Published a Article",
        time: "5 Hours Ago",
        icon: FileText,
        color: "bg-yellow-500",
    },
    {
        id: 4,
        title: "Dock Updated",
        desc: "Manish Updated a Dock",
        time: "1 Day Ago",
        icon: Zap,
        color: "bg-red-500",
    },
];

export function RecentActivity({ activities: propActivities }: { activities?: any[] }) {
    // Fallback to prop activities if available and mapped correctly, otherwise use mock for design match
    // ideally we map the real data to this structure

    return (
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border h-full">
            <h2 className="text-lg font-bold mb-6">Recent Activities</h2>
            <div className="relative pl-2">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-2 bottom-4 w-[2px] bg-border" />

                <div className="space-y-8">
                    {activities.map((item) => (
                        <div key={item.id} className="relative flex items-start gap-4">
                            <div className={`relative z-10 w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-white shadow-md ring-4 ring-background`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div className="pt-1">
                                <h4 className="font-bold text-sm">{item.title}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {item.time} • <span className="opacity-70">{item.desc}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
