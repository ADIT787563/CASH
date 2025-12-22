
import { Plus, Megaphone, Users } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
    const actions = [
        {
            icon: Plus,
            label: "Add New Product",
            href: "/catalog/products/new",
        },
        {
            icon: Megaphone,
            label: "Create Campaign",
            href: "/campaigns/new",
        },
        {
            icon: Users,
            label: "View All Leads",
            href: "/crm",
        }
    ];

    return (
        <div className="bg-[#0F1115] border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
                {actions.map((action, index) => (
                    <Link
                        key={index}
                        href={action.href}
                        className="flex items-center gap-3 p-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                            <action.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
