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
        // Simplified: 'all'
        const targetLeads = await db.select().from(leads).where(eq(leads.userId, session.user.id));

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

        return NextResponse.json({ success: true, queued: targetLeads.length });
    } catch (error) {
        console.error("Error sending campaign:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
