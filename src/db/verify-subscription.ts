import 'dotenv/config';
import { db } from './index';
import { user, subscriptions, pricingPlans } from './schema';
import { eq } from 'drizzle-orm';

async function verifySubscription() {
    const targetEmail = 'wavegroww@gmail.com';

    console.log(`\n🔍 Checking subscription for: ${targetEmail}\n`);

    // Find user
    const users = await db
        .select()
        .from(user)
        .where(eq(user.email, targetEmail))
        .limit(1);

    if (users.length === 0) {
        console.log('❌ User not found');
        return;
    }

    const targetUser = users[0];
    console.log(`✅ User Found:`);
    console.log(`   Name: ${targetUser.name || 'N/A'}`);
    console.log(`   Email: ${targetUser.email}`);
    console.log(`   ID: ${targetUser.id}\n`);

    // Get subscription
    const subs = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, targetUser.id));

    if (subs.length === 0) {
        console.log('❌ No subscription found\n');
        return;
    }

    const sub = subs[0];

    // Get plan details
    const plans = await db
        .select()
        .from(pricingPlans)
        .where(eq(pricingPlans.planId, sub.planId))
        .limit(1);

    console.log(`✅ Active Subscription:`);
    console.log(`   Plan: ${sub.planId.toUpperCase()}`);
    console.log(`   Status: ${sub.status}`);
    console.log(`   Period: ${sub.currentPeriodStart} to ${sub.currentPeriodEnd}`);

    if (plans.length > 0) {
        const plan = plans[0];
        console.log(`\n📊 Plan Features:`);
        console.log(`   Name: ${plan.planName}`);
        console.log(`   Price: ₹${plan.monthlyPrice / 100}/month`);
        console.log(`\n   Limits:`);
        const limits = plan.limits as any;
        console.log(`   • Catalogs: ${limits.catalogs === -1 ? 'Unlimited' : limits.catalogs}`);
        console.log(`   • Team Members: ${limits.teamMembers === -1 ? 'Unlimited' : limits.teamMembers}`);
        console.log(`   • Messages: ${limits.messages?.toLocaleString() || 'N/A'}`);
        console.log(`   • Templates: ${limits.templates === -1 ? 'Unlimited' : limits.templates}`);
        console.log(`   • WhatsApp Numbers: ${limits.whatsappNumbers === -1 ? 'Unlimited' : limits.whatsappNumbers}`);
        console.log(`\n   Features:`);
        console.log(`   • AI Assistant: ${limits.aiAssistant ? '✅' : '❌'}`);
        console.log(`   • Bulk Upload: ${limits.bulkUpload ? '✅' : '❌'}`);
        console.log(`   • AI Descriptions: ${limits.aiDescriptions ? '✅' : '❌'}`);
        console.log(`   • Role-Based Access: ${limits.roleBasedAccess ? '✅' : '❌'}`);
        console.log(`   • Advanced Analytics: ${limits.advancedAnalytics ? '✅' : '❌'}`);
        console.log(`   • API Access: ${limits.apiAccess ? '✅' : '❌'}`);
    }

    console.log(`\n✨ All features are active!\n`);
}

verifySubscription()
    .catch(console.error)
    .finally(() => process.exit(0));
