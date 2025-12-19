"use client";

import Link from "next/link";
import {
  Bot,
  Package,
  Users,
  FileText,
  Send,
  BarChart3,
  Settings,
  Zap,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI WhatsApp Chatbot",
    description: "Instant auto-replies for product inquiries, prices, stock, and delivery. Multi-language support with human-like conversations.",
    href: "/chatbot",
  },
  {
    icon: Package,
    title: "Auto Catalog Maker",
    description: "Upload CSV or images and let AI generate beautiful product cards. Shareable catalog links with WhatsApp preview.",
    href: "/catalog",
  },
  {
    icon: Users,
    title: "Lead Collector + CRM",
    description: "Automatically save buyer details, track chat history, segment leads, and export to sheets for better follow-up.",
    href: "/leads",
  },
  {
    icon: FileText,
    title: "AI Templates & Campaigns",
    description: "Pre-made message templates for offers, arrivals, and restocks. Schedule broadcasts with personalization tokens.",
    href: "/templates",
  },
  {
    icon: Send,
    title: "Auto Detail Sharing",
    description: "Detect when buyers share numbers and automatically send catalogs, store links, and product details instantly.",
    href: "/chatbot",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track daily chats, message success rates, product clicks, lead sources, and growth with detailed charts.",
    href: "/analytics",
  },
  {
    icon: Settings,
    title: "Complete Settings",
    description: "Configure business info, chatbot behavior, integrations, automation flows, and security - all in one place.",
    href: "/settings",
  },
  {
    icon: Zap,
    title: "Advanced AI (Pro)",
    description: "AI training panel, buyer intent analysis, auto-upsell suggestions, voice-to-text, and premium analytics.",
    href: "/plans",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="gradient-text">Grow</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed specifically for Indian online sellers to automate WhatsApp and increase sales.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                <Link
                  href={feature.href}
                  className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
          >
            Compare Plans & Features
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}