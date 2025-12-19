import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { chatbotSettings, chatbotSettingsHistory, products, auditLogs } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const config = await db.query.chatbotSettings.findFirst({
            where: eq(chatbotSettings.userId, session.user.id)
        });

        const history = await db.query.chatbotSettingsHistory.findMany({
            where: eq(chatbotSettingsHistory.userId, session.user.id),
            orderBy: desc(chatbotSettingsHistory.createdAt),
            limit: 5
        });

        const activeProducts = await db.select().from(products)
            .where(and(eq(products.userId, session.user.id), eq(products.status, 'active')))
            .orderBy(products.createdAt)
            .limit(20);

        // If no config exists, return null (frontend uses defaults)
        return NextResponse.json({
            config: config || null,
            history,
            products: activeProducts
        });
    } catch (error) {
        console.error("Error fetching AI config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Prepare data for upsert
        const values = {
            userId: session.user.id,
            enabled: body.enabled,
            businessContext: body.businessContext,
            tone: body.tone,
            handoverRule: body.handoverRule,
            confidenceThreshold: Math.round(body.confidenceThreshold * 100), // Store as integer (0-100)
            businessHoursConfig: body.businessHours, // JSON field
            fallbackMode: body.fallbackMode,
            fallbackMessage: body.fallbackMessage,
            keywordTriggers: body.keywordTriggers ? JSON.stringify(body.keywordTriggers) : null,
            autoReplyTemplates: body.autoReplyTemplates ? JSON.stringify(body.autoReplyTemplates) : null,
            updatedAt: new Date().toISOString(),
        };

        // Note: created_at is required on insert
        const insertValues = {
            ...values,
            createdAt: new Date().toISOString(),
        };

        const [existing] = await db.select().from(chatbotSettings).where(eq(chatbotSettings.userId, session.user.id)).limit(1);

        if (existing) {
            // Archive current state before update
            await db.insert(chatbotSettingsHistory).values({
                settingId: existing.id,
                userId: session.user.id,
                configSnapshot: existing,
                createdAt: new Date().toISOString(),
            });

            await db.update(chatbotSettings)
                .set(values)
                .where(eq(chatbotSettings.id, existing.id));
        } else {
            await db.insert(chatbotSettings)
                .values(insertValues);
        }

        // AG-106: Audit Log
        try {
            await db.insert(auditLogs).values({
                userId: session.user.id,
                action: 'settings_changed',
                description: 'Chatbot configuration updated',
                itemType: 'settings',
                itemId: 'chatbot',
                category: 'user_action',
                severity: 'info',
                createdAt: new Date().toISOString()
            });
        } catch (auditError) {
            console.warn("Failed to create audit log:", auditError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving AI config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
