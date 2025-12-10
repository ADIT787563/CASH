"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  User,
  Building2,
  Bot,
  Package,
  Plug,
  BarChart3,
  Users,
  CreditCard,
  Shield,
  Download,
  Save,
  Loader2,
  Plus,
  Trash2,
  TestTube,
  Upload,
  Lock,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  Calendar,
  Clock,
  Mail,
  Phone,
  Globe,
  Smartphone,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { BillingTab } from "@/components/BillingTab";
import { Footer } from "@/components/home/Footer";
import { BusinessHours } from "@/components/settings/BusinessHours";

type TabId =
  | "account"
  | "business"
  | "chatbot"
  | "catalog"
  | "analytics"
  | "team"
  | "billing"
  | "security"
  | "export";

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : null;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("account");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Account settings state
  const [accountSettings, setAccountSettings] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    phoneVerified: false,
    timezone: "Asia/Kolkata",
    language: "en",
    logoUrl: "",
  });

  // Business settings state
  const [businessSettings, setBusinessSettings] = useState({
    businessCategory: "",
    shortBio: "",
    storeUrl: "",
    businessHours: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    madeInIndia: false,
    whatsappNumber: "",
  });

  const [hoursConfig, setHoursConfig] = useState("");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (businessSettings.businessHours) {
      setHoursConfig(businessSettings.businessHours);
    }
  }, [businessSettings.businessHours]);

  // Chatbot settings state
  const [chatbotSettings, setChatbotSettings] = useState({
    enabled: false,
    defaultResponseTone: "friendly",
    typingDelay: 1000,
  });

  // Catalog settings state
  const [catalogSettings, setCatalogSettings] = useState({
    defaultTemplate: "modern",
    autoUpdate: false,
    pdfDownloadEnabled: false,
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
  });

  // Analytics settings state
  const [analyticsSettings, setAnalyticsSettings] = useState({
    retentionDays: 30,
    realtimeEnabled: false,
    csvExportEnabled: false,
    pngExportEnabled: false,
    anonymizePii: false,
    webhookUrl: "",
    webhookSecret: "",
  });

  // Team settings state
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "viewer" });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    twoFactorMethod: null as string | null,
    sessions: [] as any[],
  });
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Export settings state
  const [exportJobs, setExportJobs] = useState<any[]>([]);

  // Backup settings state
  const [backupSchedule, setBackupSchedule] = useState({
    enabled: false,
    frequency: "daily",
    storageProvider: "",
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/dashboard/settings");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchAllSettings();
    }
  }, [session]);

  const fetchAllSettings = async () => {
    try {
      setIsLoading(true);
      const headers = getAuthHeaders();

      // 1. Fetch unified profile data FIRST
      const profileRes = await fetch("/api/business-profile", { headers });

      if (profileRes.ok) {
        const profile = await profileRes.json();
        if (profile) {
          setAccountSettings(prev => ({
            ...prev,
            fullName: profile.fullName || "",
            businessName: profile.businessName || "",
            email: session?.user?.email || "",
            phone: profile.phoneNumber || "",
            phoneVerified: true,
          }));

          setBusinessSettings(prev => ({
            ...prev,
            businessCategory: profile.businessCategory || "",
            street: profile.street || "",
            city: profile.city || "",
            state: profile.state || "",
            pincode: profile.pincode || "",
            gstNumber: profile.gstNumber || "",
            businessEmail: profile.businessEmail || "",
            whatsappNumber: profile.phoneNumber || "",
          }));
        }
      }

      setIsLoading(false);

      // 3. Fetch other settings
      Promise.all([
        fetch("/api/business-settings", { headers }),
        fetch("/api/chatbot-settings", { headers }),
        fetch("/api/settings/catalog", { headers }),
        fetch("/api/settings/analytics", { headers }),
        fetch("/api/settings/team", { headers }),
        fetch("/api/settings/security", { headers }),
        fetch("/api/settings/export", { headers }),
        fetch("/api/settings/backup", { headers }),
      ]).then(async ([bizSettingsRes, chatbotRes, catalogRes, analyticsRes, teamRes, securityRes, exportRes, backupRes]) => {
        if (bizSettingsRes.ok) {
          const data = await bizSettingsRes.json();
          setBusinessSettings(prev => ({
            ...prev,
            businessCategory: data.businessCategory || prev.businessCategory,
            whatsappNumber: data.whatsappNumber || prev.whatsappNumber,
            shortBio: data.businessDescription || "",
            storeUrl: data.catalogUrl || "",
            businessHours: data.businessHours || "",
          }));
        }

        if (chatbotRes.ok) {
          const data = await chatbotRes.json();
          if (data.data && data.data.length > 0) {
            setChatbotSettings((prev) => ({ ...prev, ...data.data[0] }));
          }
        }

        if (catalogRes.ok) {
          const data = await catalogRes.json();
          setCatalogSettings((prev) => ({ ...prev, ...data }));
        }

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalyticsSettings((prev) => ({ ...prev, ...data }));
        }

        if (teamRes.ok) {
          const data = await teamRes.json();
          setTeamMembers(Array.isArray(data) ? data : data.data || []);
        }

        if (securityRes.ok) {
          const data = await securityRes.json();
          setSecuritySettings((prev) => ({ ...prev, ...data }));
        }

        if (exportRes.ok) {
          const data = await exportRes.json();
          setExportJobs(Array.isArray(data) ? data : data.data || []);
        }

        if (backupRes.ok) {
          const data = await backupRes.json();
          setBackupSchedule((prev) => ({ ...prev, ...data }));
        }
      }).catch(err => {
        console.error("Error fetching background settings:", err);
      });

    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
      setIsLoading(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!accountSettings.fullName) {
      toast.error("Full name is required");
      return;
    }

    try {
      setIsSaving(true);
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };

      // Use PATCH draft endpoint for partial updates
      const response = await fetch("/api/business-profile/draft", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          fullName: accountSettings.fullName,
          businessName: accountSettings.businessName,
          // Phone is non-editable, so we don't send it unless we want to allow updates (user said non-editable)
        }),
      });

      if (response.ok) {
        toast.success("Account settings saved successfully!");
        fetchAllSettings(); // Refresh to sync
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save account settings");
      }
    } catch (error) {
      console.error("Error saving account settings:", error);
      toast.error("Error saving account settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBusiness = async () => {
    try {
      setIsSaving(true);
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };

      // Update Business Settings via dedicated endpoint
      const response = await fetch("/api/business-settings", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          businessName: accountSettings.businessName, // Ensure consistent name
          businessCategory: businessSettings.businessCategory,
          businessDescription: businessSettings.shortBio,
          catalogUrl: businessSettings.storeUrl,
          businessHours: hoursConfig,
          whatsappNumber: businessSettings.whatsappNumber,
        }),
      });

      if (response.ok) {
        toast.success("Business settings saved successfully!");
        fetchAllSettings(); // Refresh
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to save business settings");
      }
    } catch (error) {
      console.error("Error saving business settings:", error);
      toast.error("Error saving business settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChatbot = async () => {
    try {
      setIsSaving(true);
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };

      // Try PUT first (update existing settings)
      let response = await fetch("/api/chatbot-settings", {
        method: "PUT",
        headers,
        body: JSON.stringify(chatbotSettings),
      });

      // If settings don't exist (404), create them with POST
      if (response.status === 404) {
        response = await fetch("/api/chatbot-settings", {
          method: "POST",
          headers,
          body: JSON.stringify(chatbotSettings),
        });
      }

      if (response.ok) {
        toast.success("Chatbot settings saved successfully!");
        fetchAllSettings(); // Refresh settings
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save chatbot settings");
      }
    } catch (error) {
      console.error("Error saving chatbot settings:", error);
      toast.error("Error saving chatbot settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestChatbot = async () => {
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const response = await fetch("/api/chatbot-settings/test", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: "Hello, this is a test message" }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Test successful! Response: ${data.response || "Bot is working"}`);
      } else {
        toast.error("Chatbot test failed");
      }
    } catch (error) {
      toast.error("Error testing chatbot");
    }
  };

  const handleSaveCatalog = async () => {
    try {
      setIsSaving(true);
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };

      const response = await fetch("/api/settings/catalog", {
        method: "PUT",
        headers,
        body: JSON.stringify(catalogSettings),
      });

      if (response.ok) {
        toast.success("Catalog settings saved successfully!");
      } else {
        toast.error("Failed to save catalog settings");
      }
    } catch (error) {
      console.error("Error saving catalog settings:", error);
      toast.error("Error saving catalog settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAnalytics = async () => {
    try {
      setIsSaving(true);
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };

      const response = await fetch("/api/settings/analytics", {
        method: "PUT",
        headers,
        body: JSON.stringify(analyticsSettings),
      });

      if (response.ok) {
        toast.success("Analytics settings saved successfully!");
      } else {
        toast.error("Failed to save analytics settings");
      }
    } catch (error) {
      console.error("Error saving analytics settings:", error);
      toast.error("Error saving analytics settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!analyticsSettings.webhookUrl) {
      toast.error("Please enter a webhook URL first");
      return;
    }

    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const response = await fetch("/api/settings/analytics/test-webhook", {
        method: "POST",
        headers,
        body: JSON.stringify({
          webhookUrl: analyticsSettings.webhookUrl,
          webhookSecret: analyticsSettings.webhookSecret,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Webhook test successful!");
      } else {
        toast.error(data.error || "Webhook test failed");
      }
    } catch (error) {
      toast.error("Error testing webhook");
    }
  };

  const handleInviteTeamMember = async () => {
    if (!newMember.name || !newMember.email) {
      toast.error("Please enter both name and email");
      return;
    }

    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const response = await fetch("/api/settings/team", {
        method: "POST",
        headers,
        body: JSON.stringify(newMember),
      });

      if (response.ok) {
        toast.success("Team member invited successfully!");
        setShowInviteModal(false);
        setNewMember({ name: "", email: "", role: "viewer" });
        fetchAllSettings();
      } else {
        toast.error("Failed to invite team member");
      }
    } catch (error) {
      toast.error("Error inviting team member");
    }
  };

  const handleDeleteTeamMember = async (id: number) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/settings/team?id=${id}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        toast.success("Team member removed successfully!");
        fetchAllSettings();
      } else {
        toast.error("Failed to remove team member");
      }
    } catch (error) {
      toast.error("Error removing team member");
    }
  };

  const handleSetup2FA = async (method: "sms" | "authenticator") => {
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const response = await fetch("/api/settings/security/2fa-setup", {
        method: "POST",
        headers,
        body: JSON.stringify({ method }),
      });

      if (response.ok) {
        const data = await response.json();
        if (method === "authenticator" && data.qrCode) {
          setQrCode(data.qrCode);
        }
        toast.success(`2FA setup initiated!`);
        setShow2FASetup(true);
        setSecuritySettings((prev) => ({
          ...prev,
          twoFactorEnabled: true,
          twoFactorMethod: method,
        }));
      } else {
        toast.error("Failed to setup 2FA");
      }
    } catch (error) {
      toast.error("Error setting up 2FA");
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const response = await fetch("/api/settings/security/change-password", {
        method: "POST",
        headers,
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Password changed successfully!");
        setShowPasswordChange(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("Error changing password");
    }
  };

  const handleCreateExport = async (jobType: string) => {
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const response = await fetch("/api/settings/export", {
        method: "POST",
        headers,
        body: JSON.stringify({ jobType }),
      });

      if (response.ok) {
        toast.success(`${jobType} export started! You'll be notified when it's ready.`);
        fetchAllSettings();
      } else {
        toast.error("Failed to create export job");
      }
    } catch (error) {
      toast.error("Error creating export job");
    }
  };

  const handleSaveBackup = async () => {
    try {
      setIsSaving(true);
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };

      const response = await fetch("/api/settings/backup", {
        method: "PUT",
        headers,
        body: JSON.stringify(backupSchedule),
      });

      if (response.ok) {
        toast.success("Backup schedule saved successfully!");
      } else {
        toast.error("Failed to save backup schedule");
      }
    } catch (error) {
      console.error("Error saving backup schedule:", error);
      toast.error("Error saving backup schedule");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const tabs = [
    { id: "account" as TabId, label: "Account", icon: User },
    { id: "business" as TabId, label: "Business Profile", icon: Building2 },
    { id: "chatbot" as TabId, label: "Chatbot", icon: Bot },
    { id: "catalog" as TabId, label: "Catalog", icon: Package },
    { id: "analytics" as TabId, label: "Analytics & Data", icon: BarChart3 },
    { id: "team" as TabId, label: "Team & Roles", icon: Users },
    { id: "billing" as TabId, label: "Billing & Plans", icon: CreditCard },
    { id: "security" as TabId, label: "Security & Privacy", icon: Shield },
    { id: "export" as TabId, label: "Export & Backup", icon: Download },
  ];

  const planOptions = ["starter", "growth", "pro", "enterprise"] as const;
  const planFromSession = ((session?.user as any)?.plan || "starter").toString().toLowerCase();
  const userPlan = (planOptions.includes(planFromSession as any) ? planFromSession : "starter") as typeof planOptions[number];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-4 rounded-2xl space-y-2 lg:sticky lg:top-20">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 active:scale-[0.98] ${activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm text-left">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "account" && (
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Account Information</h2>
                  <p className="text-muted-foreground text-sm">
                    Update your personal information and preferences
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="full-name" className="block text-sm font-medium mb-2">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="full-name"
                      type="text"
                      value={accountSettings.fullName}
                      onChange={(e) =>
                        setAccountSettings({ ...accountSettings, fullName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="business-name" className="block text-sm font-medium mb-2">Business Name</label>
                    <input
                      id="business-name"
                      type="text"
                      value={accountSettings.businessName}
                      onChange={(e) =>
                        setAccountSettings({ ...accountSettings, businessName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="My Business"
                    />
                  </div>

                  <div>
                    <label htmlFor="email-address" className="block text-sm font-medium mb-2">Email Address</label>
                    <div className="relative">
                      <input
                        id="email-address"
                        type="email"
                        value={session.user.email}
                        disabled
                        aria-label="Email address (verified)"
                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg cursor-not-allowed opacity-70"
                      />
                      <span className="absolute right-3 top-3 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Verified
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={accountSettings.phone}
                        disabled
                        className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-lg cursor-not-allowed opacity-70"
                        placeholder="+91 98765 43210"
                      />
                      {accountSettings.phoneVerified && (
                        <button className="px-3 py-2 bg-success/10 text-success rounded-lg" disabled aria-label="Phone verified">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      value={accountSettings.timezone}
                      onChange={(e) =>
                        setAccountSettings({ ...accountSettings, timezone: e.target.value })
                      }
                      aria-label="Select timezone"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="Asia/Kolkata">India (IST)</option>
                      <option value="America/New_York">New York (EST)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Australia/Sydney">Sydney (AEST)</option>
                      <option value="Asia/Dubai">Dubai (GST)</option>
                      <option value="Asia/Singapore">Singapore (SGT)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="language" className="block text-sm font-medium mb-2">Language</label>
                    <select
                      id="language"
                      value={accountSettings.language}
                      onChange={(e) =>
                        setAccountSettings({ ...accountSettings, language: e.target.value })
                      }
                      aria-label="Select language"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi (हिंदी)</option>
                      <option value="ta">Tamil (தமிழ்)</option>
                      <option value="te">Telugu (తెలుగు)</option>
                      <option value="mr">Marathi (मराठी)</option>
                      <option value="bn">Bengali (বাংলা)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Profile Logo (Square, max 2MB)
                  </label>
                  <div className="flex items-center gap-4">
                    {accountSettings.logoUrl && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                        <img
                          src={accountSettings.logoUrl}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="url"
                      value={accountSettings.logoUrl}
                      onChange={(e) =>
                        setAccountSettings({ ...accountSettings, logoUrl: e.target.value })
                      }
                      className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveAccount}
                  disabled={isSaving}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isSaving ? "Saving..." : "Save Account Settings"}
                </button>
              </div>
            )}

            {activeTab === "business" && (
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Business Profile</h2>
                  <p className="text-muted-foreground text-sm">
                    Configure your business details and branding
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="business-category" className="block text-sm font-medium mb-2">Business Category</label>
                    <select
                      id="business-category"
                      value={businessSettings.businessCategory}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, businessCategory: e.target.value })
                      }
                      aria-label="Select business category"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="">Select Category</option>
                      <option value="retail">Retail Store</option>
                      <option value="e-commerce">E-commerce</option>
                      <option value="service">Service Business</option>
                      <option value="restaurant">Restaurant/Café</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Store URL
                    </label>
                    <input
                      type="url"
                      value={businessSettings.storeUrl}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, storeUrl: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="https://yourstore.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Short Bio</label>
                  <textarea
                    value={businessSettings.shortBio}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, shortBio: e.target.value })
                    }
                    rows={3}
                    maxLength={250}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    placeholder="A brief description of your business (max 250 characters)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {businessSettings.shortBio.length}/250 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Business Hours
                    </label>
                    <BusinessHours
                      initialData={hoursConfig}
                      onChange={(data) => setHoursConfig(data)}
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">GST Number (Optional)</label>
                    <input
                      type="text"
                      value={businessSettings.gstNumber}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, gstNumber: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Business Address</label>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={businessSettings.street}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, street: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="Street Address"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={businessSettings.city}
                        onChange={(e) =>
                          setBusinessSettings({ ...businessSettings, city: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={businessSettings.state}
                        onChange={(e) =>
                          setBusinessSettings({ ...businessSettings, state: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="State"
                      />
                      <input
                        type="text"
                        value={businessSettings.pincode}
                        onChange={(e) =>
                          setBusinessSettings({ ...businessSettings, pincode: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="PIN Code"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    WhatsApp Business Number
                  </label>
                  <input
                    type="tel"
                    value={businessSettings.whatsappNumber}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, whatsappNumber: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={businessSettings.madeInIndia}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, madeInIndia: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium">Made in India 🇮🇳</div>
                      <div className="text-sm text-muted-foreground">
                        Display "Made in India" badge on your catalogs
                      </div>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleSaveBusiness}
                  disabled={isSaving}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isSaving ? "Saving..." : "Save Business Profile"}
                </button>
              </div>
            )}

            {activeTab === "chatbot" && (
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Chatbot Settings</h2>
                  <p className="text-muted-foreground text-sm">
                    Configure your AI chatbot behavior and responses
                  </p>
                </div>

                {/* Chatbot Status Toggle */}
                <div className="p-4 border border-border rounded-lg bg-primary/5">
                  <label className="flex items-center justify-between cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">Enable Chatbot</div>
                        <div className="text-sm text-muted-foreground">
                          AI-powered customer support is always active
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-not-allowed opacity-100"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="response-tone" className="block text-sm font-medium mb-2">Default Response Tone</label>
                    <select
                      id="response-tone"
                      value={chatbotSettings.defaultResponseTone}
                      onChange={(e) =>
                        setChatbotSettings({ ...chatbotSettings, defaultResponseTone: e.target.value })
                      }
                      aria-label="Select default response tone"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="friendly">Friendly</option>
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="typing-delay" className="block text-sm font-medium mb-2">
                      Typing Delay (milliseconds)
                    </label>
                    <input
                      id="typing-delay"
                      type="number"
                      min="0"
                      max="5000"
                      step="100"
                      value={chatbotSettings.typingDelay}
                      onChange={(e) =>
                        setChatbotSettings({
                          ...chatbotSettings,
                          typingDelay: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(chatbotSettings.typingDelay / 1000).toFixed(1)}s delay
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveChatbot}
                    disabled={isSaving}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {isSaving ? "Saving..." : "Save Settings"}
                  </button>

                  <button
                    onClick={handleTestChatbot}
                    className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
                  >
                    <TestTube className="w-5 h-5" />
                    Test Bot
                  </button>
                </div>
              </div>
            )}

            {activeTab === "catalog" && (
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Catalog Settings</h2>
                  <p className="text-muted-foreground text-sm">
                    Manage your product catalog preferences
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="default-template" className="block text-sm font-medium mb-2">Default Template</label>
                    <select
                      id="default-template"
                      value={catalogSettings.defaultTemplate}
                      onChange={(e) =>
                        setCatalogSettings({ ...catalogSettings, defaultTemplate: e.target.value })
                      }
                      aria-label="Select default template"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="modern">Modern</option>
                      <option value="minimal">Minimal</option>
                      <option value="elegant">Elegant</option>
                      <option value="professional">Professional</option>
                      <option value="classic">Classic</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-3 p-4 border border-border rounded-lg w-full cursor-pointer hover:bg-muted/50 transition-all">
                      <input
                        type="checkbox"
                        checked={catalogSettings.autoUpdate}
                        onChange={(e) =>
                          setCatalogSettings({ ...catalogSettings, autoUpdate: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="font-medium text-sm">Auto-Update Catalog</div>
                        <div className="text-xs text-muted-foreground">
                          Sync when products change
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">PDF Download</div>
                        <div className="text-sm text-muted-foreground">
                          {userPlan === "starter" ? (
                            <span className="text-amber-500 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Upgrade to Growth plan
                            </span>
                          ) : (
                            "Allow customers to download catalog as PDF"
                          )}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={catalogSettings.pdfDownloadEnabled}
                      onChange={(e) =>
                        setCatalogSettings({
                          ...catalogSettings,
                          pdfDownloadEnabled: e.target.checked,
                        })
                      }
                      disabled={userPlan === "starter"}
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">UTM Parameters for Share Links</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        utm_source
                      </label>
                      <input
                        type="text"
                        value={catalogSettings.utmSource}
                        onChange={(e) =>
                          setCatalogSettings({ ...catalogSettings, utmSource: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="whatsapp"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        utm_medium
                      </label>
                      <input
                        type="text"
                        value={catalogSettings.utmMedium}
                        onChange={(e) =>
                          setCatalogSettings({ ...catalogSettings, utmMedium: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="social"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        utm_campaign
                      </label>
                      <input
                        type="text"
                        value={catalogSettings.utmCampaign}
                        onChange={(e) =>
                          setCatalogSettings({ ...catalogSettings, utmCampaign: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="catalog_share"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveCatalog}
                  disabled={isSaving}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isSaving ? "Saving..." : "Save Catalog Settings"}
                </button>
              </div>
            )}


            {activeTab === "analytics" && (
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Analytics & Data</h2>
                  <p className="text-muted-foreground text-sm">
                    Configure data retention and export settings
                  </p>
                </div>

                {/* Data Retention */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium">Data Retention Window</div>
                      <div className="text-sm text-muted-foreground">
                        {userPlan === "starter" && "Starter: 30 days"}
                        {userPlan === "growth" && "Growth: 60 days"}
                        {userPlan === "pro" && "Pro: 120 days"}
                        {userPlan === "enterprise" && "Enterprise: Unlimited"}
                      </div>
                    </div>
                    <input
                      id="retention-days"
                      type="number"
                      min="30"
                      value={analyticsSettings.retentionDays}
                      aria-label="Data retention days"
                      onChange={(e) =>
                        setAnalyticsSettings({
                          ...analyticsSettings,
                          retentionDays: parseInt(e.target.value) || 30,
                        })
                      }
                      disabled={userPlan === "starter"}
                      className="w-20 px-3 py-2 bg-background border border-border rounded-lg text-center disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Real-time Updates */}
                <div className="p-4 border border-border rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">Real-time Updates</div>
                        <div className="text-sm text-muted-foreground">
                          Enable live data streaming
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={analyticsSettings.realtimeEnabled}
                      onChange={(e) =>
                        setAnalyticsSettings({
                          ...analyticsSettings,
                          realtimeEnabled: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                    />
                  </label>
                </div>

                {/* Export Settings */}
                <div className="space-y-3">
                  <h3 className="font-medium">Export Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-all">
                      <input
                        type="checkbox"
                        checked={analyticsSettings.csvExportEnabled}
                        onChange={(e) =>
                          setAnalyticsSettings({
                            ...analyticsSettings,
                            csvExportEnabled: e.target.checked,
                          })
                        }
                        disabled={userPlan === "starter"}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                      />
                      <div>
                        <div className="font-medium text-sm">CSV Export</div>
                        {userPlan === "starter" && (
                          <div className="text-xs text-amber-500 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Growth plan required
                          </div>
                        )}
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-all">
                      <input
                        type="checkbox"
                        checked={analyticsSettings.pngExportEnabled}
                        onChange={(e) =>
                          setAnalyticsSettings({
                            ...analyticsSettings,
                            pngExportEnabled: e.target.checked,
                          })
                        }
                        disabled={userPlan === "starter"}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                      />
                      <div>
                        <div className="font-medium text-sm">PNG Export</div>
                        {userPlan === "starter" && (
                          <div className="text-xs text-amber-500 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Growth plan required
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Privacy */}
                <div className="p-4 border border-border rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">Anonymize PII</div>
                        <div className="text-sm text-muted-foreground">
                          Mask personal information in exports
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={analyticsSettings.anonymizePii}
                      onChange={(e) =>
                        setAnalyticsSettings({
                          ...analyticsSettings,
                          anonymizePii: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                    />
                  </label>
                </div>

                {/* Webhook Configuration */}
                <div className="space-y-3">
                  <h3 className="font-medium">Webhook Configuration</h3>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Webhook URL</label>
                    <input
                      type="url"
                      value={analyticsSettings.webhookUrl}
                      onChange={(e) =>
                        setAnalyticsSettings({ ...analyticsSettings, webhookUrl: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="https://your-app.com/webhook"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Webhook Secret (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={analyticsSettings.webhookSecret}
                        onChange={(e) =>
                          setAnalyticsSettings({
                            ...analyticsSettings,
                            webhookSecret: e.target.value,
                          })
                        }
                        className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="Optional signing secret"
                      />
                      <button
                        onClick={handleTestWebhook}
                        className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all"
                        aria-label="Test webhook"
                      >
                        <TestTube className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAnalytics}
                    disabled={isSaving}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {isSaving ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "team" && (
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Team & Roles</h2>
                    <p className="text-muted-foreground text-sm">
                      Manage team members and their permissions
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Invite Member
                  </button>
                </div>

                {teamMembers.length > 0 ? (
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                              {member.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs px-3 py-1 bg-muted rounded-full capitalize">
                              {member.role}
                            </span>
                            <button
                              onClick={() => handleDeleteTeamMember(member.id)}
                              className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-all"
                              aria-label={`Delete team member ${member.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border border-dashed border-border rounded-lg">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <div className="text-lg font-medium mb-1">No team members yet</div>
                    <p className="text-muted-foreground text-sm mb-4">
                      Invite team members to collaborate
                    </p>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                    >
                      Invite Your First Member
                    </button>
                  </div>
                )}

                {/* Invite Modal */}
                {showInviteModal && (
                  <>
                    <div
                      className="fixed inset-0 bg-black/50 z-50"
                      onClick={() => setShowInviteModal(false)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Invite Team Member</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <input
                              type="text"
                              value={newMember.name}
                              onChange={(e) =>
                                setNewMember({ ...newMember, name: e.target.value })
                              }
                              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                              type="email"
                              value={newMember.email}
                              onChange={(e) =>
                                setNewMember({ ...newMember, email: e.target.value })
                              }
                              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="john@example.com"
                            />
                          </div>
                          <div>
                            <label htmlFor="member-role" className="block text-sm font-medium mb-2">Role</label>
                            <select
                              id="member-role"
                              value={newMember.role}
                              onChange={(e) =>
                                setNewMember({ ...newMember, role: e.target.value })
                              }
                              aria-label="Select member role"
                              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="agent">Agent</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => setShowInviteModal(false)}
                              className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/70 rounded-lg transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleInviteTeamMember}
                              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                            >
                              Send Invite
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "billing" && <BillingTab currentPlan={userPlan} />}

            {activeTab === "security" && (
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Security & Privacy</h2>
                  <p className="text-muted-foreground text-sm">
                    Manage your security settings and data privacy
                  </p>
                </div>

                {/* 2FA */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">
                          {securitySettings.twoFactorEnabled ? "Enabled" : "Add extra layer of security"}
                        </div>
                      </div>
                    </div>
                    {!securitySettings.twoFactorEnabled ? (
                      <button
                        onClick={() => handleSetup2FA("authenticator")}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                      >
                        Enable 2FA
                      </button>
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    )}
                  </div>
                </div>

                {/* Password Change */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">Password</div>
                        <div className="text-sm text-muted-foreground">
                          Change your account password
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-all"
                    >
                      Change
                    </button>
                  </div>
                  {showPasswordChange && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          autoComplete="off"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          }
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <input
                          type="password"
                          autoComplete="off"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          autoComplete="off"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          }
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <button
                        onClick={handleChangePassword}
                        className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                      >
                        Update Password
                      </button>
                    </div>
                  )}
                </div>

                {/* Active Sessions */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Active Sessions</div>
                      <div className="text-sm text-muted-foreground">
                        {securitySettings.sessions.length || 1} active session(s)
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-all text-sm">
                      View All
                    </button>
                  </div>
                </div>

                {/* Data Export */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Export Your Data</div>
                      <div className="text-sm text-muted-foreground">
                        Download all your account data
                      </div>
                    </div>
                    <button
                      onClick={() => handleCreateExport("account_data")}
                      className="px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-all text-sm"
                    >
                      Request Export
                    </button>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="p-4 border-2 border-destructive/20 rounded-lg bg-destructive/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-destructive">Delete Account</div>
                      <div className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-all text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "export" && (
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Export & Backup</h2>
                  <p className="text-muted-foreground text-sm">
                    Manage data exports and automated backups
                  </p>
                </div>

                {/* Manual Exports */}
                <div className="space-y-3">
                  <h3 className="font-medium">Manual Exports</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleCreateExport("leads")}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-5 h-5 text-primary" />
                        {userPlan === "starter" && <Lock className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className="font-medium">Export Leads</div>
                      <div className="text-sm text-muted-foreground">CSV format</div>
                    </button>

                    <button
                      onClick={() => handleCreateExport("chats")}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Download className="w-5 h-5 text-primary" />
                        {userPlan === "starter" && <Lock className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className="font-medium">Export Chats</div>
                      <div className="text-sm text-muted-foreground">ZIP archive</div>
                    </button>

                    <button
                      onClick={() => handleCreateExport("analytics")}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        {userPlan === "starter" && <Lock className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className="font-medium">Export Analytics</div>
                      <div className="text-sm text-muted-foreground">CSV/PNG</div>
                    </button>

                    <button
                      onClick={() => handleCreateExport("products")}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div className="font-medium">Export Catalog</div>
                      <div className="text-sm text-muted-foreground">CSV format</div>
                    </button>
                  </div>
                </div>

                {/* Export Jobs */}
                {exportJobs.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Recent Exports</h3>
                    <div className="space-y-2">
                      {exportJobs.slice(0, 5).map((job) => (
                        <div
                          key={job.id}
                          className="p-3 border border-border rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Download className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium capitalize">{job.jobType}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(job.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {job.status === "completed" && (
                              <a
                                href={job.downloadUrl}
                                className="text-primary hover:underline text-sm"
                              >
                                Download
                              </a>
                            )}
                            {job.status === "processing" && (
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            )}
                            {job.status === "failed" && (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Backup Schedule */}
                <div className="space-y-4">
                  <h3 className="font-medium">Automated Backups</h3>
                  <div className="p-4 border border-border rounded-lg">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="font-medium">Enable Automated Backups</div>
                        <div className="text-sm text-muted-foreground">
                          {userPlan === "starter"
                            ? "Upgrade to Pro for automated backups"
                            : "Schedule regular data backups"}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={backupSchedule.enabled}
                        onChange={(e) =>
                          setBackupSchedule({ ...backupSchedule, enabled: e.target.checked })
                        }
                        disabled={userPlan === "starter"}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                      />
                    </label>
                  </div>

                  {backupSchedule.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="backup-frequency" className="block text-sm font-medium mb-2">Frequency</label>
                        <select
                          id="backup-frequency"
                          value={backupSchedule.frequency}
                          onChange={(e) =>
                            setBackupSchedule({ ...backupSchedule, frequency: e.target.value })
                          }
                          aria-label="Select backup frequency"
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="storage-provider" className="block text-sm font-medium mb-2">Storage</label>
                        <select
                          id="storage-provider"
                          value={backupSchedule.storageProvider}
                          onChange={(e) =>
                            setBackupSchedule({ ...backupSchedule, storageProvider: e.target.value })
                          }
                          aria-label="Select storage provider"
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select Provider</option>
                          <option value="aws">AWS S3</option>
                          <option value="gcp">Google Cloud</option>
                          <option value="azure">Azure Blob</option>
                          <option value="local">Local Storage</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSaveBackup}
                    disabled={isSaving || userPlan === "starter"}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {isSaving ? "Saving..." : "Save Backup Settings"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main >
      <Footer />
    </div >
  );
}