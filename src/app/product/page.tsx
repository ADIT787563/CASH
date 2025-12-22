"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Footer } from "@/components/home/Footer";
import { PricingSection } from "@/components/home/PricingSection";
import {
  Bot,
  Package,
  Users,
  BarChart3,
  Check,
  Play,
  ChevronDown,
  MessageSquare,
  Sparkles,
  Shield,
  Zap,
  Clock,
  Globe,
  CreditCard,
  Database,
  Lock,
  ArrowRight,
  Store,
  Building,
  Briefcase,
  Star,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePricing } from "@/hooks/useConfig";

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

// Analytics helper
const trackEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: eventName,
      ...data,
    });
  }
};

export default function ProductPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  /* const { data: plansFromDB, isLoading: isPricingLoading } = usePricing(); */
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);



  useEffect(() => {
    // Track page view
    trackEvent("product.page_view");

    // Sticky bar on scroll
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 800);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCTAClick = (cta: string) => {
    trackEvent("product.cta_click", { cta });

    if (cta === "start_free_trial") {
      if (!isPending && session?.user) {
        router.push("/dashboard");
      } else {
        router.push("/register");
      }
    } else if (cta === "view_plans") {
      router.push("/plans");
    } else if (cta === "contact_sales") {
      // Handle contact sales
      window.location.href = "mailto:WaveGroww@gmail.com";
    }
  };

  const handleDemoPlay = () => {
    trackEvent("product.demo_play");
    setDemoModalOpen(true);
  };



  const features = [
    {
      icon: Bot,
      title: "AI Chatbot",
      description: "Auto-replies, multilingual, product-aware.",
      link: "#chatbot",
    },
    {
      icon: Package,
      title: "Auto Catalog Maker",
      description: "Upload CSV/images → ready-to-share cards.",
      link: "#catalog",
    },
    {
      icon: Users,
      title: "Leads & CRM",
      description: "Auto-collect buyers, filter, export.",
      link: "#crm",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Visual charts, exportable reports, real-time counters.",
      link: "#analytics",
    },
  ];

  const deepFeatures = [
    {
      title: "Auto Catalog Maker",
      description:
        "Instantly converts product lists into beautiful WhatsApp-ready cards with images, prices, and share links. One-click update when stock changes.",
    },
    {
      title: "Smart WhatsApp Chatbot",
      description:
        "Context-aware replies to product and order queries, multilingual, and customizable tone. Handles FAQs, price requests, delivery checks, and upsells.",
    },
    {
      title: "Leads & CRM",
      description:
        "Every chat becomes a lead (name, number, last message). Filter by intent, export CSV/Sheets, broadcast targeted campaigns.",
    },
    {
      title: "AI Templates & Campaigns",
      description:
        "Pre-built message templates, personalization tokens, scheduling, and campaign analytics to improve repeat purchases.",
    },
    {
      title: "Analytics & Insights",
      description:
        "Profile views, catalog views, most-viewed products, daily revenue — built-in charts, exports, and scheduled reports.",
    },
    {
      title: "Integrations & Security",
      description:
        "Razorpay/UPI integration, Google Sheets export, Supabase sync. Bank & KYC-ready, 2FA, HTTPS, encrypted data-at-rest.",
    },
  ];

  const useCases = [
    {
      icon: Store,
      title: "Individual Sellers",
      description: "Perfect for single number operations with smart automation",
      cta: "start_free_trial",
    },
    {
      icon: Building,
      title: "Small Shops / SMBs",
      description: "Multi-product catalogs with advanced CRM features",
      cta: "start_free_trial",
    },
    {
      icon: Briefcase,
      title: "Agencies & Resellers",
      description: "Team accounts with white-label options",
      cta: "contact_sales",
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Meesho Seller",
      quote: "WaveGroww increased my conversions by 3x! The AI chatbot handles everything while I sleep.",
      avatar: "P",
      rating: 5
    },
    {
      name: "Rajesh Kumar",
      role: "Shopify Store Owner",
      quote: "The auto-catalog feature saved me 10 hours a week. Highly recommend for Indian sellers!",
      avatar: "R",
      rating: 5
    },
    {
      name: "Anita Desai",
      role: "Local Shop Owner",
      quote: "Finally, a tool built for Indian businesses. The Hindi support is perfect!",
      avatar: "A",
      rating: 5
    },
  ];

  const faqs = [
    {
      question: "How do I connect my WhatsApp number?",
      answer:
        "Simply sign up, verify your phone number, and follow our guided setup. You can connect via QR code or phone verification in under 2 minutes.",
    },
    {
      question: "What is the free trial?",
      answer:
        "Every plan includes a 3-day limited-feature trial so you can test the essentials. No credit card required. Cancel anytime during the trial with no charges.",
    },
    {
      question: "Are refunds available?",
      answer:
        "No refunds except in cases of verified system failure. Please contact WaveGroww@gmail.com first so we can resolve any issues you're experiencing.",
    },
    {
      question: "Which payment methods are supported?",
      answer:
        "We accept all major payment methods via Razorpay and Paytm including credit/debit cards, UPI, net banking, and digital wallets.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes! We use bank-grade encryption for data at rest and in transit, 2FA authentication, HTTPS only, and comply with Indian data protection regulations.",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative overflow-hidden py-20 md:py-28"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 opacity-50" />
          <div className="absolute inset-0 opacity-5 bg-[image:radial-gradient(circle,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary">
                  <Sparkles className="w-4 h-4" />
                  Made for Indian Sellers 🇮🇳
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  WaveGroww — WhatsApp Automation for{" "}
                  <span className="gradient-text">Indian Sellers</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground">
                  Automate conversations, capture leads, and sell more — 24/7. Built for Meesho, Shopify, and small local shops.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => handleCTAClick("start_free_trial")}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    Start 3-Day Trial
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleCTAClick("view_plans")}
                    className="px-8 py-4 bg-card border-2 border-border rounded-lg font-semibold hover:border-primary transition-all"
                  >
                    View Plans
                  </button>
                </div>

                {/* Value Bullets */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Never miss a buyer — AI replies instantly.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Auto-generated WhatsApp catalogs.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Built-in CRM & analytics.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Indian languages + local payments.</span>
                  </div>
                </div>
              </div>

              {/* Right Visual */}
              <div className="relative">
                <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-8 backdrop-blur-sm border border-border/50">
                  {/* Animated illustration placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                      <div className="bg-card rounded-xl p-4 shadow-lg border border-border animate-[float_3s_ease-in-out_infinite]">
                        <MessageSquare className="w-8 h-8 text-primary mb-2" />
                        <div className="h-2 bg-primary/20 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-primary/10 rounded w-1/2" />
                      </div>
                      <div className="bg-card rounded-xl p-4 shadow-lg border border-border animate-[float_3s_ease-in-out_infinite_0.2s]">
                        <Package className="w-8 h-8 text-accent mb-2" />
                        <div className="h-2 bg-accent/20 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-accent/10 rounded w-1/2" />
                      </div>
                      <div className="bg-card rounded-xl p-4 shadow-lg border border-border animate-[float_3s_ease-in-out_infinite_0.4s]">
                        <Users className="w-8 h-8 text-secondary mb-2" />
                        <div className="h-2 bg-secondary/20 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-secondary/10 rounded w-1/2" />
                      </div>
                      <div className="bg-card rounded-xl p-4 shadow-lg border border-border animate-[float_3s_ease-in-out_infinite_0.6s]">
                        <BarChart3 className="w-8 h-8 text-primary mb-2" />
                        <div className="h-2 bg-primary/20 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-primary/10 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Quick Features Cards */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-20 bg-muted/30"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to <span className="gradient-text">Automate & Scale</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed specifically for Indian sellers
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary/50 group"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <a
                      href={feature.link}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Learn more <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-20"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Get Started in <span className="gradient-text">3 Simple Steps</span>
              </h2>
              <p className="text-lg text-muted-foreground">From setup to selling in minutes</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="relative">
                <div className="bg-card border border-border rounded-xl p-8 text-center group hover:border-primary/50 transition-all">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Connect WhatsApp</h3>
                  <p className="text-muted-foreground">Verify your number in under 2 minutes</p>
                </div>
                {/* Connector */}
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
              </div>

              <div className="relative">
                <div className="bg-card border border-border rounded-xl p-8 text-center group hover:border-primary/50 transition-all">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Upload Products</h3>
                  <p className="text-muted-foreground">Use Auto Catalog for instant share links</p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
              </div>

              <div>
                <div className="bg-card border border-border rounded-xl p-8 text-center group hover:border-primary/50 transition-all">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Bot className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">AI Handles Chats</h3>
                  <p className="text-muted-foreground">Track leads & sales in your Dashboard</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={handleDemoPlay}
                className="inline-flex items-center gap-2 px-6 py-3 bg-card border-2 border-primary rounded-lg font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Play className="w-5 h-5" />
                See a Demo
              </button>
            </div>
          </div>
        </motion.section>

        {/* Deep Features Accordion */}
        <motion.section
          id="features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-20 bg-muted/30"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="gradient-text">Powerful Features</span> for Every Seller
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to automate, engage, and grow
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {deepFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFeature(expandedFeature === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    aria-expanded={expandedFeature === index ? "true" : "false"}
                  >
                    <span className="text-lg font-semibold text-left">{feature.title}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform ${expandedFeature === index ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  {expandedFeature === index && (
                    <div className="px-6 pb-4">
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Pricing Section */}
        <PricingSection />

        {/* Use Cases */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-20 bg-muted/30"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for <span className="gradient-text">Every Type</span> of Seller
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon;
                return (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-xl p-8 text-center hover:shadow-lg transition-all"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                    <p className="text-muted-foreground mb-6">{useCase.description}</p>
                    <button
                      onClick={() => handleCTAClick(useCase.cta)}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
                    >
                      {useCase.cta === "start_free_trial" ? "Start 3-Day Trial" : "Contact Sales"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Testimonials */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-20"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Loved by <span className="gradient-text">Indian Sellers</span>
              </h2>
              <p className="text-lg text-muted-foreground">Join thousands of successful sellers</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button className="text-primary hover:underline font-medium">
                Read More Case Studies →
              </button>
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-20 bg-muted/30"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    aria-expanded={expandedFaq === index ? "true" : "false"}
                  >
                    <span className="text-lg font-semibold text-left">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ml-4 ${expandedFaq === index ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-20"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 md:p-16 text-center text-white">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Automate Your WhatsApp Sales?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of Indian sellers growing their business with WaveGroww
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleCTAClick("start_free_trial")}
                  className="px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
                >
                  Start 3-Day Trial
                </button>
                <button
                  onClick={() => handleCTAClick("contact_sales")}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
                >
                  Contact Sales
                </button>
              </div>
              <p className="text-sm mt-4 opacity-75">
                3-day limited-feature trial • No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </motion.section>

        <Footer />
      </div>

      {/* Sticky Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40 py-3 px-4 animate-[slide-up_0.3s_ease-out]">
          <div className="container mx-auto flex items-center justify-between">
            <div className="hidden md:block">
              <p className="font-semibold">Ready to grow your business?</p>
              <p className="text-sm text-muted-foreground">Start your 3-day limited-feature trial today</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleCTAClick("start_free_trial")}
                className="flex-1 md:flex-none px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
              >
                Start 3-Day Trial
              </button>
              <button
                onClick={() => handleCTAClick("view_plans")}
                className="flex-1 md:flex-none px-6 py-2 bg-card border border-border rounded-lg font-medium hover:border-primary transition-all"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-card rounded-2xl max-w-4xl w-full p-6 relative animate-[scale-in_0.2s_ease-out]">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close demo modal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold mb-4">Product Demo</h3>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Demo video player placeholder</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Video showcasing WaveGroww features and workflow
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}