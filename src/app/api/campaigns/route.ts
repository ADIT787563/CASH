import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, messageQueue, leads } from "@/db/schema";
import { auth } from "@/lib/auth"; // Assuming auth helper exists
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCampaigns = await db.select()
      .from(campaigns)
      .where(eq(campaigns.userId, session.user.id))
      .orderBy(desc(campaigns.createdAt));

    return NextResponse.json(userCampaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, templateId, audienceConfig, status } = body;

    // Calculate target count based on audience
    // For 'all', we count all leads for user
    let targetCount = 0;
    if (audienceConfig.type === 'all') {
      const allLeads = await db.select().from(leads).where(eq(leads.userId, session.user.id));
      targetCount = allLeads.length;
    }

    const [newCampaign] = await db.insert(campaigns).values({
      userId: session.user.id,
      name,
      templateId,
      status: status || 'draft',
      audienceConfig,
      targetCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning();

    return NextResponse.json(newCampaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}