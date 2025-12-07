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
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="w-full py-12 bg-muted/30 overflow-hidden">
            <div className="container mx-auto px-4">
                <p className="text-center text-sm text-muted-foreground mb-8 font-medium">
                    Powered by
                </p>

                <div className="relative">
                    {/* Gradient overlays for smooth edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-muted/30 to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-muted/30 to-transparent z-10" />

                    {/* Scrolling container */}
                    <div
                        ref={scrollRef}
                        className="flex gap-16 animate-scroll hover:pause-animation items-center"
                    >
                        {/* First set of logos */}
                        {TECH_PARTNERS.map((partner, index) => (
                            <div
                                key={`partner-1-${index}`}
                                className="flex-shrink-0 flex items-center justify-center h-16 px-6"
                            >
                                <Image
                                    src={partner.logo}
                                    alt={`${partner.name} logo`}
                                    width={partner.width}
                                    height={partner.height}
                                    className="object-contain"
                                    priority={index < 3}
                                />
                            </div>
                        ))}

                        {/* Duplicate set for seamless loop */}
                        {TECH_PARTNERS.map((partner, index) => (
                            <div
                                key={`partner-2-${index}`}
                                className="flex-shrink-0 flex items-center justify-center h-16 px-6"
                            >
                                <Image
                                    src={partner.logo}
                                    alt={`${partner.name} logo`}
                                    width={partner.width}
                                    height={partner.height}
                                    className="object-contain"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
