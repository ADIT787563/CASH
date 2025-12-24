import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, messageQueue, leads, templates } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const campaignId = parseInt(id);

        if (isNaN(campaignId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Fetch Campaign
        const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId));
        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        // Fetch Template
        const [template] = await db.select().from(templates).where(eq(templates.id, campaign.templateId as number));
        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 400 });
        }

        // Fetch Target Audience
        // Fetch Target Audience based on Config
        let targetLeads: any[] = [];
        const config = campaign.audienceConfig as { type: string; value?: string };

        if (config?.type === 'all') {
            targetLeads = await db.select().from(leads).where(eq(leads.userId, session.user.id));
        } else if (config?.type === 'tag' && config.value) {
            // Future implementation for tags
            // For now, if tag logic isn't ready, we return empty or error.
            // targetLeads = await db.select().from(leads).where(and(eq(leads.userId, session.user.id), like(leads.tags, `%${config.value}%`)));
            targetLeads = [];
        } else {
            // Fallback to all for safety or empty
            targetLeads = await db.select().from(leads).where(eq(leads.userId, session.user.id));
        }

        if (targetLeads.length === 0) {
            return NextResponse.json({ error: "No leads found for audience" }, { status: 400 });
        }

        // Queue Messages
        const queueItems = targetLeads.map(lead => ({
            userId: session.user.id,
            campaignId: campaignId,
            phone: lead.phone,
            messageType: 'template',
            payload: {
                templateName: template.name,
                language: template.language,
                variables: [] // Logic to fill variables would go here
            },
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));

        // Batch insert queue items
        // Note: Drizzle supports batch insert. For very large lists, we should chunk this.
        await db.insert(messageQueue).values(queueItems);

        // Update Campaign Status
        await db.update(campaigns)
            .set({
                status: 'sending',
                targetCount: targetLeads.length,
                updatedAt: new Date().toISOString()
            })
            .where(eq(campaigns.id, campaignId));

        const userId = session.user.id;

        // --- IMMEDIATE PROCESSING (MVP) ---
        // In a real production app, this should be a background job.
        // For Vercel Serverless, we'll process keys asynchronously but we can't guarantee execution if the request times out.
        // Better approach for MVP: Process a batch (e.g., 5-10) and let the rest handled by a cron, 
        // OR just try to process all if the list is small (<50). 
        // We will attempt to process all, but catch errors.

        (async () => {
            try {
                const client = await import("@/lib/whatsapp").then(m => m.WhatsAppClient.getClient(userId));

                if (!client) {
                    console.error("No WhatsApp client found for user", userId);
                    return;
                }

                // Since matching mapped items to DB rows is tricky without IDs,
                // A better pattern for this "Fire & Forget" MVP:
                // 1. Fetch pending items for this campaign.
                const pendingItems = await db.select().from(messageQueue)
                    .where(eq(messageQueue.campaignId, campaignId));

                for (const item of pendingItems) {
                    try {
                        await client.sendTemplateMessage(
                            item.phone,
                            template.name,
                            template.language || 'en'
                        );

                        await db.update(messageQueue)
                            .set({ status: 'sent', sentAt: new Date().toISOString() })
                            .where(eq(messageQueue.id, item.id));
                    } catch (e) {
                        console.error("Send error", e);
                        await db.update(messageQueue)
                            .set({ status: 'failed', errorMessage: String(e) })
                            .where(eq(messageQueue.id, item.id));
                    }
                }

                // Update Campaign to completed
                await db.update(campaigns)
                    .set({ status: 'completed', sentCount: pendingItems.length })
                    .where(eq(campaigns.id, campaignId));

            } catch (backgroundError) {
                console.error("Background processing error", backgroundError);
            }
        })();

        return NextResponse.json({ success: true, queued: targetLeads.length });
    } catch (error) {
        console.error("Error sending campaign:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
