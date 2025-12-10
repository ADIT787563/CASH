import { NextResponse } from "next/server";

const PLANS = [
    {
        id: "starter",
        name: "Basic",
        price_paise: 99900,
        currency: "INR",
        billing_cycle: "monthly",
        features: [
            "📦 Add up to 20 products",
            "🤖 250 automated replies/mo",
            "📱 1 WhatsApp Number",
            "📊 Basic Analytics"
        ]
    },
    {
        id: "growth",
        name: "Growth",
        price_paise: 169900,
        currency: "INR",
        billing_cycle: "monthly",
        features: [
            "📦 Add up to 40 products",
            "🤖 800 automated replies/mo",
            "📱 3 WhatsApp Numbers",
            "🧾 GST Invoices"
        ]
    },
    {
        id: "pro",
        name: "Pro / Agency",
        price_paise: 399900,
        currency: "INR",
        billing_cycle: "monthly",
        features: [
            "📦 130 products",
            "🤖 Unlimited replies",
            "📱 10 WhatsApp Numbers",
            "👥 Team Roles"
        ]
    },
    {
        id: "scale",
        name: "Enterprise",
        price_paise: 899900,
        currency: "INR",
        billing_cycle: "monthly",
        features: [
            "📦 Unlimited Catalog",
            "🤖 AI Chatbot (NLP)",
            "📱 Unlimited Numbers",
            "🏢 White-label"
        ]
    }
];

export async function GET() {
    return NextResponse.json(PLANS);
}
