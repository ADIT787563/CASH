"use client";

import { useState, Suspense, lazy, useEffect } from "react";
import { Check, X, ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { Footer } from "@/components/home/Footer";

// Lazy load heavy components
const ComparisonTable = dynamic(() => import('@/components/plans/ComparisonTable'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading comparison table...</div>
});

const FAQSection = dynamic(() => import('@/components/plans/FAQSection'), {
  ssr: false,
  loading: () => <div className="h-32 flex items-center justify-center">Loading FAQs...</div>
});

interface Plan {
  id: string;
  name: string;
  price: number;
  tagline: string;
  features: string[];
  cta: string;
  popular: boolean;
  showContactSales: boolean;
  bestFor?: string;
  limitations?: string[];
}

// Inline component for the plan card to enable code splitting
const PlanCard = ({ plan }: { plan: Plan }) => (
  <div
    key={plan.id}
    className={`relative glass-card p-6 rounded-2xl transition-all hover:-translate-y-2 hover:shadow-xl ${plan.popular ? 'border-2 border-primary' : ''
      }`}
  >
    {plan.popular && (
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
        <span className="px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full whitespace-nowrap">
          Most Popular
        </span>
      </div>
    )}
    {/* Rest of the plan card content */}
    <div className={`mb-6 ${plan.popular ? 'pt-6' : ''}`}>
      <p className="text-sm text-muted-foreground mb-2">{plan.tagline}</p>
      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-4xl font-bold">₹{plan.price.toLocaleString()}</span>
        <span className="text-muted-foreground">/ month</span>
      </div>
      {plan.bestFor && (
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
          <span>💡</span>
          <span>{plan.bestFor}</span>
        </div>
      )}
    </div>

    <div className="border-t border-border pt-6 mb-6 min-h-[400px]">
      <ul className="space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            {feature.startsWith('❌') ? (
              <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            ) : (
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            )}
            <span className={`text-sm ${feature.startsWith('❌') ? 'text-muted-foreground line-through' : ''}`}>
              {feature.replace('❌ ', '').replace('✅ ', '')}
            </span>
          </li>
        ))}
      </ul>
    </div>

    <Link
      href={`/payment/checkout?plan=${plan.id}&billing=monthly`}
      className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-all ${plan.popular
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : 'bg-muted text-foreground hover:bg-muted/80'
        }`}
    >
      {plan.cta}
    </Link>
    {!plan.showContactSales && (
      <Link
        href={`/payment/checkout?plan=${plan.id}&billing=yearly`}
        className="block w-full text-center text-sm text-primary hover:underline mt-3"
        onClick={(e) => {
          e.preventDefault();
          // Calculate the yearly price with 20% discount
          const yearlyPrice = Math.floor(plan.price * 12 * 0.8);
          // Redirect to checkout page with yearly billing
          window.location.href = `/payment/checkout?plan=${plan.id}&billing=yearly&price=${yearlyPrice}`;
        }}
      >
        Or save 20% with annual billing
      </Link>
    )}
    {plan.showContactSales && (
      <Link
        href="/contact"
        className="block w-full text-center text-sm text-primary hover:underline mt-3"
      >
        Talk to sales
      </Link>
    )}
  </div>
);

// Plan data with detailed features
const PLANS = [
  {
    id: "growth",
    name: "Growth",
    price: 1699,
    tagline: "Perfect for sellers scaling to mid-level business",
    features: [
      "📦 Add up to 40 products",
      "🎨 Variants & Multi-image support",
      "🤖 800 automated replies/mo",
      "📱 Connect up to 3 WhatsApp Numbers",
      "🛒 Custom checkout fields",
      "🧾 Advanced Invoice (GST, PDF)",
      "📊 Revenue chart & Top customers",
      "👥 Up to 3 team members",
      "🔌 Basic Webhooks & API",
      "⚡ Auto follow-up & Abandoned cart",
      "✅ SEO fields & Product tags",
    ],
    cta: "Start Free Trial",
    popular: false,
    showContactSales: false,
    bestFor: "Growing businesses needing GST invoices"
  },
  {
    id: "pro",
    name: "Pro / Agency",
    price: 5,
    tagline: "For agencies, large stores, and professional sellers",
    features: [
      "📦 Add up to 130 products",
      "🚀 Bulk upload (CSV/Excel)",
      "🤖 Unlimited automated replies",
      "🧠 AI-powered auto-reply",
      "📱 Connect up to 10 WhatsApp numbers",
      "🎨 Branded Invoices (Logo + Colors)",
      "📊 Full Analytics & Conversion rates",
      "👥 Up to 10 team members (Roles)",
      "🔌 Full API Access & Webhooks",
      "💳 Payment QR on invoice",
      "⚡ Smart inventory alerts",
    ],
    cta: "Start Free Trial",
    popular: true,
    showContactSales: false,
    bestFor: "Agencies and high-volume sellers"
  },
  {
    id: "scale",
    name: "Enterprise",
    price: 8999,
    tagline: "For large businesses & D2C brands",
    features: [
      "📦 Custom catalog limit (200-Unlimited)",
      "🤖 AI Chatbot (NLP) & Smart Replies",
      "🌍 Multi-language NLP auto-replies",
      "📱 Unlimited WhatsApp numbers",
      "🛒 Fully customizable checkout API",
      "🏢 White-label & Custom Invoices",
      "📊 BI Dashboard & Custom Reports",
      "👥 Unlimited team members & Audit logs",
      "🔌 Complete API Suite & ERP Sync",
      "🤝 Dedicated Account Manager",
      "⚡ SLA-based guaranteed response",
      "✅ WhatsApp Green-tick support",
    ],
    cta: "Contact Sales",
    popular: false,
    showContactSales: true,
    bestFor: "Large enterprises with custom needs"
  }
];

// Comparison table data - Comprehensive feature list
const COMPARISON_FEATURES = [
  // Pricing
  {
    category: "Pricing",
    name: "Monthly Price",
    starter: "₹5",
    growth: "₹1,699",
    pro: "₹3,999",
    scale: "₹8,999+"
  },

  // Catalog & Product Management
  {
    category: "Catalog & Product Management",
    name: "Catalog Limit",
    starter: "20 products",
    growth: "40 products",
    pro: "130 products",
    scale: "Custom (200–Unlimited)",
    highlight: true
  },
  {
    category: "Catalog & Product Management",
    name: "Product Variants (Size/Color)",
    starter: false,
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "Catalog & Product Management",
    name: "Multi-Image Upload",
    starter: false,
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "Catalog & Product Management",
    name: "Bulk Upload via CSV/Excel",
    starter: false,
    growth: false,
    pro: true,
    scale: true,
    highlight: true
  },
  {
    category: "Catalog & Product Management",
    name: "AI Product Descriptions",
    starter: false,
    growth: false,
    pro: true,
    scale: true
  },
  {
    category: "Catalog & Product Management",
    name: "Unlimited Categories",
    starter: "No (Max 5)",
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "Catalog & Product Management",
    name: "Tags & SEO Fields",
    starter: false,
    growth: true,
    pro: true,
    scale: true
  },

  // WhatsApp Automation
  {
    category: "WhatsApp Automation",
    name: "Auto Replies (Per Month)",
    starter: "250",
    growth: "800",
    pro: "Unlimited",
    scale: "Unlimited + NLP AI",
    highlight: true
  },
  {
    category: "WhatsApp Automation",
    name: "AI Smart Replies",
    starter: false,
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "WhatsApp Automation",
    name: "Flow Builder",
    starter: false,
    growth: false,
    pro: false,
    scale: false
  },
  {
    category: "WhatsApp Automation",
    name: "Auto Greeting Message",
    starter: true,
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "WhatsApp Automation",
    name: "Auto Follow-Up Messages",
    starter: false,
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "WhatsApp Automation",
    name: "Abandoned Cart Reminder",
    starter: false,
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "WhatsApp Automation",
    name: "WhatsApp Numbers Allowed",
    starter: "1",
    growth: "3",
    pro: "10",
    scale: "Unlimited"
  },
  {
    category: "WhatsApp Automation",
    name: "Message Routing",
    starter: false,
    growth: false,
    pro: true,
    scale: "Advanced Routing"
  },
  {
    category: "WhatsApp Automation",
    name: "Quick Reply Templates",
    starter: true,
    growth: true,
    pro: true,
    scale: true
  },

  // Orders & Checkout
  {
    category: "Orders & Checkout",
    name: "Basic Order Form",
    starter: true,
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "Orders & Checkout",
    name: "Custom Checkout Fields",
    starter: false,
    growth: true,
    pro: true,
    scale: "Advanced Rules"
  },
  {
    category: "Orders & Checkout",
    name: "Address / Email Collection",
    starter: "Limited",
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "Orders & Checkout",
    name: "Shipping Rules",
    starter: false,
    growth: true,
    pro: true,
    scale: "Advanced"
  },
  {
    category: "Orders & Checkout",
    name: "Order Tracking Link",
    starter: false,
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "Orders & Checkout",
    name: "Payment QR on Checkout",
    starter: false,
    growth: true,
    pro: true,
    scale: true
  },

  // Invoice System
  {
    category: "Invoice System",
    name: "Auto Invoice Generation",
    starter: true,
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "Invoice System",
    name: "GST Support",
    starter: false,
    growth: true,
    pro: true,
    scale: true,
    highlight: true
  },
  {
    category: "Invoice System",
    name: "PDF Download",
    starter: "Basic",
    growth: true,
    pro: true,
    scale: "Advanced"
  },
  {
    category: "Invoice System",
    name: "Branding (Logo + Colors)",
    starter: false,
    growth: false,
    pro: true,
    scale: "Full White-Label"
  },
  {
    category: "Invoice System",
    name: "Multiple Templates",
    starter: false,
    growth: false,
    pro: true,
    scale: "Custom Templates"
  },
  {
    category: "Invoice System",
    name: "Terms & Conditions + Notes",
    starter: "Basic",
    growth: true,
    pro: true,
    scale: "Fully Custom"
  },

  // Analytics & Insights
  {
    category: "Analytics & Insights",
    name: "Basic Analytics",
    starter: true,
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "Analytics & Insights",
    name: "Revenue Chart",
    starter: false,
    growth: true,
    pro: true,
    scale: "Advanced BI"
  },
  {
    category: "Analytics & Insights",
    name: "Top Customers List",
    starter: false,
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "Analytics & Insights",
    name: "Conversion Rate",
    starter: false,
    growth: false,
    pro: true,
    scale: true
  },
  {
    category: "Analytics & Insights",
    name: "Team Analytics",
    starter: false,
    growth: false,
    pro: true,
    scale: "Full Audit"
  },

  // Team & Permissions
  {
    category: "Team & Permissions",
    name: "Team Members",
    starter: "1",
    growth: "3",
    pro: "10",
    scale: "Unlimited",
    highlight: true
  },
  {
    category: "Team & Permissions",
    name: "Roles & Permissions",
    starter: false,
    growth: "Basic",
    pro: "Advanced",
    scale: "Custom Matrix"
  },
  {
    category: "Team & Permissions",
    name: "Activity Logs",
    starter: false,
    growth: false,
    pro: true,
    scale: "Full Audit Log"
  },
  {
    category: "Team & Permissions",
    name: "Multi-Agent Inbox",
    starter: false,
    growth: false,
    pro: true,
    scale: true
  },

  // Integrations & API
  {
    category: "Integrations & API",
    name: "API Access",
    starter: false,
    growth: "Basic",
    pro: "Full",
    scale: "Enterprise-Grade",
    highlight: true
  },
  {
    category: "Integrations & API",
    name: "Webhooks",
    starter: false,
    growth: "Basic",
    pro: "Advanced",
    scale: "Full"
  },
  {
    category: "Integrations & API",
    name: "Razorpay Integration",
    starter: false,
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "Integrations & API",
    name: "Google Sheets Sync",
    starter: false,
    growth: true,
    pro: true,
    scale: true
  },
  {
    category: "Integrations & API",
    name: "Meta API",
    starter: false,
    growth: "Limited",
    pro: "Full",
    scale: "Full"
  },
  {
    category: "Integrations & API",
    name: "ERP/CRM Integration",
    starter: false,
    growth: false,
    pro: "Limited",
    scale: "Full"
  },

  // Support & Service
  {
    category: "Support & Service",
    name: "Email Support",
    starter: "Basic",
    growth: "Priority",
    pro: "Priority+",
    scale: "Dedicated Manager"
  },
  {
    category: "Support & Service",
    name: "WhatsApp Support",
    starter: false,
    growth: "Limited",
    pro: true,
    scale: true
  },
  {
    category: "Support & Service",
    name: "Phone Support",
    starter: false,
    growth: false,
    pro: false,
    scale: true
  },
  {
    category: "Support & Service",
    name: "Onboarding Assistance",
    starter: false,
    growth: "Basic",
    pro: "Full",
    scale: "Enterprise Onboarding"
  },
  {
    category: "Support & Service",
    name: "Custom Feature Requests",
    starter: false,
    growth: false,
    pro: "Limited",
    scale: true
  },

  // Reply Capacity
  {
    category: "Reply Capacity",
    name: "Monthly Reply Capacity",
    starter: "120–200 customers",
    growth: "350–600 customers",
    pro: "900–1500 customers",
    scale: "2000–10,000+ customers",
    highlight: true
  },
  {
    category: "Reply Capacity",
    name: "Team Size Fit",
    starter: "1–2 person",
    growth: "2–5 team",
    pro: "5–15 team",
    scale: "Big enterprises"
  }
];

// FAQ data
const FAQS = [
  {
    question: "Is there a free trial?",
    answer: "Yes, all paid plans include a free trial. You can cancel anytime before the trial ends."
  },
  {
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan from the billing section."
  },
  {
    question: "Are WhatsApp message charges included in the price?",
    answer: "Platform fees are included, but WhatsApp conversation charges are billed separately by WhatsApp / BSP."
  },
  {
    question: "Do I need a separate WhatsApp Business API account?",
    answer: "Yes, you need an approved WhatsApp Business number. We help you connect it inside Wavegroww."
  },
  {
    question: "What payment methods do you accept?",
    answer: "UPI, cards, and net banking via our payment partners."
  }
];

export default function PricingPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 animate-gradient" />

        <div className="relative container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Transparent Pricing</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Simple pricing for <span className="gradient-text">growing businesses</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Choose a plan that matches your automation needs. Upgrade or downgrade anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan: Plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Compare <span className="gradient-text">All Features</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            See exactly what's included in each plan. All key features like catalog limits, AI capabilities, team size, and API access clearly listed.
          </p>

          {isClient && (
            <Suspense fallback={
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse">Loading comparison table...</div>
              </div>
            }>
              <ComparisonTable features={COMPARISON_FEATURES} />
            </Suspense>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>

          {isClient && (
            <Suspense fallback={
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse"></div>
                ))}
              </div>
            }>
              <FAQSection
                faqs={FAQS}
                expandedFAQ={expandedFAQ}
                toggleFAQ={toggleFAQ}
              />
            </Suspense>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to grow with <span className="gradient-text">Wavegroww</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Launch your first automation flow in minutes. No developer required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card text-foreground border border-border rounded-lg font-semibold hover:bg-muted transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Talk to sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
// Force rebuild