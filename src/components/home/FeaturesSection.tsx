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
import { motion } from "framer-motion";

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
    description: "Generate high-converting templates instantly with AI. Schedule broadcasts with personalization tokens to boost sales.",
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-36 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -skew-y-3 translate-y-24 pointer-events-none" />

      <div className="w-full px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Everything You Need to <span className="gradient-text">Dominate</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A comprehensive suite of AI-native tools engineered to automate your WhatsApp business and skyrocket conversions.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="glass-card p-8 rounded-3xl group transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-base text-muted-foreground/90 mb-6 leading-relaxed">{feature.description}</p>

                <Link
                  href={feature.href}
                  className="text-primary hover:text-primary/80 font-bold text-sm inline-flex items-center gap-2 group/link transition-all"
                >
                  Explore Feature <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <Link
            href="/plans"
            className="inline-flex items-center gap-3 px-10 py-5 bg-foreground text-background rounded-2xl font-bold hover:bg-foreground/90 transition-all shadow-xl hover:shadow-primary/20 hover:scale-105"
          >
            Explore Plan Features
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}