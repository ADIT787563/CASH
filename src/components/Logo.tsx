"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export function Logo({ className = "w-8 h-8", width, height }: LogoProps) {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return a placeholder during SSR to avoid hydration mismatch
        return <div className={className} />;
    }

    // Determine current theme
    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = currentTheme === "dark";

    return (
        <img
            src={isDark ? "/images/logo-dark.png" : "/images/logo-light.jpg"}
            alt="WaveGroww Logo"
            className={`${className} object-contain`}
            width={width}
            height={height}
        />
    );
}
