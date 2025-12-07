import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Suspense } from 'react';
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/Header";
import { Providers } from "@/lib/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/providers/AuthProvider";
import Loading from "./loading";

// Client Components
import ClientComponents from "./client-components";

export const metadata: Metadata = {
  title: "WaveGroww - WhatsApp AI Automation for Indian Sellers",
  description: "Automate WhatsApp chats, convert more leads, and grow your business with AI-powered automation",
  metadataBase: new URL('https://wavegroww.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://wavegroww.com',
    siteName: 'WaveGroww',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://slelguoygbfzlpylpxfs.supabase.co" />
        <link rel="dns-prefetch" href="https://slelguoygbfzlpylpxfs.supabase.co" />
        <link rel="preload" as="image" href="/images/logo-dark.png" type="image/png" />
        <link rel="preload" as="image" href="/images/logo-light.jpg" type="image/jpeg" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <ClientComponents />
            <Script
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
              strategy="afterInteractive"
              data-target-origin="*"
              data-message-type="ROUTE_CHANGE"
              data-include-search-params="true"
              data-only-in-iframe="true"
              data-debug="false"
              data-custom-data='{"appName": "WaveGroww", "version": "1.0.0"}'
            />
            <Providers>
              <AuthProvider>
                <Header />
                <main>
                  {children}
                </main>
                <Toaster />
              </AuthProvider>
            </Providers>
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  );
}