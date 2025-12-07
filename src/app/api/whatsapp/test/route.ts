import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { WhatsAppClient } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const userId = session.user.id;
        const body = await request.json();
        const { to } = body;

        if (!to) {
            return NextResponse.json({ error: 'Recipient phone number is required' }, { status: 400 });
        }

        const client = await WhatsAppClient.getClient(userId);
        if (!client) {
            return NextResponse.json({ error: 'WhatsApp settings not configured or inactive' }, { status: 400 });
        }

        const result = await client.sendTextMessage(to, "Hello from WaveGroww! Your WhatsApp connection is working correctly. 🚀");

        return NextResponse.json({ success: true, result });

    } catch (error: any) {
        console.error('Error sending test message:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
