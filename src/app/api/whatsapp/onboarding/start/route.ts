import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppClient } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phoneNumber } = body;

        if (!phoneNumber) {
            return NextResponse.json(
                { error: 'Phone number is required' },
                { status: 400 }
            );
        }

        const client = WhatsAppClient.getSystemClient();
        await client.sendOnboardingMessage(phoneNumber);

        return NextResponse.json({
            success: true,
            message: 'Onboarding message sent successfully'
        });

    } catch (error: any) {
        console.error('Error sending onboarding message:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
