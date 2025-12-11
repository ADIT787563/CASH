
import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/store-data";
import { StoreClient } from "@/components/shop/StoreClient";
import { Metadata } from "next";
import { headers } from "next/headers";
import { db } from "@/db";
import { trafficSources } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const data = await getStoreBySlug(slug);

    if (!data) {
        return {
            title: "Store Not Found",
        };
    }

    return {
        title: data.settings?.businessName || data.business.name,
        description: data.settings?.businessDescription || `Shop at ${data.business.name}`,
    };
}

export default async function ShopPage({ params }: PageProps) {
    const { slug } = await params;
    const storeData = await getStoreBySlug(slug);

    if (!storeData) {
        notFound();
    }

    // --- Traffic Tracking Logic (Non-blocking) ---
    // We intentionally don't await this or we wrap it in a way that doesn't crash the page
    // In Next.js Server Components, we can just execute the promise.
    // However, keeping it simple and awaited is safer for consistency in SQLite.
    try {
        const headersList = await headers();
        const referer = headersList.get('referer');
        let source = 'Direct';

        if (referer) {
            if (referer.includes('google')) source = 'Google';
            else if (referer.includes('facebook')) source = 'Facebook';
            else if (referer.includes('instagram')) source = 'Instagram';
            else if (referer.includes('twitter') || referer.includes('t.co')) source = 'Twitter';
            else if (referer.includes('linkedin')) source = 'LinkedIn';
            else if (referer.includes('whatsapp')) source = 'WhatsApp';
            else if (referer.includes(storeData.business.slug)) source = 'Internal'; // Self-referral
            else source = 'Other'; // Or parse domain
        }

        // don't track internal clicks too much, or do? Let's track everything for now but maybe skip 'Internal' if we want unique visitors.
        // For simplicity, we track all.

        if (source !== 'Internal') {
            const today = new Date().toISOString().split('T')[0];
            const userId = storeData.business.ownerId; // Store Owner ID

            // Check if record exists
            const existing = await db.select().from(trafficSources).where(and(
                eq(trafficSources.userId, userId),
                eq(trafficSources.source, source),
                eq(trafficSources.date, today)
            )).limit(1);

            if (existing.length > 0) {
                await db.update(trafficSources)
                    .set({ visits: existing[0].visits + 1 })
                    .where(eq(trafficSources.id, existing[0].id));
            } else {
                await db.insert(trafficSources).values({
                    userId: userId,
                    source: source,
                    visits: 1,
                    date: today,
                    createdAt: new Date().toISOString()
                });
            }
        }

    } catch (e) {
        console.error("Traffic tracking error:", e);
        // Do not crash the page
    }
    // ---------------------------------------------

    return <StoreClient storeData={storeData} />;
}
