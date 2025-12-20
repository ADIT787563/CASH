"use client";

import { useRef } from "react";
import Image from "next/image";

// Tech companies powering Wavegroww
const TECH_PARTNERS = [
    { name: "Google", logo: "/logos/google.png", width: 120, height: 40 },
    { name: "Supabase", logo: "/logos/supabase.png", width: 140, height: 40 },
    { name: "Razorpay", logo: "/logos/razorpay.png", width: 120, height: 40 },
    { name: "Meta", logo: "/logos/meta.png", width: 100, height: 40 },
    { name: "Hostinger", logo: "/logos/hostinger.png", width: 140, height: 40 },
];

export function LogoStrip() {
    return (
        <div className="w-full py-12 bg-muted/30 overflow-hidden">
            <div className="container mx-auto px-4">
                <p className="text-center text-sm font-bold uppercase tracking-widest text-muted-foreground/80 mb-10">
                    Powered by
                </p>

                <div className="relative flex overflow-hidden group">
                    {/* Gradient overlays */}
                    <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-muted/30 via-muted/30 to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-muted/30 via-muted/30 to-transparent z-10" />

                    {/* Scrolling Track for Infinite Loop */}
                    <div className="flex gap-16 items-center animate-scroll-infinite min-w-full">
                        {/* Original Set */}
                        {TECH_PARTNERS.map((partner, index) => (
                            <div
                                key={`partner-1-${index}`}
                                className="flex-shrink-0 flex items-center justify-center h-12 hover:scale-110 transition-transform duration-300"
                            >
                                <Image
                                    src={partner.logo}
                                    alt={`${partner.name} logo`}
                                    width={partner.width}
                                    height={partner.height}
                                    className="object-contain w-auto h-full max-h-12"
                                />
                            </div>
                        ))}
                        {/* Duplicate Set 1 */}
                        {TECH_PARTNERS.map((partner, index) => (
                            <div
                                key={`partner-2-${index}`}
                                className="flex-shrink-0 flex items-center justify-center h-12 hover:scale-110 transition-transform duration-300"
                            >
                                <Image
                                    src={partner.logo}
                                    alt={`${partner.name} logo`}
                                    width={partner.width}
                                    height={partner.height}
                                    className="object-contain w-auto h-full max-h-12"
                                />
                            </div>
                        ))}
                        {/* Duplicate Set 2 for ultra-wide screens */}
                        {TECH_PARTNERS.map((partner, index) => (
                            <div
                                key={`partner-3-${index}`}
                                className="flex-shrink-0 flex items-center justify-center h-12 hover:scale-110 transition-transform duration-300"
                            >
                                <Image
                                    src={partner.logo}
                                    alt={`${partner.name} logo`}
                                    width={partner.width}
                                    height={partner.height}
                                    className="object-contain w-auto h-full max-h-12"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
