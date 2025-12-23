import 'dotenv/config';
import { db } from '@/db/index';
import { user, products, templates, leads, messages } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function seed() {
    console.log('🌱 Starting seed...');

    // 1. Get the first user
    const users = await db.select().from(user).limit(1);
    if (users.length === 0) {
        console.error('❌ No users found. Please sign up first.');
        process.exit(1);
    }
    const mainUser = users[0];
    console.log(`👤 Seeding for user: ${mainUser.name} (${mainUser.email})`);

    // 2. Add Default Product (if none)
    const existingProducts = await db.select().from(products).where(eq(products.userId, mainUser.id)).limit(1);
    if (existingProducts.length === 0) {
        await db.insert(products).values({
            userId: mainUser.id,
            name: 'Classic White T-Shirt',
            description: 'Premium cotton t-shirt, breathable and durable.',
            price: 999, // 9.99
            stock: 100,
            category: 'Clothing',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        console.log('✅ Created default product.');
    } else {
        console.log('ℹ️ Product already exists, skipping.');
    }

    // 3. Add Default Template (if none)
    const existingTemplates = await db.select().from(templates).where(eq(templates.userId, mainUser.id)).limit(1);
    if (existingTemplates.length === 0) {
        await db.insert(templates).values({
            userId: mainUser.id,
            name: 'welcome_discount',
            category: 'marketing',
            content: 'Hi {{1}}, welcome up to our store! Use code WELCOME10 for 10% off your first order.',
            status: 'approved',
            language: 'en',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        console.log('✅ Created default template.');
    } else {
        console.log('ℹ️ Template already exists, skipping.');
    }

    // 4. Add Default Lead (for Inbox)
    const existingLeads = await db.select().from(leads).where(eq(leads.userId, mainUser.id)).limit(1);
    let leadId = existingLeads.length > 0 ? existingLeads[0].id : null;

    if (!leadId) {
        const [newLead] = await db.insert(leads).values({
            userId: mainUser.id,
            name: 'Rahul Sharma',
            phone: '+919876543210',
            source: 'website',
            status: 'new',
            lastMessage: 'Is this available?',
            lastContacted: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }).returning();
        leadId = newLead.id;
        console.log('✅ Created default lead: Rahul Sharma.');
    } else {
        console.log('ℹ️ Lead already exists, using existing.');
    }

    // 5. Add Messages for the Lead
    if (leadId) {
        const existingMessages = await db.select().from(messages).where(eq(messages.leadId, leadId)).limit(1);
        if (existingMessages.length === 0) {
            await db.insert(messages).values([
                {
                    userId: mainUser.id,
                    leadId: leadId,
                    direction: 'inbound',
                    fromNumber: '+919876543210',
                    toNumber: 'BUSINESS_PHONE', // Placeholder
                    content: 'Hi, is this T-Shirt available in Black?',
                    messageType: 'text',
                    status: 'read',
                    phoneNumber: '+919876543210',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
                    createdAt: new Date().toISOString(),
                },
                {
                    userId: mainUser.id,
                    leadId: leadId,
                    direction: 'outbound',
                    fromNumber: 'BUSINESS_PHONE',
                    toNumber: '+919876543210',
                    content: 'Yes! We have Black, White, and Navy Blue in stock.',
                    messageType: 'text',
                    status: 'read',
                    phoneNumber: '+919876543210',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(), // 1.5 hours ago
                    createdAt: new Date().toISOString(),
                }
            ]);
            console.log('✅ Created default conversation messages.');
        } else {
            console.log('ℹ️ Messages already exist, skipping.');
        }
    }

    console.log('✨ Seed completed!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
