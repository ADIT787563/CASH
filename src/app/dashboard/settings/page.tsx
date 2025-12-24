"use client";

import { useState, useEffect } from "react";
import {
  User, Smartphone, CreditCard, Users, Save, Globe, Bot,
  Shield, Bell, History, FileText, Lock, DollarSign,
  Download, Trash2, ShieldCheck, Activity, MessageSquare, Clock, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

export default function SettingsPage() {
  const { user } = useAuth() as any;
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // State for form fields
  const [profileData, setProfileData] = useState({
    businessName: "",
    supportPhone: "",
    website: "",
    description: "",
    shortBio: "",
    instagram: "",
    facebook: "",
    address: "",
    email: "",
  });

  const [aiData, setAiData] = useState({
    tone: "Friendly",
    businessHoursOnly: false,
    businessContext: "",
    enabled: true,
    welcomeMessage: "",
    awayMessage: "",
    handoverRule: "manual",
    confidenceThreshold: 85,
    businessHoursConfig: {} as any,
    fallbackMode: "template",
    fallbackMessage: "",
  });

  const [paymentData, setPaymentData] = useState({
    upiId: "",
    merchantName: "",
    confirmationMode: "auto_confirm",
    partialPaymentAllowed: false,
    refundPolicy: "no_refunds",
    refundPolicyCustomText: "",
    codTemplate: "",
  });

  const [countData, setCountData] = useState({
    timezone: "Asia/Kolkata",
    language: "en",
    dataRetentionPeriod: 30,
  });

  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [notifPrefs, setNotifPrefs] = useState<any[]>([]);
  const [securityActivity, setSecurityActivity] = useState<any[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        // Fetch Business Settings
        const businessRes = await fetch("/api/business-settings");
        if (businessRes.ok) {
          const business = await businessRes.json();
          const socialLinks = business.socialLinks ? (typeof business.socialLinks === 'string' ? JSON.parse(business.socialLinks) : business.socialLinks) : {};
          setProfileData({
            businessName: business.businessName || "",
            supportPhone: business.whatsappNumber || "",
            website: business.storeUrl || "",
            description: business.businessDescription || "",
            shortBio: business.shortBio || "",
            instagram: socialLinks.instagram || "",
            facebook: socialLinks.facebook || "",
            address: business.address || "",
            email: business.businessEmail || "",
          });
          setPaymentData(prev => ({
            ...prev,
            upiId: business.upiId || "",
            merchantName: business.merchantName || "",
          }));
        }

        // Fetch Chatbot Settings
        const chatbotRes = await fetch("/api/chatbot-settings");
        if (chatbotRes.ok) {
          const chatbot = await chatbotRes.json();
          setAiData({
            tone: chatbot.tone || "Friendly",
            businessHoursOnly: chatbot.businessHoursOnly || false,
            businessContext: chatbot.businessContext || "",
            enabled: chatbot.enabled ?? true,
            welcomeMessage: chatbot.welcomeMessage || "",
            awayMessage: chatbot.awayMessage || "",
            handoverRule: chatbot.handoverRule || "manual",
            confidenceThreshold: chatbot.confidenceThreshold || 85,
            businessHoursConfig: chatbot.businessHoursConfig || {},
            fallbackMode: chatbot.fallbackMode || "template",
            fallbackMessage: chatbot.fallbackMessage || "",
          });
        }

        // Fetch Subscription & Invoices
        const subRes = await fetch("/api/billing/subscription");
        if (subRes.ok) setSubscription(await subRes.json());

        const invRes = await fetch("/api/billing/invoices");
        if (invRes.ok) setInvoices(await invRes.json());

        // Fetch Notification Prefs
        const notifRes = await fetch("/api/settings/notifications");
        if (notifRes.ok) setNotifPrefs(await notifRes.json());

        // Fetch Security Activity
        const secRes = await fetch("/api/settings/security/activity");
        if (secRes.ok) setSecurityActivity(await secRes.json());

        // Fetch Account Settings
        const accRes = await fetch("/api/settings/account");
        if (accRes.ok) setCountData(await accRes.json());

      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save Business Profile
      const businessPromise = fetch("/api/business-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: profileData.businessName,
          whatsappNumber: profileData.supportPhone,
          storeUrl: profileData.website,
          businessDescription: profileData.description,
          shortBio: profileData.shortBio,
          address: profileData.address,
          businessEmail: profileData.email,
          socialLinks: JSON.stringify({
            instagram: profileData.instagram,
            facebook: profileData.facebook,
          }),
          upiId: paymentData.upiId,
          merchantName: paymentData.merchantName,
        }),
      });

      // Save AI Settings
      const aiPromise = fetch("/api/chatbot-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone: aiData.tone,
          businessHoursOnly: aiData.businessHoursOnly,
          businessContext: aiData.businessContext,
          enabled: aiData.enabled,
          welcomeMessage: aiData.welcomeMessage,
          awayMessage: aiData.awayMessage,
          handoverRule: aiData.handoverRule,
          confidenceThreshold: aiData.confidenceThreshold,
          businessHoursConfig: aiData.businessHoursConfig,
          fallbackMode: aiData.fallbackMode,
          fallbackMessage: aiData.fallbackMessage,
        }),
      });

      // Save Account Settings
      const accountPromise = fetch("/api/settings/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timezone: countData.timezone,
          language: countData.language,
          dataRetentionPeriod: countData.dataRetentionPeriod,
        }),
      });

      await Promise.all([businessPromise, aiPromise, accountPromise]);
      toast.success("All settings saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save some settings");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (initialLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
      );
    }

    if (activeTab === "profile") {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-6">Account Details</h3>
            <div className="grid gap-6 max-w-xl">
              <div className="space-y-2">
                <Label className="text-zinc-900 font-medium">Full Name</Label>
                <Input
                  value={user?.name || ""}
                  disabled
                  className="bg-zinc-100 border-zinc-200 text-zinc-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-zinc-400 font-medium italic">Contact support to change your name.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-900 font-medium">Email Address</Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-zinc-100 border-zinc-200 text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-6 font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              Business Storefront
            </h3>
            <div className="grid gap-6 max-w-xl">
              <div className="space-y-2">
                <Label className="text-zinc-900 font-medium">Business Name</Label>
                <Input
                  value={profileData.businessName}
                  onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                  className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-900 font-medium">Support Phone</Label>
                <Input
                  value={profileData.supportPhone}
                  onChange={(e) => setProfileData({ ...profileData, supportPhone: e.target.value })}
                  className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-900 font-medium">Business / Support Email</Label>
                <Input
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="support@business.com"
                  className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-900 font-medium">Business Description</Label>
                <textarea
                  value={profileData.description}
                  onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                  placeholder="Tell your customers who you are..."
                  className="w-full h-24 bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm text-zinc-900 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-900 font-medium">Store Address</Label>
                <Input
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-900 font-medium">Instagram</Label>
                  <Input
                    value={profileData.instagram}
                    onChange={(e) => setProfileData({ ...profileData, instagram: e.target.value })}
                    placeholder="@handle"
                    className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-900 font-medium">Facebook</Label>
                  <Input
                    value={profileData.facebook}
                    onChange={(e) => setProfileData({ ...profileData, facebook: e.target.value })}
                    placeholder="Page link"
                    className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "billing") {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" /> Current Plan
              </h3>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-indigo-900 capitalize">{subscription?.planId || 'Starter'}</p>
                <p className="text-2xl font-bold text-indigo-900">₹{subscription?.amount ? subscription.amount / 100 : 0}<span className="text-sm font-normal text-indigo-600">/{subscription?.interval || 'mo'}</span></p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs text-emerald-700 font-medium">Active until {new Date(subscription?.currentPeriodEnd || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
              <Button className="w-full bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 shadow-none">Manage Subscription</Button>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">Usage This Month</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">AI Messages</span>
                    <span className="font-medium text-zinc-900">{subscription?.usage?.messages || 0}/{subscription?.usage?.messagesLimit || 100}</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, ((subscription?.usage?.messages || 0) / (subscription?.usage?.messagesLimit || 100)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Orders Processed</span>
                    <span className="font-medium text-zinc-900">{subscription?.usage?.orders || 0}/{subscription?.usage?.ordersLimit || 10}</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, ((subscription?.usage?.orders || 0) / (subscription?.usage?.ordersLimit || 10)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Invoice History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 pb-4">
                    <th className="font-semibold text-zinc-500 py-3">Date</th>
                    <th className="font-semibold text-zinc-500 py-3">Amount</th>
                    <th className="font-semibold text-zinc-500 py-3">Status</th>
                    <th className="text-right py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-4 text-zinc-900">{new Date(inv.date).toLocaleDateString()}</td>
                      <td className="py-4 text-zinc-900">₹{inv.amount}</td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-md border border-emerald-100">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                          <Download className="w-4 h-4 mr-2" /> PDF
                        </Button>
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

    if (activeTab === "notifications") {
      const toggleNotif = async (type: string, channel: string, current: boolean) => {
        try {
          const res = await fetch("/api/settings/notifications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, channel, enabled: !current }),
          });
          if (res.ok) {
            setNotifPrefs(prev => {
              const idx = prev.findIndex(p => p.type === type && p.channel === channel);
              if (idx > -1) {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], enabled: !current };
                return updated;
              }
              return [...prev, { type, channel, enabled: !current }];
            });
            toast.success("Preference updated");
          }
        } catch (e) {
          toast.error("Failed to update preference");
        }
      };

      const isEnabled = (type: string, channel: string) => {
        const pref = notifPrefs.find(p => p.type === type && p.channel === channel);
        return pref ? pref.enabled : true; // Default to true
      };

      const sections = [
        { id: 'orders', title: 'Order Updates', desc: 'Get notified when a new order is received or updated.', types: ['new_order', 'order_status'] },
        { id: 'payments', title: 'Payment Alerts', desc: 'Notifications about successful or failed payments.', types: ['payment_received', 'payment_failed'] },
        { id: 'system', title: 'System & Security', desc: 'Important alerts about your account and AI agent.', types: ['ai_failure', 'low_credits', 'security_alert'] },
      ];

      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          {sections.map(section => (
            <div key={section.id} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900 mb-1">{section.title}</h3>
              <p className="text-sm text-zinc-500 mb-6">{section.desc}</p>

              <div className="space-y-4">
                {section.types.map(type => (
                  <div key={type} className="flex items-center justify-between py-3 border-t border-zinc-50 first:border-t-0">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 capitalize">{type.replace('_', ' ')}</p>
                      <div className="flex gap-4 mt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled(type, 'whatsapp')}
                            onChange={() => toggleNotif(type, 'whatsapp', isEnabled(type, 'whatsapp'))}
                            className="w-3.5 h-3.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-[10px] text-zinc-500 font-medium uppercase">WhatsApp</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled(type, 'email')}
                            onChange={() => toggleNotif(type, 'email', isEnabled(type, 'email'))}
                            className="w-3.5 h-3.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-[10px] text-zinc-500 font-medium uppercase">Email</span>
                        </label>
                      </div>
                    </div>
                    <Switch checked={isEnabled(type, 'in_app')} onCheckedChange={() => toggleNotif(type, 'in_app', isEnabled(type, 'in_app'))} className="data-[state=checked]:bg-indigo-600" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "security") {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" /> Password & Security
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-10 h-10 text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">Two-Factor Authentication</h4>
                    <p className="text-xs text-zinc-500">Protect your account with an extra layer of security.</p>
                  </div>
                </div>
                <Button variant="outline" className="border-zinc-200 text-zinc-600">Enable 2FA</Button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="••••••••" className="max-w-xs" />
                </div>
                <Button variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50/50">Change Password</Button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {securityActivity.map((act) => (
                <div key={act.id} className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{act.device || 'Unknown Device'} • {act.browser || 'Browser'}</p>
                      <p className="text-xs text-zinc-500">{act.location || 'Unknown Location'} • {act.ipAddress || '0.0.0.0'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">{new Date(act.timestamp).toLocaleString()}</p>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-zinc-500 hover:text-red-600 text-xs">Logout From All Devices</Button>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "privacy") {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" /> Data Retention
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Order Data Retention Period (Days)</Label>
                <div className="flex items-center gap-4 max-w-xs">
                  <Input
                    type="number"
                    value={countData.dataRetentionPeriod}
                    onChange={(e) => setCountData({ ...countData, dataRetentionPeriod: parseInt(e.target.value) })}
                    className="bg-zinc-50"
                  />
                  <span className="text-sm text-zinc-500 whitespace-nowrap">Days</span>
                </div>
                <p className="text-xs text-zinc-500">How long we store order and customer details before automatic deletion.</p>
              </div>

              <div className="space-y-3">
                <Label>Preferred Language</Label>
                <select
                  title="Preferred Language"
                  className="w-full max-w-xs h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm"
                  value={countData.language}
                  onChange={(e) => setCountData({ ...countData, language: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Export Your Data
            </h3>
            <p className="text-sm text-zinc-500 mb-6">Download a complete copy of your business data including products, orders, and customer records in JSON format.</p>
            <Button variant="outline" className="border-zinc-200 hover:bg-zinc-50">
              <Download className="w-4 h-4 mr-2" /> Request Data Export
            </Button>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-6 shadow-sm mt-12">
            <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" /> Delete My Account
            </Button>
          </div>
        </div>
      );
    }

    if (activeTab === "whatsapp") {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                <Smartphone className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">WhatsApp Connected</h3>
                <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Online • {profileData.supportPhone || "+91 98765 43210"}
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900">Test Connection</Button>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" /> Connection Diagnostics
            </h3>

            <div className="space-y-4">
              {[
                { label: 'Cloud API Status', status: 'Healthy', color: 'text-emerald-600' },
                { label: 'Webhook Endpoint', status: 'Verified', color: 'text-emerald-600' },
                { label: 'Business Profile', status: 'Synced', color: 'text-emerald-600' },
                { label: 'Media Provider', status: 'Connected', color: 'text-emerald-600' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-b-0">
                  <span className="text-sm font-medium text-zinc-600">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase ${item.color}`}>{item.status}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
              <h4 className="text-xs font-bold text-zinc-900 mb-2 uppercase">Diagnostic Logs</h4>
              <div className="font-mono text-[10px] text-zinc-500 space-y-1">
                <p>[{new Date().toLocaleTimeString()}] Checking Meta Business Suite connection...</p>
                <p>[{new Date().toLocaleTimeString()}] Handshake successful (200 OK)</p>
                <p>[{new Date().toLocaleTimeString()}] Webhook latency: 142ms</p>
                <p>[{new Date().toLocaleTimeString()}] Diagnostic complete. System stable.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "payments") {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" /> Payment Methods
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-base font-bold text-zinc-900">UPI Settings</Label>
                <div className="space-y-2">
                  <Label className="text-zinc-600">Default UPI ID</Label>
                  <Input
                    value={paymentData.upiId}
                    onChange={(e) => setPaymentData({ ...paymentData, upiId: e.target.value })}
                    placeholder="merchant@upi"
                    className="bg-zinc-50 border-zinc-200 text-zinc-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-600">Merchant Name</Label>
                  <Input
                    value={paymentData.merchantName}
                    onChange={(e) => setPaymentData({ ...paymentData, merchantName: e.target.value })}
                    placeholder="My Business Name"
                    className="bg-zinc-50 border-zinc-200 text-zinc-900"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-bold text-zinc-900">COD Settings</Label>
                <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                  <div>
                    <Label className="text-zinc-900 font-medium">Auto-Confirmation</Label>
                    <p className="text-[10px] text-zinc-500">Automatically confirm COD orders</p>
                  </div>
                  <Switch
                    checked={paymentData.confirmationMode === 'auto_confirm'}
                    onCheckedChange={(checked) => setPaymentData({ ...paymentData, confirmationMode: checked ? 'auto_confirm' : 'manual_approval' })}
                    className="data-[state=checked]:bg-indigo-600 scale-75"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-600">COD Confirmation Template</Label>
                  <textarea
                    value={paymentData.codTemplate}
                    onChange={(e) => setPaymentData({ ...paymentData, codTemplate: e.target.value })}
                    placeholder="Hello! Please confirm your order for {{amount}}..."
                    className="w-full h-20 text-xs bg-zinc-50 border border-zinc-200 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Advanced Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-zinc-900 font-medium">Partial Payments</Label>
                    <p className="text-xs text-zinc-500">Allow customers to pay a token amount first</p>
                  </div>
                  <Switch
                    checked={paymentData.partialPaymentAllowed}
                    onCheckedChange={(checked) => setPaymentData({ ...paymentData, partialPaymentAllowed: checked })}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>

                <div className="space-y-2 pt-4 border-t border-zinc-50">
                  <Label className="text-zinc-900 font-medium">Refund Policy</Label>
                  <select
                    title="Refund Policy"
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm"
                    value={paymentData.refundPolicy}
                    onChange={(e) => setPaymentData({ ...paymentData, refundPolicy: e.target.value })}
                  >
                    <option value="no_refunds">No Refunds</option>
                    <option value="7_days">7 Days Replacement</option>
                    <option value="custom">Custom Policy</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {paymentData.refundPolicy === 'custom' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-zinc-900 font-medium">Custom Policy Text</Label>
                    <textarea
                      value={paymentData.refundPolicyCustomText}
                      onChange={(e) => setPaymentData({ ...paymentData, refundPolicyCustomText: e.target.value })}
                      placeholder="Type your policy here..."
                      className="w-full h-32 bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "team") {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">Team Management</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-xs mx-auto">Invite staff members to help manage your orders, chat with customers, and update catalogs.</p>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">Invite Member</Button>
          </div>
        </div>
      );
    }

    if (activeTab === "ai") {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                  <Bot className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">AI Agent Settings</h3>
                  <p className="text-sm text-zinc-500">Configure how the AI interacts with customers.</p>
                </div>
              </div>
              <Switch
                checked={aiData.enabled}
                onCheckedChange={(checked) => setAiData({ ...aiData, enabled: checked })}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-zinc-900 font-medium">Bot Personality / Tone</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['professional', 'friendly', 'offer'].map((tone) => (
                    <div
                      key={tone}
                      onClick={() => setAiData({ ...aiData, tone })}
                      className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${aiData.tone === tone
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500"
                        : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                        }`}
                    >
                      <p className="text-sm font-medium capitalize">{tone}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-900 font-medium">Business Hours Only</Label>
                  <Switch
                    checked={aiData.businessHoursOnly}
                    onCheckedChange={(checked) => setAiData({ ...aiData, businessHoursOnly: checked })}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
                <p className="text-xs text-zinc-500">If enabled, AI will only reply during the hours specified in your profile.</p>
              </div>

              <div className="space-y-3">
                <Label className="text-zinc-900 font-medium">Business Context</Label>
                <Textarea
                  value={aiData.businessContext}
                  onChange={(e) => setAiData({ ...aiData, businessContext: e.target.value })}
                  placeholder="Describe your business, return policy, or key selling points..."
                  className="min-h-[120px] bg-zinc-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                <div className="space-y-3">
                  <Label className="text-zinc-900 font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500" /> Welcome Message
                  </Label>
                  <Textarea
                    value={aiData.welcomeMessage}
                    onChange={(e) => setAiData({ ...aiData, welcomeMessage: e.target.value })}
                    placeholder="Hello! Welcome to our store..."
                    className="min-h-[100px] bg-zinc-50"
                  />
                  <p className="text-xs text-zinc-500 italic">Sent when a new customer starts a chat.</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-zinc-900 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" /> Away Message
                  </Label>
                  <Textarea
                    value={aiData.awayMessage}
                    onChange={(e) => setAiData({ ...aiData, awayMessage: e.target.value })}
                    placeholder="We're currently closed, but we'll get back to you soon!"
                    className="min-h-[100px] bg-zinc-50"
                  />
                  <p className="text-xs text-zinc-500 italic">Sent outside business hours.</p>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
                  <Zap className="w-4 h-4 text-amber-500" /> Automation Rules
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-900 font-medium">AI Confidence Threshold</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[aiData.confidenceThreshold]}
                          onValueChange={(val) => setAiData({ ...aiData, confidenceThreshold: val[0] })}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm font-bold text-indigo-600 w-8">{aiData.confidenceThreshold}%</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">AI only replies if it's this confident. Below this, it triggers fallback.</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-900 font-medium">Human Handover Policy</Label>
                      <Select
                        value={aiData.handoverRule}
                        onValueChange={(val) => setAiData({ ...aiData, handoverRule: val })}
                      >
                        <SelectTrigger className="bg-zinc-50">
                          <SelectValue placeholder="Select rule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual Transfer only</SelectItem>
                          <SelectItem value="always">Always notify human</SelectItem>
                          <SelectItem value="failure">On 3 AI failures</SelectItem>
                          <SelectItem value="urgent">On 'urgent' keywords</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-900 font-medium">Auto-Fallback Mode</Label>
                      <Select
                        value={aiData.fallbackMode}
                        onValueChange={(val) => setAiData({ ...aiData, fallbackMode: val })}
                      >
                        <SelectTrigger className="bg-zinc-50">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="template">Static Message</SelectItem>
                          <SelectItem value="human">Transfer to Human</SelectItem>
                          <SelectItem value="hybrid">Message + Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {aiData.fallbackMode !== 'human' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-zinc-900 font-medium">Fallback Content</Label>
                        <Input
                          value={aiData.fallbackMessage}
                          onChange={(e) => setAiData({ ...aiData, fallbackMessage: e.target.value })}
                          placeholder="I'm sorry, I didn't quite catch that..."
                          className="bg-zinc-50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
                    <Clock className="w-4 h-4 text-indigo-500" /> Business Operating Hours
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">AI Active Hours only</span>
                    <Switch
                      checked={aiData.businessHoursOnly}
                      onCheckedChange={(checked) => setAiData({ ...aiData, businessHoursOnly: checked })}
                      className="data-[state=checked]:bg-indigo-600 scale-75"
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const config = aiData.businessHoursConfig[day] || { enabled: true, start: "09:00", end: "18:00" };
                    return (
                      <div key={day} className="flex flex-wrap items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg group hover:border-indigo-200 transition-colors">
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <Switch
                            checked={config.enabled}
                            onCheckedChange={(checked) => {
                              setAiData({
                                ...aiData,
                                businessHoursConfig: {
                                  ...aiData.businessHoursConfig,
                                  [day]: { ...config, enabled: checked }
                                }
                              });
                            }}
                            className="data-[state=checked]:bg-emerald-500 scale-75"
                          />
                          <span className={`text-sm font-medium ${config.enabled ? 'text-zinc-900' : 'text-zinc-400'}`}>{day}</span>
                        </div>

                        {config.enabled ? (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                            <input
                              type="time"
                              title={`${day} start time`}
                              aria-label={`${day} start time`}
                              value={config.start}
                              onChange={(e) => {
                                setAiData({
                                  ...aiData,
                                  businessHoursConfig: {
                                    ...aiData.businessHoursConfig,
                                    [day]: { ...config, start: e.target.value }
                                  }
                                });
                              }}
                              className="bg-white border border-zinc-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-zinc-900"
                            />
                            <span className="text-zinc-400 text-xs">to</span>
                            <input
                              type="time"
                              title={`${day} end time`}
                              aria-label={`${day} end time`}
                              value={config.end}
                              onChange={(e) => {
                                setAiData({
                                  ...aiData,
                                  businessHoursConfig: {
                                    ...aiData.businessHoursConfig,
                                    [day]: { ...config, end: e.target.value }
                                  }
                                });
                              }}
                              className="bg-white border border-zinc-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-zinc-900"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 font-medium italic">Closed All Day</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-zinc-500 bg-zinc-50 p-3 rounded-lg border border-dashed border-zinc-200">
                  <strong>Note:</strong> When "AI Active Hours only" is enabled, your AI Agent will only respond during these windows. Outside these hours, the <strong>Away Message</strong> will be sent.
                </p>
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
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your business profile and preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          {initialLoading && <span className="text-xs text-zinc-400">Syncing...</span>}
          <Button onClick={handleSave} disabled={loading} className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
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
            { id: 'billing', label: 'Billing & Plans', icon: DollarSign },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'privacy', label: 'Privacy & Data', icon: Lock },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-indigo-600' : 'text-zinc-400'}`} />
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