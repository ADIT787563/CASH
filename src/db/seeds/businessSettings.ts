import { db } from '@/db';
import { businessSettings } from '@/db/schema';

async function main() {
    const sampleBusinessSettings = [
        {
            userId: 'demo-user-1',
            businessName: 'Desi Style - Fashion & Accessories',
            whatsappNumber: '+919876543210',
            businessCategory: 'Fashion & Lifestyle',
            businessDescription: 'Your one-stop shop for trendy Indian ethnic wear, mobile accessories, and fashion essentials. Quality products at affordable prices with fast delivery across India. Shop with confidence - COD available!',
            websiteUrl: 'https://desistyle.in',
            catalogUrl: 'https://desistyle.in/catalog',
            createdAt: new Date('2024-09-15T09:00:00.000Z').toISOString(),
            updatedAt: new Date('2024-11-28T14:30:00.000Z').toISOString(),
        }
    ];

    await db.insert(businessSettings).values(sampleBusinessSettings);
    
    console.log('✅ Business settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});