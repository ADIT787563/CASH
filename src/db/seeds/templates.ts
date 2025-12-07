import { db } from '@/db';
import { templates } from '@/db/schema';

async function main() {
    const sampleTemplates = [
        {
            userId: 'demo-user-1',
            name: 'Flash Sale Alert',
            content: 'Hi {{customerName}}! 🎉 FLASH SALE LIVE NOW! Get {{discount}}% OFF on all products. Limited time only! Shop now: {{catalogUrl}} Reply STOP to unsubscribe.',
            category: 'offer',
            variables: ['customerName', 'discount', 'catalogUrl'],
            usageCount: 42,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-03-15').toISOString(),
        },
        {
            userId: 'demo-user-1',
            name: 'Festive Diwali Discount',
            content: 'Happy Diwali {{customerName}}! ✨ Celebrate with {{discount}}% OFF on your favorite items. Special festive offer valid till midnight! Shop now: {{catalogUrl}}',
            category: 'offer',
            variables: ['customerName', 'discount', 'catalogUrl'],
            usageCount: 38,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-03-10').toISOString(),
        },
        {
            userId: 'demo-user-1',
            name: 'New Product Launch',
            content: 'Hello {{customerName}}! 🚀 Exciting news! We just launched {{productName}} at an introductory price of ₹{{price}}. Be among the first to own it! Check it out: {{catalogUrl}}',
            category: 'new_arrival',
            variables: ['customerName', 'productName', 'price', 'catalogUrl'],
            usageCount: 35,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-03-08').toISOString(),
        },
        {
            userId: 'demo-user-1',
            name: 'Summer Collection Arrived',
            content: 'Hey {{customerName}}! ☀️ Our Summer 2024 collection is here! Discover trending {{productName}} starting at just ₹{{price}}. Limited stock available: {{catalogUrl}}',
            category: 'new_arrival',
            variables: ['customerName', 'productName', 'price', 'catalogUrl'],
            usageCount: 40,
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-03-12').toISOString(),
        },
        {
            userId: 'demo-user-1',
            name: 'Product Back in Stock',
            content: 'Good news {{customerName}}! 📦 {{productName}} is BACK IN STOCK! Grab yours now at ₹{{price}} before it sells out again: {{catalogUrl}}',
            category: 'restock',
            variables: ['customerName', 'productName', 'price', 'catalogUrl'],
            usageCount: 12,
            createdAt: new Date('2024-02-05').toISOString(),
            updatedAt: new Date('2024-03-05').toISOString(),
        },
        {
            userId: 'demo-user-1',
            name: 'Order Follow Up',
            content: "Hi {{customerName}}! 😊 Hope you loved your recent purchase of {{productName}}! We'd love to hear your feedback. Also, check out similar products: {{catalogUrl}}",
            category: 'follow_up',
            variables: ['customerName', 'productName', 'catalogUrl'],
            usageCount: 18,
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: new Date('2024-03-14').toISOString(),
        },
        {
            userId: 'demo-user-1',
            name: 'Abandoned Cart Reminder',
            content: 'Hello {{customerName}}! 🛒 You left {{productName}} in your cart. Complete your purchase now and get {{discount}}% OFF! Hurry, offer expires soon: {{catalogUrl}}',
            category: 'follow_up',
            variables: ['customerName', 'productName', 'discount', 'catalogUrl'],
            usageCount: 15,
            createdAt: new Date('2024-02-15').toISOString(),
            updatedAt: new Date('2024-03-11').toISOString(),
        },
    ];

    await db.insert(templates).values(sampleTemplates);

    console.log('✅ Templates seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});