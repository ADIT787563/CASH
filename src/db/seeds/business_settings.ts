import { db } from '@/db';
import { businessSettings } from '@/db/schema';

async function main() {
    const sampleBusinessSettings = [
        {
            userId: 'demo-user-1',
            businessName: 'Desi Style - Fashion & Accessories',
            whatsappNumber: '+919876543210',
            businessCategory: 'Fashion & Lifestyle',
            businessDescription: 'Premium Indian fashion and accessories brand offering trendy ethnic wear, fusion clothing, and stylish accessories. We specialize in authentic traditional wear with modern designs, catering to fashion-conscious customers across India.',
            websiteUrl: 'https://desistyle.in',
            catalogUrl: 'https://desistyle.in/catalog',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        }
    ];

    await db.insert(businessSettings).values(sampleBusinessSettings);
    
    console.log('✅ Business settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});