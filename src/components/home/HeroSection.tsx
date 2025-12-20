"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, MessageCircle, Bot } from "lucide-react";
import { LogoStrip } from "./LogoStrip";
import { motion, Variants } from "framer-motion";

const stats = [
  { value: "10,000+", label: "Active Sellers" },
  { value: "5M+", label: "Messages Automated" },
  { value: "3x", label: "Conversion Increase" },
  { value: "24/7", label: "Instant Replies" },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const floatingAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export function HeroSection() {
  const { data: session } = useSession();

  return (
    <section id="product" className="relative overflow-hidden pt-10">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5 animate-gradient" />

      {/* Floating Decorative Elements */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{
          rotate: -360,
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative w-full px-4 md:px-6 lg:px-8 py-20 lg:py-32"
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-glow-pulse backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">India's #1 WhatsApp AI Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight text-foreground"
          >
            Automate WhatsApp,
            <br />
            <span className="inline-block mt-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
              Scale Your Sales
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Empowering 10,000+ Indian sellers with AI that never sleeps. Automate inquiries, catalogs, and orders with personlized WhatsApp intelligence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-5 justify-center mb-16"
          >
            <Link href={session?.user ? "/dashboard" : "/register"}>
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(26, 115, 232, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary text-primary-foreground rounded-xl font-bold transition-all shadow-xl cursor-pointer text-lg group"
              >
                {session?.user ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Link>
            <Link href="/plans">
              <motion.div
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-background/50 backdrop-blur-md text-foreground border border-border rounded-xl font-bold transition-all shadow-md cursor-pointer text-lg"
              >
                View Pricing
              </motion.div>
            </Link>
          </motion.div>

          {/* Features Preview (Decorative) */}
          <motion.div
            variants={fadeInUp}
            className="relative max-w-5xl mx-auto"
          >
            <motion.div
              variants={floatingAnimation}
              initial="initial"
              animate="animate"
              className="glass-card p-4 rounded-2xl border-white/20 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src="/images/dashboard-preview.png"
                alt="WaveGroww Dashboard"
                className="rounded-xl border border-border shadow-inner w-full h-auto grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Overlay elements for "Interactive" look */}


            </motion.div>
          </motion.div>
        </div>

        {/* Dynamic Background Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-1/4 left-10"><Sparkles className="w-12 h-12" /></motion.div>
          <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-1/3 right-10"><MessageCircle className="w-16 h-16" /></motion.div>
          <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute bottom-1/4 left-1/4"><TrendingUp className="w-20 h-20" /></motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mt-24 border-t border-border/50 pt-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="text-center group"
            >
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-3 drop-shadow-sm group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-80">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <LogoStrip />
    </section>
  );
}