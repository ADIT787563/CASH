"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/home/Footer";

interface Template {
  id: number;
  name: string;
  content: string;
  category: string;
  variables: string[];
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

export default function TemplatesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchTemplates();
    }
  }, [session]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/templates", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Template deleted successfully!");
        fetchTemplates();
      } else {
        toast.error("Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Error deleting template");
    }
  };

  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Template copied to clipboard!");
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "all",
    ...Array.from(new Set(templates.map((t) => t.category))),
  ];

  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.is_active).length,
    totalUsage: templates.reduce((sum, t) => sum + t.usage_count, 0),
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              Message Templates
            </h1>
            <p className="text-muted-foreground">
              Create and manage reusable message templates
            </p>
          </div>
          <button
            onClick={() => router.push("/templates/new")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Template
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl">
            <FileText className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Templates</div>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <Sparkles className="w-6 h-6 text-success mb-2" />
            <div className="text-2xl font-bold">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <Send className="w-6 h-6 text-accent mb-2" />
            <div className="text-2xl font-bold">{stats.totalUsage}</div>
            <div className="text-sm text-muted-foreground">Times Used</div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 rounded-2xl mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all"
                    ? "All Categories"
                    : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{template.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${template.is_active
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {template.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {template.category}
                  </span>
                </div>
              </div>

              <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap line-clamp-4">
                  {template.content}
                </p>
              </div>

              {template.variables && template.variables.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-2">
                    Variables:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-accent/10 text-accent rounded text-xs"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Used {template.usage_count} times
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyTemplate(template.content)}
                    className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="glass-card p-12 rounded-2xl text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || categoryFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first message template to get started"}
            </p>
            {!searchTerm && categoryFilter === "all" && (
              <button
                onClick={() => router.push("/templates/new")}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
              >
                Create Your First Template
              </button>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}