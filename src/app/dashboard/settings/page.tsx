"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Smartphone,
  CreditCard,
  Zap,
  Users,
  Package,
  Shield,
  Bell,
  Loader2,
  Lock
} from "lucide-react";

// Components
// Components
import { BusinessProfile } from "@/components/settings/BusinessProfile";
import { TeamSettings } from "@/components/settings/TeamSettings";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { SettingsSection } from "@/components/settings/SettingsSection";

// Placeholders for future implementation
const PlaceholderSection = ({ title }: { title: string }) => (
  <SettingsSection title={title} description="This section is under development." onSave={() => { }}>
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Zap className="w-12 h-12 mb-4 opacity-20" />
      <p>Coming Soon</p>
    </div>
  </SettingsSection>
);

function SettingsSidebar({ activeTab }: { activeTab: string }) {
  const router = useRouter();

  const tabs = [
    { id: "business", label: "Business Profile", icon: Building2 },
    { id: "billing", label: "Billing & Plan", icon: Package }, // Moved up as per user priority
    { id: "security", label: "Security & Account", icon: Shield },
    { id: "team", label: "Team & Roles", icon: Users },
  ];

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
                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
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

function SettingsContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "business";

  const renderContent = () => {
    switch (activeTab) {
      case "business": return <BusinessProfile />;
      case "billing": return <BillingSettings />;
      case "security": return <SecuritySettings />;
      case "team": return <TeamSettings />;
      default: return <BusinessProfile />;
    }
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Left Sub-nav */}
      <div className="col-span-12 lg:col-span-3">
        <div className="sticky top-24">
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