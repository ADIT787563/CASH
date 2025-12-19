"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { LogoStrip } from "./LogoStrip";
import { motion } from "framer-motion";

const stats = [
  { value: "10,000+", label: "Active Sellers" },
  { value: "5M+", label: "Messages Automated" },
  { value: "3x", label: "Conversion Increase" },
  { value: "24/7", label: "Instant Replies" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

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

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative w-full px-4 md:px-6 lg:px-8 py-20 lg:py-32"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge with shimmer */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-glow-pulse"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">India's #1 WhatsApp AI Automation Platform</span>
          </motion.div>

          {/* Main Headline with animated gradient text */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          >
            Automate WhatsApp,
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-primary to-blue-800 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(26,115,232,0.3)] animate-gradient">
              Grow Your Business
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            AI-powered WhatsApp automation for Indian online sellers. Never miss a customer, convert more leads, and manage everything from one dashboard.
          </motion.p>

          {/* CTA Buttons with glow effects */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link href={session?.user ? "/dashboard" : "/register"}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl animate-glow-pulse cursor-pointer"
              >
                {session?.user ? "Go to Dashboard" : "Start 3-Day Trial"}
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Link>
            <Link href="/plans">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card text-foreground border border-border rounded-lg font-semibold hover:bg-muted transition-all cursor-pointer"
              >
                Pricing
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust Indicators with shimmer */}
          <motion.p
            variants={fadeInUp}
            className="text-sm text-muted-foreground"
          >
            3-day limited-feature trial • No credit card required • Made in India 🇮🇳
          </motion.p>
        </div>

        {/* Stats with staggered color pulse */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent animate-shimmer mb-2 drop-shadow-sm">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Logo Strip */}
      <LogoStrip />
    </section>
  );
}