import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatbotSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await db.select()
            .from(chatbotSettings)
            .where(eq(chatbotSettings.userId, user.id))
            .limit(1);

        if (settings.length === 0) {
            return NextResponse.json({
                enabled: false,
                mode: 'hybrid',
                confidenceThreshold: 0.8,
                businessHoursEnabled: true,
            });
        }

        const data = settings[0];

        // Map DB -> Frontend
        return NextResponse.json({
            enabled: data.enabled,
            mode: data.fallbackMode === 'template' ? 'templates_only' :
                data.fallbackMode === 'ai_only' ? 'ai_only' : 'hybrid',
            confidenceThreshold: (data.confidenceThreshold || 80) / 100,
            businessHoursEnabled: data.businessHoursOnly,
        });
    } catch (error) {
        console.error('Error fetching AI settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            enabled,
            mode,
            confidenceThreshold,
            businessHoursEnabled
        } = body;

        const [existing] = await db.select()
            .from(chatbotSettings)
            .where(eq(chatbotSettings.userId, user.id))
            .limit(1);

        const now = new Date().toISOString();

        // Map Frontend -> DB
        const fallbackMode = mode === 'templates_only' ? 'template' :
            mode === 'ai_only' ? 'ai_only' : 'hybrid';

        const dbConfidence = Math.round((confidenceThreshold || 0.8) * 100);

        const values = {
            enabled: enabled ?? false,
            fallbackMode: fallbackMode,
            confidenceThreshold: dbConfidence,
            businessHoursOnly: businessHoursEnabled ?? false,
            updatedAt: now,
        };

        if (existing) {
            await db.update(chatbotSettings)
                .set(values)
                .where(eq(chatbotSettings.userId, user.id));
        } else {
            await db.insert(chatbotSettings).values({
                userId: user.id,
                autoReply: true, // Default
                language: 'en',
                tone: 'friendly',
                ...values,
                createdAt: now,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating AI settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
