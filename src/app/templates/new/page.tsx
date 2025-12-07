"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { ArrowLeft, Sparkles, Info } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "welcome", label: "Welcome" },
  { value: "order", label: "Order" },
  { value: "inquiry", label: "Inquiry" },
  { value: "follow-up", label: "Follow-up" },
  { value: "promotional", label: "Promotional" },
  { value: "custom", label: "Custom" },
];

const VARIABLE_CHIPS = [
  { label: "{{name}}", value: "{{name}}" },
  { label: "{{product}}", value: "{{product}}" },
  { label: "{{order_id}}", value: "{{order_id}}" },
  { label: "{{date}}", value: "{{date}}" },
  { label: "{{price}}", value: "{{price}}" },
];

const USE_CASE_EXAMPLES = [
  "Welcome Message",
  "Order Confirmation",
  "Follow-up Message",
  "Product Information Request",
];

export default function NewTemplatePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    content: "",
  });
  
  const [errors, setErrors] = useState({
    name: "",
    category: "",
    content: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem("template_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
        setIsDraft(true);
        toast.info("Draft loaded from previous session");
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (formData.name || formData.category || formData.content) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem("template_draft", JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      category: "",
      content: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }

    if (!formData.category) {
      newErrors.category = "Select a category";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Message content cannot be empty";
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.category && !newErrors.content;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Template created successfully!");
        localStorage.removeItem("template_draft");
        router.push("/templates");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Error creating template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.category || formData.content) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        localStorage.removeItem("template_draft");
        router.push("/templates");
      }
    } else {
      router.push("/templates");
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const newText = text.substring(0, start) + variable + text.substring(end);

    setFormData({ ...formData, content: newText });

    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const renderPreview = () => {
    let preview = formData.content;
    VARIABLE_CHIPS.forEach(({ value }) => {
      const placeholder = value
        .replace("{{", "")
        .replace("}}", "")
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      preview = preview.replaceAll(value, `[${placeholder}]`);
    });
    return preview || "Your message preview will appear here...";
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/templates")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Templates
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Create New Template
          </h1>
          <p className="text-muted-foreground">
            Design reusable message templates for your WhatsApp campaigns
          </p>
          {isDraft && (
            <div className="mt-2 text-sm text-accent flex items-center gap-2">
              <Info className="w-4 h-4" />
              Draft auto-saved
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Name */}
            <div className="glass-card p-6 rounded-[20px]">
              <label className="block text-sm font-semibold mb-2">
                Template Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="e.g., Welcome Message"
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-2">{errors.name}</p>
              )}
              
              {/* Use Case Hints */}
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Common use-cases:</p>
                <div className="flex flex-wrap gap-2">
                  {USE_CASE_EXAMPLES.map((example) => (
                    <button
                      key={example}
                      onClick={() => setFormData({ ...formData, name: example })}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-xs transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="glass-card p-6 rounded-[20px]">
              <label className="block text-sm font-semibold mb-2">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-destructive text-sm mt-2">{errors.category}</p>
              )}
            </div>

            {/* Message Content */}
            <div className="glass-card p-6 rounded-[20px]">
              <label className="block text-sm font-semibold mb-2">
                Message Content <span className="text-destructive">*</span>
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full px-4 py-3 bg-background border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                placeholder="Write your message template here. Use {{name}}, {{product}}, etc. for variables."
              />
              {errors.content && (
                <p className="text-destructive text-sm mt-2">{errors.content}</p>
              )}

              {/* Variable Chips */}
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Quick Insert Variables:</p>
                <div className="flex flex-wrap gap-2">
                  {VARIABLE_CHIPS.map((chip) => (
                    <button
                      key={chip.value}
                      onClick={() => insertVariable(chip.value)}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-colors"
                    >
                      + {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tip Box */}
              <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-[20px]">
                <div className="flex gap-2 mb-2">
                  <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-accent mb-1">
                      Tip: Use {"{"}{"{"} variable {"}"}{"}"} for personalization
                    </p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Examples:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li><code className="bg-muted px-1.5 py-0.5 rounded">{"{{name}}"}</code></li>
                        <li><code className="bg-muted px-1.5 py-0.5 rounded">{"{{product}}"}</code></li>
                        <li><code className="bg-muted px-1.5 py-0.5 rounded">{"{{order_id}}"}</code></li>
                        <li><code className="bg-muted px-1.5 py-0.5 rounded">{"{{date}}"}</code></li>
                        <li><code className="bg-muted px-1.5 py-0.5 rounded">{"{{price}}"}</code></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example Messages */}
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">Example templates:</p>
                <div className="space-y-2">
                  <div className="p-3 bg-muted/50 rounded-[20px] text-sm">
                    "Hi {"{{name}}"}, thanks for your interest in {"{{product}}"}."
                  </div>
                  <div className="p-3 bg-muted/50 rounded-[20px] text-sm">
                    "Your order {"{{order_id}}"} has been confirmed."
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Section - Desktop Only */}
          <div className="hidden lg:block">
            <div className="glass-card p-6 rounded-[20px] sticky top-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Live Preview
              </h3>
              
              {formData.name && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Template Name</p>
                  <p className="font-semibold">{formData.name}</p>
                </div>
              )}
              
              {formData.category && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {CATEGORIES.find((c) => c.value === formData.category)?.label}
                  </span>
                </div>
              )}
              
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Message Preview</p>
                <div className="p-4 bg-muted/30 rounded-[20px] min-h-[200px]">
                  <p className="text-sm whitespace-pre-wrap">
                    {renderPreview()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Sticky on Mobile */}
        <div className="fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto bg-card border-t border-border lg:border-0 p-4 lg:p-0 lg:mt-8 z-10">
          <div className="container mx-auto max-w-7xl flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 lg:flex-none lg:px-8 py-3 bg-muted text-foreground rounded-[20px] font-semibold hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 lg:flex-none lg:px-8 py-3 bg-primary text-primary-foreground rounded-[20px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Template"}
            </button>
          </div>
        </div>

        {/* Spacer for fixed buttons on mobile */}
        <div className="h-20 lg:hidden" />
      </main>
    </div>
  );
}
