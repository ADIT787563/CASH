"use client";

import { useState } from "react";
import {
    Users,
    Search,
    Filter,
    MoreHorizontal,
    Phone,
    Mail,
    Tag,
    ArrowUpDown,
    UserPlus,
    RefreshCw,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ActionButton } from "@/components/ui/ActionButton";
import { useRole } from "@/hooks/useRole";
import { Lock, Trash2, Edit } from "lucide-react";

// --- Mock Data ---
interface Lead {
    id: number;
    name: string;
    email: string | null;
    phone: string;
    status: "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "WON";
    source: string;
    lastInteraction: string;
    assignedTo?: string;
}

const initialLeads: Lead[] = [
    { id: 1, name: "Rohit Sharma", email: "rohit@example.com", phone: "+91 98765 43210", status: "NEW", source: "Website", lastInteraction: new Date().toISOString() },
    { id: 2, name: "Anjali Gupta", email: "anjali@test.com", phone: "+91 99887 76655", status: "CONTACTED", source: "WhatsApp", lastInteraction: new Date().toISOString(), assignedTo: "Support Agent" },
];

export default function LeadsPage() {
    const { checkPermission, isPending: roleLoading } = useRole();
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [assigningId, setAssigningId] = useState<number | null>(null);

    // --- Logic Implementations ---

    const handleStatusChange = async (id: number, newStatus: Lead["status"]) => {
        // Optimistic Update
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));

        toast.success(`Status updated to ${newStatus} `, {
            description: "Database synchronized."
        });

        // Simulate API sync
        // await updateLeadStatus(id, newStatus);
    };

    const handleAssignAgent = (id: number) => {
        if (!checkPermission("manage:team")) {
            toast.error("Permission Denied", { description: "Only admins can assign agents." });
            return;
        }
        setAssigningId(id);
    };

    const confirmAssignment = (id: number, agentName: string) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, assignedTo: agentName } : l));
        setAssigningId(null);
        toast.success("Agent Assigned", { description: `${agentName} is now handling this lead.` });
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
            case "NEW": return "bg-blue-100 text-blue-700 border-blue-200";
            case "CONTACTED": return "bg-amber-100 text-amber-700 border-amber-200";
            case "QUALIFIED": return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case "WON": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "LOST": return "bg-slate-100 text-slate-600 border-slate-200 decoration-line-through opacity-70";
            default: return "bg-slate-50 text-slate-600 border-slate-200";
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">CRM Leads</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Waitlist: {leads.filter(l => l.status === 'NEW').length} New • Total: {leads.length}
                    </p>
                </div>
                <div className="flex gap-2">
                    <ActionButton
                        variant="secondary"
                        icon={<RefreshCw className="w-4 h-4" />}
                        onClick={() => window.location.reload()}
                    />
                    <ActionButton
                        icon={checkPermission("manage:leads") ? <UserPlus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        disabled={!checkPermission("manage:leads")}
                        onAction={() => { toast.info("Manual lead entry simulated"); }}
                    >
                        Add Lead
                    </ActionButton>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search name, phone, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="NEW">New (Unassigned)</option>
                        <option value="CONTACTED">In Progress</option>
                        <option value="WON">Closed Won</option>
                        <option value="LOST">Lost</option>
                    </select>
                </div>
            </div>

            {/* Logic-First Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input type="checkbox" className="rounded border-slate-300" />
                                </th>
                                <th className="px-6 py-4">Lead Details</th>
                                <th className="px-6 py-4">Status & Logic</th>
                                <th className="px-6 py-4">Assignment</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="rounded border-slate-300" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white">{lead.name}</div>
                                        <div className="flex flex-col gap-0.5 mt-1 text-slate-500 text-xs font-mono">
                                            <span className="flex items-center gap-2"><Phone className="w-3 h-3" /> {lead.phone}</span>
                                            {lead.email && <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {lead.email}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={lead.status}
                                            onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                                            className={`text-xs font-bold px-2 py-1 rounded border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${getStatusColor(lead.status)}`}
                                        >
                                            <option value="NEW">NEW</option>
                                            <option value="CONTACTED">CONTACTED</option>
                                            <option value="QUALIFIED">QUALIFIED</option>
                                            <option value="WON">WON</option>
                                            <option value="LOST">LOST</option>
                                        </select>
                                        <div className="text-[10px] text-slate-400 mt-1">
                                            Source: {lead.source}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {assigningId === lead.id ? (
                                            <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                                                <select
                                                    autoFocus
                                                    className="text-xs border rounded p-1 bg-white"
                                                    onChange={(e) => confirmAssignment(lead.id, e.target.value)}
                                                >
                                                    <option value="">Select Agent...</option>
                                                    <option value="Agent Smith">Agent Smith</option>
                                                    <option value="Sarah Connor">Sarah Connor</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => handleAssignAgent(lead.id)}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded -ml-1 transition-colors group/assign"
                                            >
                                                {lead.assignedTo ? (
                                                    <>
                                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                                            {lead.assignedTo.charAt(0)}
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-700">{lead.assignedTo}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-slate-400 flex items-center gap-1 group-hover/assign:text-indigo-600">
                                                        <UserPlus className="w-3 h-3" /> Unassigned
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <ActionButton variant="ghost" className="h-8 w-8 p-0" icon={<Edit className="w-4 h-4" />} />
                                            <ActionButton
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                requiresConfirm
                                                confirmMessage="Delete Lead?"
                                                icon={checkPermission("delete:lead") ? <Trash2 className="w-4 h-4 text-rose-400" /> : <Lock className="w-4 h-4 text-slate-300" />}
                                                disabled={!checkPermission("delete:lead")}
                                                onAction={() => { toast.info("Lead deleted simulated"); }}
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
