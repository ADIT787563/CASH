import { NextResponse } from "next/server";

const PLANS = [
    {
        id: "starter_999",
        name: "Starter",
        price_paise: 99900,
        currency: "INR",
        billing_cycle: "monthly",
        features: ["1 User", "Basic Analytics", "1000 Messages/mo"]
    },
    {
        id: "growth_1699",
        name: "Growth",
        price_paise: 169900,
        currency: "INR",
        billing_cycle: "monthly",
        features: ["3 Users", "Advanced Analytics", "Unlimited Messages"]
    },
    {
        id: "pro_3999",
        name: "Pro",
        price_paise: 399900,
        currency: "INR",
        billing_cycle: "monthly",
        features: ["10 Users", "Custom Domain", "24/7 Support"]
    },
    {
        id: "enterprise_8999",
        name: "Enterprise",
        price_paise: 899900,
        currency: "INR",
        billing_cycle: "monthly",
        features: ["Unlimited Users", "Dedicated Account Manager", "SLA"]
    }
];

export async function GET() {
    return NextResponse.json(PLANS);
}
