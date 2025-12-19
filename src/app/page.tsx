"use client";

import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/home/HeroSection";

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

const Footer = dynamic(() => import("@/components/home/Footer").then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-64" />,
  ssr: true
});

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Redirect logged-in users to dashboard or setup-profile
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!isPending && session?.user) {
        // Check if profile is complete
        const token = localStorage.getItem("bearer_token");
        if (token) {
          try {
            const response = await fetch("/api/business-profile", {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
              const data = await response.json();
              // If profile doesn't exist or is incomplete, go to setup
              if (!data || !data.userId || !data.isComplete) {
                router.push("/setup-profile");
                return;
              }
            }
          } catch (error) {
            console.error("Error checking profile:", error);
          }
        }

        // Profile is complete or check failed, go to dashboard
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
      <Suspense fallback={<div className="h-64" />}>
        <CTASection />
      </Suspense>
      <Suspense fallback={<div className="h-64" />}>
        <Footer />
      </Suspense>
    </div>
  );
}