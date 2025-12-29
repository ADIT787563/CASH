"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/home/HeroSection";

// Development Warning Popup Component
function DevWarningPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 max-w-md animate-in fade-in zoom-in duration-300 rounded-2xl bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-500/30 p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {/* Warning Icon */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
            <svg className="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-xl font-bold text-yellow-400">
            ⚠️ Under Development ⚠️
          </h2>

          {/* Message */}
          <p className="mb-4 text-gray-300">
            <span className="font-semibold text-white">DO NOT PURCHASE ANY PLANS</span>
            <br />
            This website is currently under development.
          </p>

          {/* Developer Credit */}
          <p className="mb-6 text-sm text-gray-400">
            — <span className="font-medium text-orange-400">ANSH KUMAR</span>
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-2 font-semibold text-black transition-all hover:from-yellow-400 hover:to-orange-400 hover:scale-105"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

// Lazy load non-critical sections
const FeaturesSection = dynamic(() => import("@/components/home/FeaturesSection").then(mod => ({ default: mod.FeaturesSection })), {
  loading: () => <div className="h-96" />,
  ssr: true
});

const BenefitsSection = dynamic(() => import("@/components/home/BenefitsSection").then(mod => ({ default: mod.BenefitsSection })), {
  loading: () => <div className="h-96" />,
  ssr: true
});

const CTASection = dynamic(() => import("@/components/home/CTASection").then(mod => ({ default: mod.CTASection })), {
  loading: () => <div className="h-64" />,
  ssr: true
});

const ComparisonSection = dynamic(() => import("@/components/home/ComparisonSection").then(mod => ({ default: mod.ComparisonSection })), {
  loading: () => <div className="h-96" />,
  ssr: true
});

const TestimonialsSection = dynamic(() => import("@/components/home/TestimonialsSection").then(mod => ({ default: mod.TestimonialsSection })), {
  loading: () => <div className="h-96" />,
  ssr: true
});

const PricingSection = dynamic(() => import("@/components/home/PricingSection").then(mod => ({ default: mod.PricingSection })), {
  loading: () => <div className="h-96" />,
  ssr: true
});

const Footer = dynamic(() => import("@/components/home/Footer").then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-64" />,
  ssr: true
});

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [showDevWarning, setShowDevWarning] = useState(true);

  // Redirect logged-in users to dashboard or setup-profile
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!isPending && session?.user) {
        // Always redirect to dashboard for logged-in users
        // Profile completion checks should be handled within the dashboard or via specific guards
        router.push("/dashboard");
      }
    };

    checkAndRedirect();
  }, [session, isPending, router]);


  // Non-blocking auth check
  // if (isPending) return null or spinner (removed per P0 requirement to show Hero immediately)

  // Only show landing page for non-authenticated users
  if (session?.user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Development Warning Popup - Shows on every page load */}
      {showDevWarning && (
        <DevWarningPopup onClose={() => setShowDevWarning(false)} />
      )}
      <HeroSection />
      <Suspense fallback={<div className="h-96" />}>
        <FeaturesSection />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <BenefitsSection />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <ComparisonSection />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <PricingSection />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<div className="h-64" />}>
        <CTASection />
      </Suspense>
      <Suspense fallback={<div className="h-64" />}>
        <Footer />
      </Suspense>
    </div>
  );
}