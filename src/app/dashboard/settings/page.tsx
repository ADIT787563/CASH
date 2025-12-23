"use client";

import { useState } from "react";
import { User, Smartphone, CreditCard, Users, Save, Globe, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

export default function SettingsPage() {
  const { user } = useAuth() as any;
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Settings saved successfully!");
    }, 1000);
  };

  const renderContent = () => {
    if (activeTab === "profile") {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid gap-4 max-w-xl">
            <div className="space-y-2">
              <Label className="text-white">Business Name</Label>
              <Input defaultValue="Fashion Store" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Support Phone</Label>
              <Input defaultValue="+91 98765 43210" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Website / Store Link</Label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-white/5 border border-white/10 rounded-md text-white/50 text-sm">https://</span>
                <Input defaultValue="wavegroww.store/fashion-store" className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "whatsapp") {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">WhatsApp Connected</h3>
                <p className="text-sm text-emerald-400">Online • +91 98765 43210</p>
              </div>
            </div>
            <Button variant="outline" className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">Test Connection</Button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Messaging Settings</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-medium">Read Receipts</p>
                <p className="text-xs text-white/50">Show blue ticks when you read messages</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Business Profile</p>
                <p className="text-xs text-white/50">Sync profile photo from WhatsApp</p>
              </div>
              <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">Sync Now</Button>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "payments") {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" /> UPI Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Default UPI ID</Label>
                <Input placeholder="merchant@upi" className="bg-white/5 border-white/10 text-white" />
                <p className="text-xs text-white/40">Used for generating Payment Links</p>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Merchant Name</Label>
                <Input placeholder="My Business Name" className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "team") {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6 text-center">
            <Users className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">Team Management</h3>
            <p className="text-sm text-white/50 mb-4">Invite staff to manage orders and chat.</p>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Invite Member</Button>
          </div>
        </div>
      );
    }

    if (activeTab === "ai") {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Bot className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Agent Settings</h3>
                  <p className="text-sm text-white/50">Configure how the AI interacts with customers.</p>
                </div>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-indigo-500" />
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-white">Bot Personality / Tone</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['Professional', 'Friendly', 'Enthusiastic'].map((tone) => (
                    <div key={tone} className="cursor-pointer border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all">
                      <p className="text-sm font-medium text-white">{tone}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Business Hours Only</Label>
                  <Switch className="data-[state=checked]:bg-indigo-500" />
                </div>
                <p className="text-xs text-white/40">If enabled, AI will only reply during the hours specified in your profile.</p>
              </div>

              <div className="space-y-3">
                <Label className="text-white">Business Context</Label>
                <textarea
                  className="w-full h-24 bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white resize-none focus:outline-none focus:border-indigo-500/50"
                  placeholder="Describe your business, return policy, or key selling points..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-sm text-white/50 mt-1">Manage your business profile and preferences.</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-white text-black hover:bg-white/90">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-1">
          {[
            { id: 'profile', label: 'Business Profile', icon: User },
            { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
            { id: 'ai', label: 'AI Agent', icon: Bot },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'team', label: 'Team', icon: Users },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 min-h-[500px]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Add these imports at top if missing: import { Bot } from "lucide-react";