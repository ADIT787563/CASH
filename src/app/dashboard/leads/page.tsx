"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    BadgeCheck,
    MessageSquare,
    Megaphone,
    MoreVertical
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
    status: string; // Updated to string to support "INTERESTED", "CONVERTED" etc flexible
    totalOrders: number;
    totalSpend: number;
    tags: string[]; // 'REPEAT', 'HIGH_VALUE', 'COD_RISK'
    lastInteraction: string;
    source?: string;
    lastMessage?: string;
    avatarColor?: string;
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
    const router = useRouter();
    const { checkPermission } = useRole();
    // Enhanced Mock Data for UI match
    const initialLeadsList: Lead[] = [
        {
            id: 1,
            name: "Vikram Singh",
            email: "vikram@example.com",
            phone: "+91 98765 43210",
            status: "INTERESTED",
            source: "Whatsapp",
            lastMessage: "Price kya hai?",
            lastInteraction: new Date().toISOString(),
            totalOrders: 0,
            totalSpend: 0,
            tags: ["NEW"],
            avatarColor: "bg-emerald-500"
        },
        {
            id: 2,
            name: "Priya Sharma",
            email: "priya@test.com",
            phone: "+91 87654 32109",
            status: "INTERESTED",
            source: "Catalog",
            lastMessage: "Can you give me some discount?",
            lastInteraction: new Date().toISOString(),
            totalOrders: 2,
            totalSpend: 4500,
            tags: ["REPEAT"],
            avatarColor: "bg-indigo-500"
        },
        {
            id: 3,
            name: "Amit Kumar",
            email: "amit@test.com",
            phone: "+91 76543 21098",
            status: "CONVERTED",
            source: "Campaign",
            lastMessage: "Order confirmed!",
            lastInteraction: new Date().toISOString(),
            totalOrders: 5,
            totalSpend: 12500,
            tags: ["VIP"],
            avatarColor: "bg-teal-500"
        },
        {
            id: 4,
            name: "Neha Gupta",
            email: "neha@test.com",
            phone: "+91 65432 10987",
            status: "NEW",
            source: "Whatsapp",
            lastMessage: "Hello, I want to buy...",
            lastInteraction: new Date().toISOString(),
            totalOrders: 0,
            totalSpend: 0,
            tags: ["NEW"],
            avatarColor: "bg-rose-500"
        }
    ];

    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await fetch("/api/leads");
                if (res.ok) {
                    const data = await res.json();
                    setLeads(data);
                }
            } catch (error) {
                console.error("Failed to load leads", error);
                toast.error("Failed to load leads");
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeads();
    }, []);

    // Helper to format date safely
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
        } catch (e) {
            return "Invalid Date";
        }
    };

    // Filter Logic
    const filteredLeads = leads.filter((lead) => {
        const matchesSearch =
            (lead.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (lead.phone?.includes(searchTerm) || false);
        const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "NEW": return "text-blue-400 border-blue-400/30 bg-blue-400/10";
            case "INTERESTED": return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
            case "CONVERTED": return "text-green-400 border-green-400/30 bg-green-400/10";
            default: return "text-zinc-400 border-zinc-700 bg-zinc-800";
        }
    };

    return (
        <div className="space-y-6 text-zinc-100 animate-in fade-in duration-500">
            {/* Header is handled by layout/top-nav usually but we add specific page controls here if needed */}

            {/* Filters Toolbar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg transform transition-all hover:border-zinc-700">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search leads by name, phone, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg text-sm px-4 py-2.5 text-zinc-400 focus:outline-none focus:border-indigo-500 hover:border-zinc-700 transition-colors cursor-pointer min-w-[140px]"
                        aria-label="Filter by Status"
                    >
                        <option value="ALL">All Status</option>
                        <option value="NEW">New</option>
                        <option value="INTERESTED">Interested</option>
                        <option value="CONVERTED">Converted</option>
                    </select>
                    <select
                        className="bg-zinc-950 border border-zinc-800 rounded-lg text-sm px-4 py-2.5 text-zinc-400 focus:outline-none focus:border-indigo-500 hover:border-zinc-700 transition-colors cursor-pointer min-w-[140px]"
                        aria-label="Filter by Source"
                    >
                        <option value="ALL">All Sources</option>
                        <option value="Whatsapp">Whatsapp</option>
                        <option value="Catalog">Catalog</option>
                        <option value="Campaign">Campaign</option>
                    </select>
                </div>
            </div>

            {/* Dark Theme Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Lead</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Last Message</th>
                                <th className="px-6 py-4">Orders</th>
                                <th className="px-6 py-4">Spent</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${lead.avatarColor || 'bg-zinc-700'}`}>
                                                {lead.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-zinc-200">{lead.name}</div>
                                                <div className="text-zinc-500 text-xs mt-0.5 font-mono">{lead.phone}</div>
                                                <div className="text-zinc-600 text-[10px]">{lead.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center justify-between w-32 px-3 py-1.5 rounded-md border text-xs font-semibold ${getStatusColor(lead.status)}`}>
                                            {lead.status.charAt(0) + lead.status.slice(1).toLowerCase()}
                                            <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            {lead.source === 'Whatsapp' && <MessageSquare className="w-4 h-4" />}
                                            {lead.source === 'Catalog' && <ShoppingBag className="w-4 h-4" />}
                                            {lead.source === 'Campaign' && <Megaphone className="w-4 h-4" />}
                                            <span>{lead.source}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-zinc-300 max-w-[150px] truncate" title={lead.lastMessage}>{lead.lastMessage || "-"}</div>
                                            <div className="text-zinc-600 text-xs mt-1">{formatDate(lead.lastInteraction)}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-zinc-300 font-medium">{lead.totalOrders}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold ${lead.totalSpend > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                            ₹{lead.totalSpend.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Call">
                                                <Phone className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Chat">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" aria-label="More Options">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
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
