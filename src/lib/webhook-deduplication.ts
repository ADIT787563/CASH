import { db } from '@/db';
import { webhookEvents } from '@/db/schema';
import { eq, lt } from 'drizzle-orm';

/**
 * Webhook Deduplication Utility
 * 
 * Prevents processing duplicate webhook events from WhatsApp
 */

export async function isDuplicateWebhook(
    eventId: string,
    messageId?: string
): Promise<boolean> {
    try {
        const [existing] = await db
            .select()
            .from(webhookEvents)
            .where(eq(webhookEvents.eventId, eventId))
            .limit(1);

        return !!existing;
    } catch (error) {
        console.error('Duplicate webhook check error:', error);
        return false;
    }
}

export async function markWebhookProcessed(
    eventId: string,
    messageId: string | undefined,
    source: string
): Promise<void> {
    const now = new Date().toISOString();

    try {
        await db.insert(webhookEvents).values({
            eventId,
            messageId: messageId || null,
            source,
            processed: true,
            createdAt: now,
        });

        console.log(`✓ Webhook event ${eventId} marked as processed`);
    } catch (error) {
        if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
            console.log(`⚠️ Webhook event ${eventId} already processed (race condition)`);
        } else {
            console.error('Mark webhook processed error:', error);
        }
    }
}

export async function cleanupOldWebhookEvents(): Promise<number> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    try {
        const result = await db
            .delete(webhookEvents)
            .where(lt(webhookEvents.createdAt, sevenDaysAgo.toISOString()));

        const deleted = (result as any).rowsAffected || 0;
        console.log(`🧹 Cleaned up ${deleted} old webhook events`);
        return deleted;
    } catch (error) {
        console.error('Cleanup webhook events error:', error);
        return 0;
    }
}

export async function getWebhookStats(): Promise<{
    total: number;
    last24Hours: number;
}> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
        const allEvents = await db.select().from(webhookEvents);
        const recentEvents = await db
            .select()
            .from(webhookEvents)
            .where(lt(webhookEvents.createdAt, oneDayAgo.toISOString()));

        return {
            total: allEvents.length,
            last24Hours: recentEvents.length,
        };
    } catch (error) {
        console.error('Get webhook stats error:', error);
        return { total: 0, last24Hours: 0 };
    }
}
