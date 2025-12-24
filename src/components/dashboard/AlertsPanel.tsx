"use client";

import { AlertTriangle, Bell, PauseCircle, Zap, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export function AlertsPanel() {
    const alerts = [
        {
            id: 1,
            title: "High COD Failure Rate",
            desc: "COD confirmation drops by 15% in last hour.",
            severity: "high",
            icon: ShieldAlert
        },
        {
            id: 2,
            title: "AI Fallback Spike",
            desc: "3 conversations required human takeover.",
            severity: "medium",
            icon: AlertTriangle
        }
    ];

    const actions = [
        {
            label: "Pause AI",
            icon: PauseCircle,
            color: "text-rose-600 bg-rose-50 hover:bg-rose-100",
            action: () => toast.success("AI Engine Paused")
        },
        {
            label: "Blast Discount",
            icon: Zap,
            color: "text-amber-600 bg-amber-50 hover:bg-amber-100",
            action: () => toast.success("Offer sent to pending carts")
        },
        {
            label: "Extend Hours",
            icon: Clock,
            color: "text-blue-600 bg-blue-50 hover:bg-blue-100",
            action: () => toast.success("Business hours extended by 2h")
        }
    ];

    return (
        <div className="glass-card p-8 rounded-xl border border-border h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-3">
                        <Bell className="w-6 h-6 text-rose-500" />
                        Alerts & Actions
                    </h3>
                </div>
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            </div>

            <div className="flex-1 space-y-4 mb-8">
                {alerts.map(alert => (
                    <div key={alert.id} className="p-4 bg-background border border-border rounded-xl shadow-sm flex gap-4">
                        <div className={`p-3 rounded-full h-fit ${alert.severity === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                            <alert.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground mt-0.5">{alert.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <h4 className="text-sm font-bold uppercase text-muted-foreground mb-4">Quick Actions</h4>
                <div className="grid grid-cols-3 gap-4">
                    {actions.map((act, idx) => (
                        <button
                            key={idx}
                            onClick={act.action}
                            className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl transition-colors border border-transparent hover:border-border/50 ${act.color}`}
                        >
                            <act.icon className="w-6 h-6" />
                            <span className="text-sm font-bold">{act.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
