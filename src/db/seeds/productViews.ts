import { db } from '@/db';
import { productViews } from '@/db/schema';

async function main() {
    const productNames = [
        "Women's Cotton Printed Kurti",
        "Designer Anarkali Suit Set",
        "Women's Rayon Palazzo Pants",
        "Pure Silk Banarasi Saree",
        "Men's Cotton Kurta Pajama Set",
        "Ethnic Printed Kurti with Pants",
        "Tempered Glass Screen Guard",
        "Fast Charging Type-C Cable",
        "TWS Wireless Earbuds",
        "20000mAh Power Bank",
        "Stainless Steel Water Bottle",
        "Non-Stick Cookware Set",
        "LED Desk Lamp",
        "Genuine Leather Wallet",
        "Designer Handbag",
        "Polarized Sunglasses"
    ];

    const popularityTiers = {
        high: [1, 7, 8],
        medium: [2, 3, 6, 9, 10],
        low: [4, 5, 11, 12, 13, 14, 15, 16]
    };

    const sources = ['campaign', 'shared_link', 'direct', 'social'];
    const sourceWeights = [0.40, 0.25, 0.20, 0.15];

    const getRandomSource = () => {
        const random = Math.random();
        let cumulative = 0;
        for (let i = 0; i < sourceWeights.length; i++) {
            cumulative += sourceWeights[i];
            if (random < cumulative) {
                return sources[i];
            }
        }
        return sources[0];
    };

    const getPopularityRange = (productId: number): [number, number] => {
        if (popularityTiers.high.includes(productId)) {
            return [20, 30];
        } else if (popularityTiers.medium.includes(productId)) {
            return [10, 20];
        } else {
            return [5, 15];
        }
    };

    const isWeekend = (date: Date): boolean => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const sampleProductViews = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    for (let dayIndex = 0; dayIndex < 90; dayIndex++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayIndex);
        const dateStr = currentDate.toISOString().split('T')[0];
        const isWeekendDay = isWeekend(currentDate);
        const growthMultiplier = 1 + (dayIndex / 90) * 0.15;

        for (let productId = 1; productId <= 16; productId++) {
            if (Math.random() > 0.85) continue;

            const [minViews, maxViews] = getPopularityRange(productId);
            let baseViews = Math.floor(Math.random() * (maxViews - minViews + 1)) + minViews;
            
            if (isWeekendDay) {
                baseViews = Math.floor(baseViews * 0.7);
            }
            
            const viewCount = Math.max(1, Math.floor(baseViews * growthMultiplier));
            const clickCount = Math.floor(viewCount * (0.2 + Math.random() * 0.2));
            const source = getRandomSource();

            sampleProductViews.push({
                userId: 'demo-user-1',
                productId: productId,
                productName: productNames[productId - 1],
                viewDate: dateStr,
                viewCount: viewCount,
                clickCount: clickCount,
                source: source,
                createdAt: new Date(currentDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))).toISOString(),
            });
        }
    }

    await db.insert(productViews).values(sampleProductViews);
    
    console.log(`✅ Product views seeder completed successfully - Generated ${sampleProductViews.length} records`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});