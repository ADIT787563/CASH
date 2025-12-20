"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function HeroSection() {
  const { data: session } = useSession();

  return (
    <section className="relative pt-24 pb-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">

          {/* LEFT COLUMN: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 text-left"
          >
            {/* Label */}
            <span className="inline-block py-1 px-3 rounded-md bg-gray-100 text-gray-800 text-xs font-semibold tracking-wide uppercase mb-6">
              WhatsApp Automation for Businesses
            </span>

            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
              Automate WhatsApp conversations
              <span className="block text-indigo-600 mt-1">with control — not chaos</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl">
              WaveGroww helps businesses reply, sell, and manage orders on WhatsApp using AI,
              with templates and rules that keep every conversation accurate and controlled.
            </p>

            {/* Key Value Bullets */}
            <ul className="space-y-4 mb-10">
              {[
                "24/7 AI automation with strict business rules",
                "Templates to ensure accurate pricing, payments, and policies",
                "Central dashboard to manage leads, orders, and conversations"
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href={session?.user ? "/dashboard" : "/register"}>
                <div className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 w-full sm:w-auto text-center cursor-pointer shadow-sm hover:shadow-md">
                  Start free trial
                </div>
              </Link>
              <Link href="/demo">
                <div className="inline-flex justify-center items-center px-8 py-3.5 border border-gray-200 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 w-full sm:w-auto text-center cursor-pointer">
                  View demo
                </div>
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="border-t border-gray-100 pt-8 mt-8">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4">
                Trusted by growing businesses across India
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 font-medium items-center">
                <span>10,000+ Active Sellers</span>
                <span className="text-gray-300 h-1 w-1 rounded-full bg-gray-300"></span>
                <span>5M+ Messages Automated</span>
                <span className="text-gray-300 h-1 w-1 rounded-full bg-gray-300"></span>
                <span>3× Conversion Increase</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Product Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 mt-16 lg:mt-0 relative"
          >
            {/* Browser Window Frame */}
            <div className="relative rounded-xl bg-white ring-1 ring-gray-900/5 shadow-2xl overflow-hidden">
              {/* Window Controls */}
              <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-4 space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
              </div>
              {/* Image Container */}
              <div className="relative aspect-[16/10] bg-gray-50 group">
                <img
                  src="/images/dashboard-preview.png"
                  alt="WaveGroww AI Automation Dashboard"
                  className="w-full h-full object-cover object-top transform transition-transform duration-[20000ms] ease-linear group-hover:translate-y-[-10%]"
                />
                {/* Overlay Gradient (Subtle) */}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-b-xl pointer-events-none"></div>
              </div>
            </div>

            {/* Decor Elements behind (Very subtle) */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-50 to-blue-50 rounded-2xl -z-10 blur-xl opacity-50"></div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}