"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    Phone,
    Mail,
    UserPlus,
    RefreshCw,
    Lock,
    Trash2,
    Edit,
    ShoppingBag,
    IndianRupee,
    AlertTriangle,
    Star,
    BadgeCheck
} from "lucide-react";
import { toast } from "sonner";
import { ActionButton } from "@/components/ui/ActionButton";
import { useRole } from "@/hooks/useRole";

// --- Mock Data ---
interface Lead {
    id: number;
    name: string;
    email: string | null;
    phone: string;
    status: "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "WON";
    totalOrders: number;
    totalSpend: number;
    tags: string[]; // 'REPEAT', 'HIGH_VALUE', 'COD_RISK'
    lastInteraction: string;
}

const initialLeads: Lead[] = [
    {
        id: 1,
        name: "Rohit Sharma",
        email: "rohit@example.com",
        phone: "+91 98765 43210",
        status: "NEW",
        totalOrders: 0,
        totalSpend: 0,
        tags: [],
        lastInteraction: new Date().toISOString()
    },
    {
        id: 2,
        name: "Anjali Gupta",
        email: "anjali@test.com",
        phone: "+91 99887 76655",
        status: "WON",
        totalOrders: 12,
        totalSpend: 24500,
        tags: ['REPEAT', 'HIGH_VALUE'],
        lastInteraction: new Date().toISOString()
    },
    {
        id: 3,
        name: "Rahul Verma",
        email: null,
        phone: "+91 88776 65544",
        status: "CONTACTED",
        totalOrders: 2,
        totalSpend: 1200,
        tags: ['COD_RISK'],
        lastInteraction: new Date().toISOString()
    },
];

export default function LeadsPage() {
    const { checkPermission } = useRole();
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const handleStatusChange = async (id: number, newStatus: Lead["status"]) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
        toast.success(`Status updated to ${newStatus}`);
    };

    // Filter Logic
    const filteredLeads = leads.filter((lead) => {
        const matchesSearch =
            lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone?.includes(searchTerm);
        const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "NEW": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
            case "CONTACTED": return "bg-zinc-500/10 text-zinc-300 border-zinc-500/20";
            case "WON": return "bg-white/10 text-white border-white/20 font-bold";
            case "LOST": return "bg-zinc-900/50 text-zinc-600 border-zinc-800 decoration-line-through opacity-70";
            default: return "bg-white/5 text-white/60 border-white/10";
        }
    };

    const renderTags = (tags: string[]) => {
        return (
            <div className="flex flex-wrap gap-1 mt-1">
                {tags.includes('REPEAT') && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        <BadgeCheck className="w-3 h-3" /> Repeat
                    </span>
                )}
                {tags.includes('HIGH_VALUE') && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-black border border-white">
                        <Star className="w-3 h-3" /> VIP
                    </span>
                )}
                {tags.includes('COD_RISK') && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800">
                        <AlertTriangle className="w-3 h-3" /> RTO Risk
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 text-white">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customers & Leads</h1>
                    <p className="text-sm text-white/50 mt-1 font-medium">
                        Tracking {leads.length} contacts • {leads.filter(l => l.tags.includes('HIGH_VALUE')).length} VIPs
                    </p>
                </div>
                <div className="flex gap-2">
                    <ActionButton
                        variant="secondary"
                        icon={<RefreshCw className="w-4 h-4" />}
                        onClick={() => window.location.reload()}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    />
                    <ActionButton
                        icon={checkPermission("manage:leads") ? <UserPlus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        disabled={!checkPermission("manage:leads")}
                        onAction={() => { toast.info("Manual lead entry simulated"); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                    >
                        Add Contact
                    </ActionButton>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row gap-4 justify-between items-center backdrop-blur-sm">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search name, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-white/40" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-black/20 border border-white/10 rounded-lg text-sm px-3 py-2 text-white focus:outline-none focus:border-indigo-500/50"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="NEW">New</option>
                        <option value="CONTACTED">In Progress</option>
                        <option value="WON">Customer (Won)</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 border-b border-white/10 text-white/40 font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Customer Details</th>
                                <th className="px-6 py-4">Purchase History</th>
                                <th className="px-6 py-4">Status & Tags</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white text-base">{lead.name}</div>
                                        <div className="flex flex-col gap-0.5 mt-1 text-white/50 text-xs font-mono">
                                            <span className="flex items-center gap-2"><Phone className="w-3 h-3" /> {lead.phone}</span>
                                            {lead.email && <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {lead.email}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-white/80">
                                                <ShoppingBag className="w-3 h-3 text-indigo-400" />
                                                <span className="font-medium">{lead.totalOrders} Orders</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white/80">
                                                <IndianRupee className="w-3 h-3 text-emerald-400" />
                                                <span className="font-medium">₹{lead.totalSpend.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={lead.status}
                                            onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded border border-transparent cursor-pointer focus:ring-1 focus:ring-offset-0 focus:ring-indigo-500 mb-1 block ${getStatusColor(lead.status)}`}
                                        >
                                            <option value="NEW" className="bg-slate-900">NEW</option>
                                            <option value="CONTACTED" className="bg-slate-900">CONTACTED</option>
                                            <option value="WON" className="bg-slate-900">WON</option>
                                            <option value="LOST" className="bg-slate-900">LOST</option>
                                        </select>
                                        {renderTags(lead.tags)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <ActionButton
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-white/40 hover:text-white"
                                                icon={<Edit className="w-4 h-4" />}
                                            />
                                            <ActionButton
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-white/40 hover:text-rose-400"
                                                requiresConfirm
                                                confirmMessage="Delete?"
                                                icon={checkPermission("delete:lead") ? <Trash2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                disabled={!checkPermission("delete:lead")}
                                                onAction={() => { toast.info("Simulated delete"); }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
