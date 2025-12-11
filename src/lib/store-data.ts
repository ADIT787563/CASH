
import { db } from "@/db";
import { businesses, businessSettings, products, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type StoreData = {
    business: typeof businesses.$inferSelect;
    settings: typeof businessSettings.$inferSelect | null;
    products: typeof products.$inferSelect[];
    categories: typeof categories.$inferSelect[];
};

export async function getStoreBySlug(slug: string): Promise<StoreData | null> {
    try {
        // 1. Get Business by Slug
        const businessList = await db.select()
            .from(businesses)
            .where(eq(businesses.slug, slug))
            .limit(1);

        if (businessList.length === 0) {
            return null;
        }

        const business = businessList[0];

        // 2. Get Settings (for Theme)
        // Adjust logic if settings are linked differently. 
        // Based on schema, businessSettings.userId === businesses.ownerId
        const settingsList = await db.select()
            .from(businessSettings)
            .where(eq(businessSettings.userId, business.ownerId))
            .limit(1);

        const settings = settingsList.length > 0 ? settingsList[0] : null;

        // 3. Get Active Products
        const storeProducts = await db.select()
            .from(products)
            .where(
                and(
                    eq(products.userId, business.ownerId),
                    eq(products.status, 'active') // Only show active products
                )
            );

        // 4. Get Categories (Optional: for filtering)
        const storeCategories = await db.select()
            .from(categories)
            .where(eq(categories.userId, business.ownerId));

        return {
            business,
            settings,
            products: storeProducts,
            categories: storeCategories
        };

    } catch (error) {
        console.error("Error fetching store data:", error);
        return null;
    }
}
