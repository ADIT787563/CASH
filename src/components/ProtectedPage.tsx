"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { PageSkeleton } from "@/components/ui/skeletons";

export default function ProtectedPage({ children }: { children: ReactNode }) {
    const { session, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return; // still loading, don't redirect
        if (!session) router.replace("/login");
    }, [session, loading, router]);

    if (loading) return <PageSkeleton />; // show skeleton while loading
    if (!session) return null; // redirecting...

    return <>{children}</>;
}
