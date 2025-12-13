import { sql } from 'drizzle-orm';
import 'dotenv/config';
import { db } from './index';
import { pricingPlans, contentSettings, featureFlags } from './schema';

async function seed() {
    console.log('🌱 Seeding global configuration...');

    // Seed Pricing Plans with comprehensive catalog limits
    // @ts-ignore
    await db.insert(pricingPlans).values([
        {
            planId: 'starter',
            planName: 'Basic',
            monthlyPrice: 99900, // ₹999
            yearlyPrice: 999000, // ₹9,990 (2 months free)
            features: [
                'Maximum 20 product catalogs',
                'Basic product fields only',
                'Up to 250 messages/month',
                '1 WhatsApp number',
                'Basic order form',
                'Auto-invoice (Simple, No GST)',
                'Basic analytics dashboard',
                'Single user only',
                'Email support',
            ],
            limits: {
                messages: 250,
                whatsappNumbers: 1,
                templates: 5,
                leads: 500,
                catalogs: 20,
                teamMembers: 1,
                aiAssistant: false,
                productFields: 'basic',
                bulkUpload: false,
                aiDescriptions: false,
                roleBasedAccess: false,
                advancedAnalytics: false,
                apiAccess: false,
            },
            icon: 'Zap',
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            isPopular: false,
            isActive: true,
            sortOrder: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            planId: 'growth',
            planName: 'Growth',
            monthlyPrice: 169900, // ₹1,699
            yearlyPrice: 1699000, // ₹16,990 (2 months free)
            features: [
                'Maximum 40 product catalogs',
                'Advanced product fields (Variants, Tags)',
                'Up to 800 messages/month',
                '3 WhatsApp numbers',
                'Advanced Invoice (GST, PDF)',
                'Revenue chart & Top customers',
                'Up to 3 team members',
                'Basic Webhooks & API',
                'Auto follow-up & Abandoned cart',
                'Priority support',
            ],
            limits: {
                messages: 800,
                whatsappNumbers: 3,
                templates: 40,
                leads: 2000,
                catalogs: 40,
                teamMembers: 3,
                aiAssistant: true,
                productFields: 'advanced',
                bulkUpload: false,
                aiDescriptions: false,
                roleBasedAccess: false,
                advancedAnalytics: false,
                apiAccess: true, // Basic API
                autoReplySuggestions: true,
                autoFollowUp: true,
                customerNotes: true,
            },
            icon: 'TrendingUp',
            color: 'text-accent',
            bgColor: 'bg-accent/10',
            isPopular: true,
            isActive: true,
            sortOrder: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            planId: 'pro',
            planName: 'Pro / Agency',
            monthlyPrice: 500, // ₹5 (Testing)
            yearlyPrice: 5000, // ₹50 (Testing)
            features: [
                'Maximum 130 product catalogs',
                'Bulk upload (Excel/CSV)',
                'Unlimited automated replies',
                'AI-powered auto-reply',
                '10 WhatsApp numbers',
                'Branded Invoices (Logo + Colors)',
                'Full Analytics & Conversion rates',
                'Up to 10 team members (Roles)',
                'Full API Access & Webhooks',
                'Payment QR on invoice',
            ],
            limits: {
                messages: -1, // Unlimited
                whatsappNumbers: 10,
                templates: 120,
                leads: 8000,
                catalogs: 130,
                teamMembers: 10,
                aiAssistant: true,
                productFields: 'full',
                bulkUpload: true,
                aiDescriptions: true,
                roleBasedAccess: true,
                advancedAnalytics: true,
                apiAccess: true,
                autoReplySuggestions: true,
                autoFollowUp: true,
                customerNotes: true,
                workflowAutomation: true,
            },
            icon: 'Crown',
            color: 'text-secondary',
            bgColor: 'bg-secondary/10',
            isPopular: false,
            isActive: true,
            sortOrder: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            planId: 'enterprise',
            planName: 'Enterprise',
            monthlyPrice: 899900, // ₹8,999
            yearlyPrice: null,
            features: [
                'Custom catalog limit (200-Unlimited)',
                'AI Chatbot (NLP) & Smart Replies',
                'Unlimited WhatsApp numbers',
                'Fully customizable checkout API',
                'White-label & Custom Invoices',
                'BI Dashboard & Custom Reports',
                'Unlimited team members & Audit logs',
                'Complete API Suite & ERP Sync',
                'Dedicated Account Manager',
            ],
            limits: {
                messages: -1, // Unlimited
                whatsappNumbers: -1, // Unlimited
                templates: -1,
                leads: -1,
                catalogs: -1, // Unlimited/Custom
                teamMembers: -1, // Unlimited
                aiAssistant: true,
                productFields: 'full',
                bulkUpload: true,
                aiDescriptions: true,
                roleBasedAccess: true,
                advancedAnalytics: true,
                apiAccess: true,
                autoReplySuggestions: true,
                autoFollowUp: true,
                customerNotes: true,
                workflowAutomation: true,
                whiteLabel: true,
                dedicatedSupport: true,
                customIntegrations: true,
                priorityApproval: true,
            },
            icon: 'Building2',
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            isPopular: false,
            isActive: true,
            sortOrder: 4,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ]).onConflictDoUpdate({
        target: pricingPlans.planId,
        set: {
            planName: sql`excluded.plan_name`,
            monthlyPrice: sql`excluded.monthly_price`,
            yearlyPrice: sql`excluded.yearly_price`,
            features: sql`excluded.features`,
            limits: sql`excluded.limits`,
            icon: sql`excluded.icon`,
            color: sql`excluded.color`,
            bgColor: sql`excluded.bg_color`,
            isPopular: sql`excluded.is_popular`,
            isActive: sql`excluded.is_active`,
            sortOrder: sql`excluded.sort_order`,
            updatedAt: sql`excluded.updated_at`,
        }
    });

    // Seed Content Settings
    await db.insert(contentSettings).values([
        {
            key: 'hero_title',
            value: JSON.stringify('WaveGroww — WhatsApp Automation for Indian Sellers'),
            category: 'hero',
            description: 'Main hero section title',
        },
        {
            key: 'hero_subtitle',
            value: JSON.stringify('Automate conversations, capture leads, and sell more — 24/7. Built for Meesho, Shopify, and small local shops.'),
            category: 'hero',
            description: 'Hero section subtitle',
        },
        {
            key: 'hero_cta_primary',
            value: JSON.stringify('Start 3-Day Trial'),
            category: 'hero',
            description: 'Primary CTA button text',
        },
        {
            key: 'hero_cta_secondary',
            value: JSON.stringify('View Plans'),
            category: 'hero',
            description: 'Secondary CTA button text',
        },
        {
            key: 'product_page_tagline',
            value: JSON.stringify('Made for Indian Sellers 🇮🇳'),
            category: 'product',
            description: 'Product page tagline badge',
        },
        {
            key: 'pricing_trial_text',
            value: JSON.stringify('3-day limited-feature trial — no card required'),
            category: 'pricing',
            description: 'Trial information text',
        },
        {
            key: 'features_section_title',
            value: JSON.stringify('Everything You Need to Automate & Scale'),
            category: 'features',
            description: 'Features section main title',
        },
        {
            key: 'testimonials_section_title',
            value: JSON.stringify('Loved by Indian Sellers'),
            category: 'testimonials',
            description: 'Testimonials section title',
        },
    ]).onConflictDoUpdate({
        target: contentSettings.key,
        set: {
            value: sql`excluded.value`,
            category: sql`excluded.category`,
            description: sql`excluded.description`,
        }
    });

    // Seed Feature Flags
    await db.insert(featureFlags).values([
        {
            featureKey: 'new_dashboard',
            isEnabled: true,
            description: 'Enable the new dashboard layout',
        },
        {
            featureKey: 'ai_assistant',
            isEnabled: true,
            description: 'Enable AI assistant features globally',
        },
        {
            featureKey: 'advanced_analytics',
            isEnabled: false,
            description: 'Enable advanced analytics dashboard',
        },
        {
            featureKey: 'catalog_limits',
            isEnabled: true,
            description: 'Enable catalog limit enforcement',
        },
    ]).onConflictDoUpdate({
        target: featureFlags.featureKey,
        set: {
            isEnabled: sql`excluded.is_enabled`,
            description: sql`excluded.description`,
        }
    });

    console.log('✅ Global configuration seeded successfully!');
}

seed()
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });
