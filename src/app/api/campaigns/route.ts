import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { campaigns, templates } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET /api/campaigns - List campaigns
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCampaigns = await db.select()
      .from(campaigns)
      .where(eq(campaigns.userId, session.user.id))
      .orderBy(desc(campaigns.createdAt));

    return NextResponse.json(userCampaigns);
  } catch (error) {
    console.error('Fetch Campaigns Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/campaigns - Create campaign
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, templateId, audienceConfig, scheduledAt } = body;

    if (!name || !templateId) {
      return NextResponse.json({ error: 'Name and Template are required' }, { status: 400 });
    }

    // Validate template ownership
    const template = await db.query.templates.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, templateId), eq(t.userId, session.user.id))
    });

    if (!template) {
      return NextResponse.json({ error: 'Invalid Template' }, { status: 400 });
    }

    const newCampaign = await db.insert(campaigns).values({
      userId: session.user.id,
      name,
      templateId,
      audienceConfig: audienceConfig || { type: 'all' },
      scheduledAt: scheduledAt || null,
      status: scheduledAt ? 'scheduled' : 'draft', // Logic for 'sending' would be in a background worker
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json(newCampaign[0]);

  } catch (error) {
    console.error('Create Campaign Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}