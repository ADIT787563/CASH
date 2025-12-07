import 'dotenv/config';
import { db } from './index';
import { user, subscriptions } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Script to assign a plan to a specific user
 * Usage: npx tsx assign-plan.ts
 */

async function assignPlan() {
    const targetEmail = 'wavegroww@gmail.com';
    const planId = 'agency'; // The pro/premium plan

    console.log(`🔍 Looking for user with email: ${targetEmail}`);

    // Find the user
    const users = await db
        .select()
        .from(user)
        .where(eq(user.email, targetEmail))
        .limit(1);

    if (users.length === 0) {
        console.error(`❌ User not found with email: ${targetEmail}`);
        console.log('\n📝 Please make sure the user has registered first.');
        process.exit(1);
    }

    const targetUser = users[0];
    console.log(`✅ Found user: ${targetUser.name || targetUser.email} (ID: ${targetUser.id})`);

    // Check if subscription already exists
    const existingSubscriptions = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, targetUser.id));

    if (existingSubscriptions.length > 0) {
        console.log(`📋 Existing subscription found. Updating...`);

        // Update existing subscription
        await db
            .update(subscriptions)
            .set({
                planId: planId,
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                cancelAtPeriodEnd: false,
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.userId, targetUser.id));

        console.log(`✅ Subscription updated to '${planId}' plan`);
    } else {
        console.log(`📝 Creating new subscription...`);

        // Create new subscription
        await db.insert(subscriptions).values({
            userId: targetUser.id,
            planId: planId,
            status: 'active',
            provider: 'manual', // Manual assignment
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            cancelAtPeriodEnd: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log(`✅ New subscription created with '${planId}' plan`);
    }

    // Show plan details
    console.log(`\n🎉 Success! Plan assigned:`);
    console.log(`   Email: ${targetEmail}`);
    console.log(`   Plan: Agency (Pro)`);
    console.log(`   Status: Active`);
    console.log(`   Features:`);
    console.log(`   • 100 product catalogs`);
    console.log(`   • Bulk upload (CSV/Excel)`);
    console.log(`   • AI auto-descriptions`);
    console.log(`   • Role-based access (10 team members)`);
    console.log(`   • Advanced analytics`);
    console.log(`   • API & webhooks access`);
    console.log(`   • Up to 15,000 messages/month`);
    console.log(`   • 10 WhatsApp numbers`);
    console.log(`   • 120 templates/month`);
    console.log(`\n✨ The user can now access all Agency plan features!`);
}

assignPlan()
    .catch((error) => {
        console.error('❌ Error assigning plan:', error);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });
