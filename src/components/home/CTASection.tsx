"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePricing } from "@/hooks/useConfig";

export function CTASection() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { data: plans } = usePricing();

  const minPrice = plans && plans.length > 0
    ? Math.min(...plans.filter(p => p.monthlyPrice > 0).map(p => p.monthlyPrice))
    : null;



  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:bg-muted/20">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to <span className="gradient-text">Automate & Grow?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of Indian sellers using WaveGroww to automate WhatsApp, convert more leads, and grow their business on autopilot.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href={session?.user ? "/dashboard" : "/register"}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
            >
              {session?.user ? "Go to Dashboard" : "Start 3-Day Trial"}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/plans"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card text-foreground border border-border rounded-lg font-semibold hover:bg-muted transition-all"
            >
              See All Plans & Pricing
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            {minPrice ? `Plans starting at just ₹${minPrice}/month` : "Affordable plans for every business"} • 3-day limited-feature trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}