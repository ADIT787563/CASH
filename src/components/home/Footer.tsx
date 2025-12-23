"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useContent } from "@/hooks/useConfig";
import { Logo } from "@/components/Logo";

export function Footer() {
  const { data: content } = useContent();

  const productMenu = content?.footer_product_menu || [
    { name: "Product", href: "/product" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/plans" },
  ];

  const rawCompanyMenu = content?.footer_company_menu || [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Refund Policy", href: "/refund" },
  ];

  const companyMenu = [...rawCompanyMenu];
  if (!companyMenu.some((item: any) => item.href === "/refund")) {
    companyMenu.push({ name: "Refund Policy", href: "/refund" });
  }

  return (
    <footer className="border-t border-slate-200 bg-transparent py-12">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Logo className="w-8 h-8" />
              <span className="text-xl font-bold gradient-text">WaveGroww</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              India's most powerful WhatsApp AI automation platform for online sellers. Automate chats, convert leads, and grow your business.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Made in India with</span>
              <span className="text-red-500">❤️</span>
              <span className="text-muted-foreground">for Indian Sellers 🇮🇳</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {productMenu.map((item: any, index: number) => (
                <li key={index}><Link href={item.href} className="hover:text-primary transition-colors">{item.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {companyMenu.map((item: any, index: number) => (
                <li key={index}><Link href={item.href} className="hover:text-primary transition-colors">{item.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 WaveGroww. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}