"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { LogoStrip } from "./LogoStrip";

const stats = [
  { value: "10,000+", label: "Active Sellers" },
  { value: "5M+", label: "Messages Automated" },
  { value: "3x", label: "Conversion Increase" },
  { value: "24/7", label: "Instant Replies" },
];

export function HeroSection() {
  const { data: session, isPending } = useSession();
  const router = useRouter();



  return (
    <section id="product" className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 animate-gradient" />

      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-gradient-rotate" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-gradient-rotate" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-color-pulse" />

      <div className="relative w-full px-4 md:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge with shimmer */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-glow-pulse">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">India's #1 WhatsApp AI Automation Platform</span>
          </div>

          {/* Main Headline with animated gradient text */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Automate WhatsApp,
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient">
              Grow Your Business
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            AI-powered WhatsApp automation for Indian online sellers. Never miss a customer, convert more leads, and manage everything from one dashboard.
          </p>

          {/* CTA Buttons with glow effects */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href={session?.user ? "/dashboard" : "/register"}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg hover:shadow-xl animate-glow-pulse"
            >
              {session?.user ? "Go to Dashboard" : "Start 3-Day Trial"}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/plans"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card text-foreground border border-border rounded-lg font-semibold hover:bg-muted transition-all hover:scale-105"
            >
              Pricing
            </Link>
          </div>

          {/* Trust Indicators with shimmer */}
          <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
            3-day limited-feature trial • No credit card required • Made in India 🇮🇳
          </p>
        </div>

        {/* Stats with staggered color pulse */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-shimmer mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Logo Strip */}
      <LogoStrip />
    </section>
  );
}