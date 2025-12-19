"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Building2,
  Package,
  Users,
  CreditCard,
  Shield,
  Save,
  Loader2,
  Lock,
  Smartphone,
  Globe,
  Mail,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// --- Components (Inline for now to ensure consistency, can extract later) ---

import { useRole } from "@/hooks/useRole";

function SettingsSidebar({ activeTab }: { activeTab: string }) {
  const router = useRouter();
  const { role, checkPermission } = useRole();

  const tabs = [
    { id: "business", label: "Business Details", icon: Building2 },
    { id: "whatsapp", label: "WhatsApp Integration", icon: Smartphone },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "ai", label: "AI Configuration", icon: Zap },
    { id: "team", label: "Team & Roles", icon: Users },
    { id: "billing", label: "Billing & Plan", icon: Package, permission: "manage:billing" },
    { id: "security", label: "Security", icon: Shield },
  ].filter(tab => !tab.permission || checkPermission(tab.permission as any));

  return (
    <nav className="space-y-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => router.push(`/dashboard/settings?tab=${tab.id}`)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${isActive
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900"
              }
            `}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-indigo-500" : "text-slate-500"}`} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function SettingsSection({ title, description, children, onSave, isSaving }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col h-full min-h-[600px] relative pb-20">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {children}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-b-lg flex justify-end">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
}

function InputGroup({ label, helpVar, ...props }: any) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
        {...props}
      />
      {helpVar && <p className="text-xs text-slate-500">{helpVar}</p>}
    </div>
  );
}

import { ActionButton } from "@/components/ui/ActionButton";
import { CheckCircle2, AlertTriangle, BarChart3, RefreshCw } from "lucide-react";

// ... (Sidebar remains same) ...

function SettingsContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "business";
  const { data: session } = useSession();
  const { role, checkPermission } = useRole();

  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState({
    name: session?.user?.name || "Acme Corp",
    email: session?.user?.email || "support@acme.com",
    phone: "+91 98765 43210",
    address: "123 Business Park"
  });

  // Logic States
  const [isVerified, setIsVerified] = useState(true); // AG-701: Verified businesses have locked fields
  const [webhookStatus, setWebhookStatus] = useState<"IDLE" | "TESTING" | "SUCCESS" | "FAILED">("IDLE");

  // Mock Usage
  const usage = {
    conversations: { used: 850, limit: 1000 },
    products: { used: 12, limit: 50 },
    ai_replies: { used: 4500, limit: 5000 }
  };

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Settings saved successfully");
    setLoading(false);
  };

  const handleWebhookTest = async () => {
    setWebhookStatus("TESTING");
    await new Promise(r => setTimeout(r, 1500));
    setWebhookStatus("SUCCESS");
    toast.success("Webhook verified successfully", { description: "Payload received at endpoint." });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "business":
        return (
          <SettingsSection
            title="Business Details"
            description="Manage your business identity. Verified profiles have locked fields."
            onSave={handleSave}
            isSaving={loading}
          >
            {isVerified && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center gap-3 text-sm text-emerald-800 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="font-bold block">Business Profile Verified</span>
                  Critical fields are locked to prevent identity spoofing. Contact support to change.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="Business Name"
                value={businessData.name}
                onChange={(e: any) => setBusinessData({ ...businessData, name: e.target.value })}
                disabled={isVerified}
                helpVar={isVerified ? "Locked by Verification" : undefined}
              />
              <InputGroup
                label="Support Email"
                type="email"
                value={businessData.email}
                disabled={isVerified} // Locked
              />
              <InputGroup
                label="Phone Number"
                value={businessData.phone}
                onChange={(e: any) => setBusinessData({ ...businessData, phone: e.target.value })}
              />
              <InputGroup label="Website" placeholder="https://acme.com" />
              <div className="md:col-span-2">
                <InputGroup
                  label="Address"
                  value={businessData.address}
                  onChange={(e: any) => setBusinessData({ ...businessData, address: e.target.value })}
                />
              </div>
            </div>
          </SettingsSection>
        );

      case "whatsapp":
        return (
          <SettingsSection
            title="WhatsApp Integration"
            description="Manage WhatsApp API connection and Webhooks."
            onSave={handleSave}
            isSaving={loading}
          >
            {/* Connection Status Mock */}
            <div className="flex items-center justify-between p-4 bg-white border rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">API Connected</p>
                  <p className="text-xs text-slate-500">Latency: 45ms</p>
                </div>
              </div>
              <ActionButton
                variant="secondary"
                icon={checkPermission("manage:settings") ? <RefreshCw className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                disabled={!checkPermission("manage:settings")}
              >
                Reconnect
              </ActionButton>
            </div>

            <div className="space-y-4">
              <InputGroup label="Webhook URL" value="https://api.wavegroww.com/webhooks/whatsapp" disabled />
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  <InputGroup label="Verify Token" type="password" value="••••••••••••••••" disabled />
                </div>
                <ActionButton
                  onClick={handleWebhookTest}
                  isLoading={webhookStatus === "TESTING"}
                  icon={webhookStatus === "SUCCESS" ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  className={webhookStatus === "SUCCESS" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  {webhookStatus === "SUCCESS" ? "Verified" : "Test Webhook"}
                </ActionButton>
              </div>
            </div>
          </SettingsSection>
        );

      case "billing":
        return (
          <SettingsSection
            title="Billing & Usage"
            description="Monitor your plan limits and upgrade if necessary."
            onSave={() => { }}
          >
            <div className="space-y-6">
              {/* Plan Card */}
              <div className="bg-indigo-600 rounded-xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">Pro Plan</h3>
                    <p className="text-indigo-100 text-sm">₹2,999 / month</p>
                  </div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase backdrop-blur-sm">Active</span>
                </div>
                <div className="mt-6 flex gap-3">
                  <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">Manage Subscription</button>
                </div>
                {/*bg pattern*/}
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                  <Package className="w-64 h-64" />
                </div>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Conversations", ...usage.conversations },
                  { label: "AI Replies", ...usage.ai_replies },
                  { label: "Active Products", ...usage.products }
                ].map(metric => {
                  const percent = (metric.used / metric.limit) * 100;
                  const isCritical = percent > 80;
                  return (
                    <div key={metric.label} className="bg-white dark:bg-slate-900 border p-4 rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{metric.label}</span>
                        <span className={`font-mono font-bold ${isCritical ? 'text-rose-600' : 'text-slate-600'}`}>
                          {metric.used}/{metric.limit}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : 'bg-indigo-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      {isCritical && (
                        <p className="text-xs text-rose-500 mt-2 flex items-center gap-1 font-medium">
                          <AlertTriangle className="w-3 h-3" /> Approaches Limit
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </SettingsSection>
        );

      default:
        // ... (Default placeholder remains)
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Lock className="w-12 h-12 mb-4 opacity-20" />
            <p>This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Left Sub-nav */}
      <div className="col-span-12 lg:col-span-3">
        <div className="sticky top-24"> {/* Adjusted sticky top */}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Settings</h1>
          <SettingsSidebar activeTab={activeTab} />
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="col-span-12 lg:col-span-9">
        {renderContent()}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}