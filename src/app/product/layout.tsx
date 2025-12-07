import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WaveGroww — WhatsApp Automation for Indian Sellers | Auto Catalog, AI Chatbot, CRM",
  description: "WaveGroww automates WhatsApp sales for Indian sellers — AI chat, auto-generated catalogs, leads CRM, and analytics. 3-day limited-feature trial. Plans from ₹999 to ₹8,999/month.",
  keywords: [
    "WhatsApp automation",
    "Indian sellers",
    "WhatsApp chatbot",
    "auto catalog",
    "CRM for sellers",
    "WhatsApp business",
    "Meesho automation",
    "Shopify WhatsApp",
    "lead generation",
    "sales automation India"
  ],
  openGraph: {
    title: "WaveGroww — WhatsApp Automation for Indian Sellers",
    description: "Automate conversations, capture leads, and sell more — 24/7. Built for Meesho, Shopify, and small local shops.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "WaveGroww — WhatsApp Automation for Indian Sellers",
    description: "WaveGroww automates WhatsApp sales for Indian sellers — AI chat, auto-generated catalogs, leads CRM, and analytics.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
