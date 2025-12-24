"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Users,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  MessageCircle,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  Bot,
  MoreVertical,
  CheckCircle,
  XCircle,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/home/Footer";
import Link from "next/link";

interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  status: string;
  interest_category: string | null;
  last_message: string | null;
  created_at: string;
  updated_at: string;
  // Advanced fields
  ai_behavior?: string;
  lead_source?: string;
}

export default function LeadsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  // Plan Check
  const userPlan = (session?.user as any)?.plan || "starter";
  const isAdvanced = userPlan.includes("pro") || userPlan.includes("enterprise") || userPlan.includes("growth");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchLeads();
    }
  }, [session]);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data || []); // API might return array directly or { data: [] }
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!isAdvanced) {
      toast.error("Export is available on Pro plans", {
        description: "Upgrade to export your leads data."
      });
      return;
    }

    const csv = [
      ["Name", "Phone", "Email", "Source", "Status", "Interest", "Created"],
      ...filteredLeads.map((lead) => [
        lead.name,
        lead.phone,
        lead.email || "",
        lead.source,
        lead.status,
        lead.interest_category || "",
        new Date(lead.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Leads exported successfully!");
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && (isAdvanced ? matchesSource : true);
  });

  const statuses = isAdvanced
    ? ["all", "new", "contacted", "qualified", "converted", "lost", "follow_up"]
    : ["all", "new", "interested", "converted", "not_interested"];

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-4xl font-extrabold flex items-center gap-3 text-zinc-900 tracking-tight">
                <Users className="w-10 h-10 text-primary" />
                {isAdvanced ? "Customers & Leads" : "My Contacts"}
              </h1>
              {!isAdvanced && (
                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-bold uppercase tracking-wide">
                  Basic
                </span>
              )}
              {isAdvanced && (
                <span className="px-4 py-1.5 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary rounded-full text-sm font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Pro
                </span>
              )}
            </div>
            <p className="text-lg text-muted-foreground">
              {isAdvanced
                ? "Manage relationships, track AI interactions, and drive conversions."
                : "Keep track of people who message you on WhatsApp."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* New Contact - Available to all */}
            <button className="px-6 py-3 bg-background border border-input rounded-xl hover:bg-muted transition-colors font-bold text-base flex items-center gap-2 shadow-sm">
              <Phone className="w-5 h-5" /> Add Contact
            </button>

            {/* Export - Advanced Only */}
            <button
              onClick={handleExportCSV}
              className={`px-6 py-3 rounded-xl font-bold text-base flex items-center gap-2 transition-all shadow-sm ${isAdvanced
                ? "bg-muted hover:bg-muted/80 text-foreground"
                : "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
                }`}
              title={!isAdvanced ? "Upgrade to Pro to export" : "Export to csv"}
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Export</span>
              {!isAdvanced && <Shield className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>

        {/* Upgrade Banner for Basic Users */}
        {!isAdvanced && (
          <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-background border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl text-primary">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg">Unlock AI Auto-Selling</h3>
                <p className="text-base text-muted-foreground">Get order history, auto-followups, and smart tags.</p>
              </div>
            </div>
            <Link href="/pricing" className="px-6 py-3 bg-primary text-primary-foreground text-base font-bold rounded-xl whitespace-nowrap shadow-md hover:scale-105 transition-transform">
              Upgrade to Pro
            </Link>
          </div>
        )}

        {/* Stats - Upscaled */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="glass-card p-6 rounded-2xl border border-border/50 shadow-sm min-h-[140px] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <Users className="w-6 h-6 text-primary" />
              {isAdvanced && <span className="text-sm font-bold text-success bg-success/10 px-2 py-0.5 rounded-lg">+12%</span>}
            </div>
            <div>
              <div className="text-3xl font-extrabold">{stats.total}</div>
              <div className="text-base text-muted-foreground font-medium">Total Contacts</div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-border/50 shadow-sm min-h-[140px] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div>
              <div className="text-3xl font-extrabold">{stats.new}</div>
              <div className="text-base text-muted-foreground font-medium">New Opportunities</div>
            </div>
          </div>

          {isAdvanced ? (
            // Advanced Stats
            <>
              <div className="glass-card p-6 rounded-2xl border border-border/50 shadow-sm min-h-[140px] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <Bot className="w-6 h-6 text-secondary" />
                  <span className="text-sm font-medium text-muted-foreground">AI Active</span>
                </div>
                <div>
                  <div className="text-3xl font-extrabold">{stats.contacted}</div>
                  <div className="text-base text-muted-foreground font-medium">In Conversation</div>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl border border-border/50 shadow-sm min-h-[140px] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <BarChart3 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold">{stats.converted}</div>
                  <div className="text-base text-muted-foreground font-medium">Converted Orders</div>
                </div>
              </div>
            </>
          ) : (
            // Basic Stats
            <>
              <div className="glass-card p-6 rounded-2xl border border-border/50 opacity-60 min-h-[140px] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <Bot className="w-6 h-6 text-muted-foreground" />
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold">--</div>
                  <div className="text-base text-muted-foreground font-medium">AI Conversions</div>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl border border-border/50 opacity-60 min-h-[140px] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <BarChart3 className="w-6 h-6 text-muted-foreground" />
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold">--</div>
                  <div className="text-base text-muted-foreground font-medium">Revenue Tracked</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filters & Controls */}
        <div className="glass-card p-6 rounded-2xl mb-8 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-base shadow-sm"
              />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-background border border-input rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px] shadow-sm"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Status" : status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                  </option>
                ))}
              </select>

              {isAdvanced && (
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-4 py-3 bg-background border border-input rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px] shadow-sm"
                >
                  <option value="all">All Sources</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-border shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-extrabold text-muted-foreground uppercase tracking-wider">Customer</th>
                  {isAdvanced && <th className="px-8 py-5 text-left text-sm font-extrabold text-muted-foreground uppercase tracking-wider">Source</th>}
                  <th className="px-8 py-5 text-left text-sm font-extrabold text-muted-foreground uppercase tracking-wider">Status</th>
                  {isAdvanced && <th className="px-8 py-5 text-left text-sm font-extrabold text-muted-foreground uppercase tracking-wider">AI Status</th>}
                  <th className="px-8 py-5 text-right text-sm font-extrabold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-base text-foreground">{lead.name}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Phone className="w-4 h-4" />
                          {lead.phone}
                        </div>
                      </div>
                    </td>

                    {isAdvanced && (
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-lg bg-muted text-sm font-semibold border border-border">
                          {lead.source || "Direct"}
                        </span>
                      </td>
                    )}

                    <td className="px-8 py-5">
                      <StatusBadge status={lead.status} />
                    </td>

                    {isAdvanced && (
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${lead.ai_behavior === 'human_only' ? 'bg-orange-500' : 'bg-green-500 animate-pulse'}`} />
                          <span className="text-sm font-medium">
                            {lead.ai_behavior === 'human_only' ? 'Paused' : 'Active'}
                          </span>
                        </div>
                      </td>
                    )}

                    <td className="px-8 py-5 text-right">
                      <button className="p-2.5 hover:bg-primary/10 rounded-xl text-primary transition-colors" title="Chat">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      {isAdvanced && (
                        <button className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground transition-colors ml-2">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold mb-3">No contacts found</h3>
              <p className="text-lg text-muted-foreground max-w-sm mx-auto">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "Your contacts will appear here automatically when they message you."}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    contacted: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    interested: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    qualified: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    converted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    not_interested: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  const label = status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);

  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || styles.not_interested}`}>
      {label}
    </span>
  );
}

function Lock({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}