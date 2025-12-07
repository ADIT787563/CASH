import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, messages } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { retryWhatsAppAPI } from '@/lib/retry-logic';
import { createError } from '@/lib/error-codes';

/**
 * Inbox Send Message API
 * POST /api/inbox/send
 * 
 * Send a message from the inbox
 */

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { customerId, messageType, messageBody, templateId } = body;

        // Verify customer belongs to user
        const [customer] = await db
            .select()
            .from(customers)
            .where(
                and(
                    eq(customers.id, customerId),
                    eq(customers.userId, user.id)
                )
            )
            .limit(1);

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        const now = new Date().toISOString();

        // Send to WhatsApp API
        const whatsappResponse = await retryWhatsAppAPI(async () => {
            const whatsappApiUrl = process.env.WHATSAPP_API_URL;
            const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;

            if (!whatsappApiUrl || !whatsappToken) {
                throw createError('WSP_132000_API_DOWN', {
                    reason: 'WhatsApp API not configured'
                });
            }

            const payload: any = {
                messaging_product: 'whatsapp',
                to: customer.phone,
                type: messageType,
            };

            if (messageType === 'text') {
                payload.text = { body: messageBody };
            } else if (messageType === 'template' && templateId) {
                payload.template = {
                    name: templateId,
                    language: { code: 'en' },
                };
            }

            const response = await fetch(whatsappApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${whatsappToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw createError('WSP_100_GENERIC_ERROR', {
                    message: errorData?.error?.message || 'WhatsApp API error',
                });
            }

            return await response.json();
        });

        // Save message to database
        const [newMessage] = await db
            .insert(messages)
            .values({
                userId: user.id,
                customerId,
                direction: 'outbound',
                fromNumber: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
                toNumber: customer.phone,
                content: messageBody || '',
                messageType,
                status: 'sent',
                phoneNumber: customer.phone,
                whatsappMessageId: whatsappResponse.messages?.[0]?.id,
                timestamp: now,
                createdAt: now,
            })
            .returning();

        // Update customer's last message
        await db
            .update(customers)
            .set({
                lastMessage: messageBody || `Sent ${messageType}`,
                lastMessageTime: now,
                updatedAt: now,
            })
            .where(eq(customers.id, customerId));

        return NextResponse.json({
            success: true,
            message: newMessage,
        });
    } catch (error: any) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            {
                error: error?.message || 'Failed to send message',
                code: error?.code || 'UNKNOWN',
            },
            { status: 500 }
        );
    }
}
