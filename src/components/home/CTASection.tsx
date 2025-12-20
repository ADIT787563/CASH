"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePricing } from "@/hooks/useConfig";
import { motion } from "framer-motion";

export function CTASection() {
  const { data: session } = useSession();
  const { data: plans } = usePricing();

  const minPrice = plans && plans.length > 0
    ? Math.min(...plans.filter(p => p.monthlyPrice > 0).map(p => p.monthlyPrice))
    : null;

  return (
    <section className="py-24 lg:py-40 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/4 w-[100%] h-[150%] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute -bottom-1/2 -right-1/4 w-[100%] h-[150%] bg-accent/20 rounded-full blur-[120px]"
        />
      </div>

      <div className="w-full px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-10 text-primary font-bold text-sm uppercase tracking-widest animate-glow-pulse"
          >
            Launch Today
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
            Ready to <span className="gradient-text">Automate & Grow?</span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Join thousands of successful Indian sellers using WaveGroww to convert every WhatsApp message into a growth opportunity.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
          >
            <Link href={session?.user ? "/dashboard" : "/register"}>
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(26, 115, 232, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-black transition-all shadow-2xl cursor-pointer text-xl group"
              >
                {session?.user ? "Go to Dashboard" : "Start 3-Day Free Trial"}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Link>
            <Link href="/plans">
              <motion.div
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.9)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-background/50 backdrop-blur-md text-foreground border-2 border-border rounded-2xl font-black transition-all shadow-lg cursor-pointer text-xl"
              >
                See Full Pricing
              </motion.div>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base text-muted-foreground/80 font-bold tracking-wide"
          >
            {minPrice ? `Scale starting at just ₹${minPrice}/month` : "Premium automation for every business size"} • Instant setup • No credit card required
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}