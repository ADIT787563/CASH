"use client";

import { CheckCircle2, MessageCircle, Bot, TrendingUp } from "lucide-react";

const benefits = [
  "Never miss a customer message",
  "Save 10+ hours per week",
  "Increase conversions by 3x",
  "Manage everything in one dashboard",
  "Multi-language support (Hindi, English, etc.)",
  "100% Indian SaaS with local support",
];

export function BenefitsSection() {
  return (
    <section id="about" className="py-20 lg:py-32">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Indian Sellers <span className="gradient-text">Love Us</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Built specifically for the Indian market with features that help you sell more, save time, and never miss a customer.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="glass-card p-8 rounded-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">New Message</div>
                      <div className="text-xs text-muted-foreground">Customer asking about price...</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-accent/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <Bot className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">AI Replied Instantly</div>
                      <div className="text-xs text-muted-foreground">Sent price + catalog link</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-success/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-success-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Lead Converted! 🎉</div>
                      <div className="text-xs text-muted-foreground">₹2,499 order placed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
