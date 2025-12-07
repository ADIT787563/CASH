import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messageQueue, campaigns } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { retryWhatsAppAPI, whatsappCircuitBreaker } from '@/lib/retry-logic';
import { mapWhatsAppError, createError, isRetryableError } from '@/lib/error-codes';
import { isSystemLocked } from '@/lib/kill-switch';
import { logUserAction } from '@/lib/audit-logger';

/**
 * Queue Worker API
 * URL: POST /api/queue/worker
 * 
 * Processes pending messages in batches
 * Features: Rate limiting, retry logic, atomic updates
 * 
 * Call this endpoint from a cron job every 1-2 seconds
 */

const BATCH_SIZE = 15; // Process 15 messages per batch
const MAX_ATTEMPTS = 5; // Max retry attempts (with exponential backoff)
const MESSAGE_DELAY = 2000; // 2 seconds delay between messages

export async function POST(request: NextRequest) {
    try {
        // Security: Only allow internal calls or cron jobs
        const authHeader = request.headers.get('authorization');
        const workerSecret = process.env.WORKER_SECRET;

        if (!workerSecret) {
            console.error('WORKER_SECRET not configured');
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
        }

        if (authHeader !== `Bearer ${workerSecret}`) {
            console.error('❌ Unauthorized worker access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check kill switch
        if (await isSystemLocked()) {
            console.log('🔒 System locked - skipping message processing');
            return NextResponse.json({
                message: 'System in maintenance mode',
                processed: 0
            });
        }

        // 1. Fetch pending messages
        const messages = await db
            .select()
            .from(messageQueue)
            .where(eq(messageQueue.status, 'pending'))
            .limit(BATCH_SIZE);

        if (messages.length === 0) {
            return NextResponse.json({
                message: 'Queue empty',
                processed: 0
            });
        }

        console.log(`📦 Processing batch of ${messages.length} messages`);

        // 2. Mark as processing
        const messageIds = messages.map(m => m.id);
        for (const id of messageIds) {
            await db
                .update(messageQueue)
                .set({
                    status: 'processing',
                    updatedAt: new Date().toISOString()
                })
                .where(eq(messageQueue.id, id));
        }

        // 3. Send messages
        const results = {
            sent: 0,
            failed: 0,
            retrying: 0
        };

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];

            try {
                // Send to WhatsApp API with retry logic
                const response = await retryWhatsAppAPI(
                    () => sendToWhatsApp(msg),
                    (attempt, error) => {
                        console.log(`🔄 Retry attempt ${attempt} for message ${msg.id}:`, error.message);
                    }
                );

                // Mark as sent
                await db
                    .update(messageQueue)
                    .set({
                        status: 'sent',
                        whatsappMessageId: response.messageId,
                        processedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    })
                    .where(eq(messageQueue.id, msg.id));

                // Update campaign stats
                if (msg.campaignId) {
                    await db
                        .update(campaigns)
                        .set({
                            sentCount: sql`${campaigns.sentCount} + 1`,
                            updatedAt: new Date().toISOString(),
                        })
                        .where(eq(campaigns.id, msg.campaignId));
                }

                results.sent++;
                console.log(`✅ Sent message ${msg.id}`);

                // 2-second delay between messages (WhatsApp rate limiting)
                if (i < messages.length - 1) {
                    await sleep(MESSAGE_DELAY);
                }

            } catch (error: any) {
                // Handle WhatsApp-specific errors
                let errorCode = 'WSP_100_GENERIC_ERROR';
                let errorMessage = error?.message || 'Unknown error';

                // Try to extract WhatsApp error code
                if (error?.response?.data?.error?.code) {
                    const whatsappCode = error.response.data.error.code;
                    errorCode = mapWhatsAppError(whatsappCode);
                    errorMessage = error.response.data.error.message || errorMessage;
                }

                const appError = createError(errorCode as any, {
                    originalError: errorMessage,
                    messageId: msg.id,
                    phone: msg.phone,
                });

                const newAttempts = msg.attempts + 1;
                const shouldRetry = isRetryableError(errorCode as any) && newAttempts < MAX_ATTEMPTS;

                if (shouldRetry) {
                    // Retry: reset to pending
                    await db
                        .update(messageQueue)
                        .set({
                            status: 'pending',
                            attempts: newAttempts,
                            errorCode: appError.code,
                            errorMessage: appError.message,
                            lastAttemptAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        })
                        .where(eq(messageQueue.id, msg.id));

                    results.retrying++;
                    console.log(`🔄 Will retry message ${msg.id} (attempt ${newAttempts}/${MAX_ATTEMPTS})`);

                } else {
                    // Max attempts or non-retryable: mark as failed permanently
                    await db
                        .update(messageQueue)
                        .set({
                            status: 'failed',
                            attempts: newAttempts,
                            errorCode: appError.code,
                            errorMessage: appError.message,
                            lastAttemptAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        })
                        .where(eq(messageQueue.id, msg.id));

                    // Update campaign failed count
                    if (msg.campaignId) {
                        await db
                            .update(campaigns)
                            .set({
                                failedCount: sql`${campaigns.failedCount} + 1`,
                                updatedAt: new Date().toISOString(),
                            })
                            .where(eq(campaigns.id, msg.campaignId));
                    }

                    results.failed++;
                    console.error(`❌ Failed permanently: message ${msg.id} - ${appError.message}`);

                    // Log critical failures
                    if (appError.severity === 'critical') {
                        await logUserAction(
                            msg.userId || 'system',
                            'message_send_failed',
                            `Critical failure sending message: ${appError.message}`,
                            'message',
                            msg.id.toString(),
                            {
                                errorCode: appError.code,
                                phone: msg.phone,
                                campaignId: msg.campaignId,
                            },
                            request
                        );
                    }
                }
            }
        }

        console.log(`📊 Batch complete: ${results.sent} sent, ${results.retrying} retrying, ${results.failed} failed`);

        return NextResponse.json({
            message: 'Batch processed',
            ...results,
            total: messages.length
        });

    } catch (error) {
        console.error('❌ Worker error:', error);
        return NextResponse.json({
            error: 'Worker failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * Send message to WhatsApp API
 * Replace this with your actual WhatsApp API integration
 */
async function sendToWhatsApp(message: any): Promise<{ messageId: string }> {
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!whatsappApiUrl || !whatsappToken) {
        throw createError('WSP_132000_API_DOWN', {
            reason: 'WhatsApp API not configured'
        });
    }

    // Use circuit breaker to prevent overwhelming failed API
    return await whatsappCircuitBreaker.execute(async () => {
        const response = await fetch(whatsappApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${whatsappToken}`,
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: message.phone,
                type: message.messageType,
                ...message.payload,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const whatsappCode = errorData?.error?.code;
            const whatsappMessage = errorData?.error?.message || 'WhatsApp API error';

            // Map WhatsApp error to our error code
            if (whatsappCode) {
                const errorCode = mapWhatsAppError(whatsappCode);
                throw createError(errorCode as any, {
                    whatsappCode,
                    whatsappMessage,
                    phone: message.phone,
                });
            }

            throw createError('WSP_100_GENERIC_ERROR', {
                message: whatsappMessage,
                phone: message.phone,
            });
        }

        const data = await response.json();

        // Return WhatsApp message ID
        return {
            messageId: data.messages?.[0]?.id || `wamid.${Date.now()}`
        };
    });
}

/**
 * Sleep utility for message delay
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
