"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Bot,
  Settings,
  MessageCircle,
  Languages,
  Clock,
  Zap,
  Save,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/home/Footer";

export default function ChatbotPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [chatbotSettings, setChatbotSettings] = useState({
    enabled: true,
    autoReply: true,
    language: "en",
    tone: "professional",
    typingDelay: 2,
    businessHours: true,
    startTime: "09:00",
    endTime: "18:00",
    welcomeMessage: "Hello! 👋 Welcome to our store. How can I help you today?",
    awayMessage: "Thanks for your message! We're currently away but will get back to you soon.",
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchChatbotSettings();
    }
  }, [session]);

  const fetchChatbotSettings = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/chatbot-settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        const settings = data.data[0];
        setChatbotSettings({
          enabled: settings.enabled,
          autoReply: settings.autoReply,
          language: settings.language,
          tone: settings.tone,
          typingDelay: settings.typingDelay,
          businessHours: settings.businessHours,
          startTime: settings.startTime,
          endTime: settings.endTime,
          welcomeMessage: settings.welcomeMessage,
          awayMessage: settings.awayMessage,
        });
      }
    } catch (error) {
      console.error("Error fetching chatbot settings:", error);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("bearer_token");

      const res = await fetch("/api/chatbot-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(chatbotSettings),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Chatbot settings saved successfully!");
      } else {
        toast.error(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving chatbot settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            <span className="gradient-text">AI WhatsApp Chatbot</span>
          </h1>
          <p className="text-muted-foreground">
            Configure your AI chatbot to automatically respond to customer inquiries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Chatbot Status
                </h2>
                <button
                  onClick={() =>
                    setChatbotSettings({ ...chatbotSettings, enabled: !chatbotSettings.enabled })
                  }
                  className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${chatbotSettings.enabled
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                    }`}
                >
                  {chatbotSettings.enabled ? (
                    <>
                      <Play className="w-4 h-4" />
                      Active
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" />
                      Paused
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Auto Reply</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically respond to messages
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chatbotSettings.autoReply}
                      onChange={(e) =>
                        setChatbotSettings({ ...chatbotSettings, autoReply: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-accent" />
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-sm text-muted-foreground">
                        Only reply during business hours
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chatbotSettings.businessHours}
                      onChange={(e) =>
                        setChatbotSettings({ ...chatbotSettings, businessHours: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                Configuration
              </h2>

              <div className="space-y-6">
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Primary Language
                  </label>
                  <select
                    value={chatbotSettings.language}
                    onChange={(e) =>
                      setChatbotSettings({ ...chatbotSettings, language: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="bn">Bengali (বাংলা)</option>
                    <option value="mr">Marathi (मराठी)</option>
                    <option value="gu">Gujarati (ગુજરાતી)</option>
                  </select>
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-medium mb-2">Chatbot Tone</label>
                  <select
                    value={chatbotSettings.tone}
                    onChange={(e) =>
                      setChatbotSettings({ ...chatbotSettings, tone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>

                {/* Typing Delay */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Typing Delay (seconds): {chatbotSettings.typingDelay}s
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={chatbotSettings.typingDelay}
                    onChange={(e) =>
                      setChatbotSettings({
                        ...chatbotSettings,
                        typingDelay: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Simulate human-like typing delay before sending messages
                  </p>
                </div>

                {/* Business Hours */}
                {chatbotSettings.businessHours && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Time</label>
                      <input
                        type="time"
                        value={chatbotSettings.startTime}
                        onChange={(e) =>
                          setChatbotSettings({ ...chatbotSettings, startTime: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Time</label>
                      <input
                        type="time"
                        value={chatbotSettings.endTime}
                        onChange={(e) =>
                          setChatbotSettings({ ...chatbotSettings, endTime: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Welcome Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">Welcome Message</label>
                  <textarea
                    value={chatbotSettings.welcomeMessage}
                    onChange={(e) =>
                      setChatbotSettings({ ...chatbotSettings, welcomeMessage: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Enter your welcome message..."
                  />
                </div>

                {/* Away Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">Away Message</label>
                  <textarea
                    value={chatbotSettings.awayMessage}
                    onChange={(e) =>
                      setChatbotSettings({ ...chatbotSettings, awayMessage: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Enter your away message..."
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-6">Preview</h2>

            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Customer Message</p>
                <div className="bg-card p-3 rounded-lg border border-border">
                  <p className="text-sm">Hi, what are your prices?</p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">AI Reply</p>
                <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                  <p className="text-sm">{chatbotSettings.welcomeMessage}</p>
                </div>
              </div>

              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  Settings Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">
                      {chatbotSettings.enabled ? "Active" : "Paused"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span className="font-medium">{chatbotSettings.language.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tone:</span>
                    <span className="font-medium capitalize">{chatbotSettings.tone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auto Reply:</span>
                    <span className="font-medium">
                      {chatbotSettings.autoReply ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}