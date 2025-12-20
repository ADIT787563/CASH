"use client";

import { CheckCircle2, MessageCircle, Bot, TrendingUp } from "lucide-react";
import { motion, Variants } from "framer-motion";

const benefits = [
  "Never miss a customer message",
  "Save 10+ hours per week",
  "Increase conversions by 3x",
  "Manage everything in one dashboard",
  "Multi-language support (Hindi, English, etc.)",
  "100% Indian SaaS with local support",
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

const chatVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  },
};

export function BenefitsSection() {
  return (
    <section id="about" className="py-24 lg:py-36 relative overflow-hidden bg-background">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-32 pointer-events-none" />

      <div className="w-full px-4 md:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              <motion.h2
                variants={itemVariants}
                className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight"
              >
                Why Indian Sellers <span className="gradient-text">Trust Us</span>
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-xl text-muted-foreground mb-12 leading-relaxed"
              >
                We've built localized intelligence that understands your customers, your products, and the way India shops on WhatsApp.
              </motion.p>

              <motion.div
                variants={containerVariants}
                className="space-y-6"
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-primary group-hover:text-white transition-colors flex-shrink-0" />
                    </div>
                    <span className="text-lg font-medium text-foreground/90">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, rotate: 2 }}
              whileInView={{ opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Decorative Glow */}
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

              <div className="glass-card p-1 rounded-[2.5rem] border-white/20 shadow-2xl relative z-10">
                <div className="bg-card dark:bg-zinc-900 rounded-[2.2rem] p-8 md:p-10 space-y-8">
                  <div className="flex items-center justify-between border-b border-border pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white shadow-lg">W</div>
                      <div>
                        <p className="font-bold text-base">WaveGroww Business AI</p>
                        <p className="text-xs text-success flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Always Active</p>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="space-y-6"
                  >
                    <motion.div
                      variants={chatVariants}
                      className="flex items-start gap-4 p-5 bg-primary/5 rounded-[1.5rem] rounded-tl-none border border-primary/10"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">New Inquiry</div>
                        <div className="text-sm font-medium leading-relaxed">"Hi, is this Kurti available in Blue? Also, what's the price?"</div>
                        <div className="text-[10px] text-muted-foreground mt-2">10:45 AM</div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={chatVariants}
                      className="flex items-start gap-4 p-5 bg-accent/10 rounded-[1.5rem] rounded-tr-none border border-accent/10 ml-8"
                    >
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 order-2">
                        <Bot className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div className="flex-1 text-right order-1">
                        <div className="text-xs font-bold text-accent-foreground mb-1 uppercase tracking-wider">AI Assistant</div>
                        <div className="text-sm font-medium leading-relaxed">"Yes! It's in stock. The price is ₹1,499. Would you like to see the size chart?"</div>
                        <div className="text-[10px] text-muted-foreground mt-2">10:45 AM • Replied in 0.2s</div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={chatVariants}
                      className="flex items-center gap-4 p-5 bg-success/10 rounded-[1.5rem] border border-success/10"
                    >
                      <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-success-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-success mb-1">Success! 🎉</div>
                        <div className="text-sm font-medium">Order #8921 placed for ₹1,499</div>
                        <div className="w-full h-1 bg-success/20 mt-3 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            transition={{ duration: 1, delay: 1 }}
                            className="h-full bg-success"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
