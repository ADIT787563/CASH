import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserPlanLimits, hasExceededLimit } from '@/lib/plan-limits';
import OpenAI from 'openai';
import { z } from 'zod';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generateSchema = z.object({
    prompt: z.string().min(5).max(500),
    category: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']).default('MARKETING'),
    tone: z.string().optional().default('Professional'),
    language: z.string().optional().default('en'),
});

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Check Limits
        const limitType = 'aiTemplateGen' as any; // Cast as we just added it and TS might not know yet if not compiled
        // Note: hasExceededLimit logic needs to support aiTemplateGen. 
        // For now, we'll do a manual check using getUserPlanLimits since hasExceededLimit might need a DB count update we haven't built yet.
        // Actually, for generation, we usually track usage in a separate table or usage counter.
        // Let's assume unlimited for now for simplicity in this MVP step, OR just check the boolean flag/number from limits.

        const { limits } = await getUserPlanLimits(user.id);
        const limit = limits.aiTemplateGen || 0;

        if (limit !== -1 && limit <= 0) {
            return NextResponse.json({
                error: 'Upgrade required',
                message: 'Your plan does not support AI Template Generation.',
                upgrade: true
            }, { status: 403 });
        }

        // TODO: Implement usage tracking (decrement or count)
        // For now, checks if feature is enabled (limit > 0)

        const body = await req.json();
        const validation = generateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
        }

        const { prompt, category, tone, language } = validation.data;

        // 2. Call OpenAI
        const systemPrompt = `You are an expert WhatsApp Marketing copywriter.
Create a high-converting WhatsApp message template based on the user's request.
Category: ${category}
Tone: ${tone}
Language Code: ${language}

Rules:
1. Format placeholders as {{1}}, {{2}}, etc.
2. Keep it concise (under 1024 chars).
3. Include a Header (optional), Body, and Footer (optional).
4. Suggest 2-3 buttons (Quick Reply or Call to Action) if relevant.
5. Output JSON format only: { "name": "template_name_lowercase", "header": "...", "body": "...", "footer": "...", "buttons": [...] }
6. Do NOT markdown the JSON. Just raw JSON.
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o", // or gpt-3.5-turbo
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 500,
            response_format: { type: "json_object" } // Force JSON
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error('No content from AI');

        const parsedContent = JSON.parse(content);

        return NextResponse.json({
            success: true,
            data: parsedContent,
            remaining: limit === -1 ? 'Unlimited' : limit // Mock remaining
        });

    } catch (error) {
        console.error('AI Gen Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
