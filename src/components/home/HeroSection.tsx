"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";

export function HeroSection() {
  const { data: session } = useSession();

  return (
    <section className="relative pt-40 pb-24 lg:pt-60 lg:pb-40 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[960px] h-[480px] bg-indigo-500/10 blur-[100px] rounded-full -z-10 opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

        {/* Trusted Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-zinc-200 shadow-sm">
            <span className="text-zinc-600 text-lg font-medium">✨ Trusted by 10,000+ Indian Sellers</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl lg:text-[5.5rem] font-bold tracking-tight mb-10 leading-tight text-zinc-900"
        >
          WhatsApp Automation
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 mt-3 pb-2">
            for Indian Businesses
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-zinc-600 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Never miss a sale again. Our AI chatbot replies to buyers 24/7, manages your catalog, and helps you close more deals — all on WhatsApp.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-24"
        >
          <Link href={session?.user ? "/dashboard" : "/register"}>
            <div className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-indigo-600 px-10 font-medium text-white transition-all duration-300 hover:bg-indigo-700 hover:w-64 w-60 text-lg shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300">
              <span className="mr-2 font-bold">Start Free Trial</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/product">
            <div className="inline-flex h-14 items-center justify-center rounded-full border border-zinc-200 bg-white px-10 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 text-lg hover:border-zinc-300">
              See How It Works
            </div>
          </Link>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto text-center border-t border-zinc-200 pt-16"
        >
          <div className="space-y-2">
            <h3 className="text-4xl font-bold text-zinc-900">10K+</h3>
            <p className="text-zinc-500 text-lg">Active Sellers</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-bold text-zinc-900">5M+</h3>
            <p className="text-zinc-500 text-lg">Messages Sent</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-bold text-zinc-900">300%</h3>
            <p className="text-zinc-500 text-lg">Avg. Sales Increase</p>
          </div>
        </motion.div>



      </div>
    </section>
  );
}