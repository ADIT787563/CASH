import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contentSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/config/content - Fetch all content settings
export async function GET() {
    try {
        const content = await db.select().from(contentSettings);

        // Transform to key-value object
        const contentMap = content.reduce((acc, item) => {
            try {
                acc[item.key] = JSON.parse(item.value as string);
            } catch {
                acc[item.key] = item.value;
            }
            return acc;
        }, {} as Record<string, any>);

        return NextResponse.json(contentMap, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('Error fetching content settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch content settings' },
            { status: 500 }
        );
    }
}

// PUT /api/config/content/:key - Update content setting (admin only)
export async function PUT(request: NextRequest) {
    try {
        // TODO: Add admin authentication check

        const body = await request.json();
        const { key, value } = body;

        if (!key) {
            return NextResponse.json({ error: 'Key required' }, { status: 400 });
        }

        const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);

        await db
            .update(contentSettings)
            .set({ value: jsonValue, updatedAt: new Date() })
            .where(eq(contentSettings.key, key));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating content setting:', error);
        return NextResponse.json(
            { error: 'Failed to update content setting' },
            { status: 500 }
        );
    }
}
