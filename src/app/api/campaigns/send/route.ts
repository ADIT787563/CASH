import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messageQueue, campaigns } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import { requirePermission } from '@/lib/rbac';
import { logCampaignAction } from '@/lib/audit-logger';

/**
 * Campaign Send API
 * URL: POST /api/campaigns/send
 * 
 * Queues messages for a campaign instead of sending directly
 * This prevents rate limiting and enables reliable delivery
 * 
 * Requires: Owner, Admin, or Manager role
 */

export const POST = requirePermission('RUN_CAMPAIGNS')(async (request: NextRequest, user) => {
    try {
        // Parse request body
        const body = await request.json();
        const { campaignId, recipients, messageType = 'text', payload } = body;

        // Validate inputs
        if (!campaignId || typeof campaignId !== 'number') {
            return NextResponse.json(
                { error: 'Valid campaign ID is required' },
                { status: 400 }
            );
        }

        if (!Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json(
                { error: 'Recipients array is required and must not be empty' },
                { status: 400 }
            );
        }

        if (!payload || typeof payload !== 'object') {
            return NextResponse.json(
                { error: 'Message payload is required' },
                { status: 400 }
            );
        }

        // Verify user owns the campaign
        const campaign = await db
            .select()
            .from(campaigns)
            .where(and(
                eq(campaigns.id, campaignId),
                eq(campaigns.userId, user.id)
            ))
            .limit(1);

        if (campaign.length === 0) {
            return NextResponse.json(
                { error: 'Campaign not found or access denied' },
                { status: 404 }
            );
        }

        // Prepare messages for queue
        const now = new Date().toISOString();
        const queueMessages = recipients.map((phone: string) => ({
            id: crypto.randomUUID(),
            userId: user.id,
            campaignId: campaignId,
            phone: phone.trim(),
            messageType: messageType,
            payload: payload,
            status: 'pending',
            attempts: 0,
            maxAttempts: 3,
            createdAt: now,
            updatedAt: now,
        }));

        // Bulk insert into message queue
        console.log(`📥 Queuing ${queueMessages.length} messages for campaign ${campaignId}`);

        await db.insert(messageQueue).values(queueMessages);

        // Update campaign target count
        await db
            .update(campaigns)
            .set({
                targetCount: campaign[0].targetCount + queueMessages.length,
                status: 'running',
                updatedAt: now,
            })
            .where(eq(campaigns.id, campaignId));

        console.log(`✅ Successfully queued ${queueMessages.length} messages`);

        // Log the campaign send action
        await logCampaignAction(
            user.id,
            'send',
            campaign[0].id.toString(),
            campaign[0].name,
            {
                recipientCount: queueMessages.length,
                templateId: campaign[0].templateId,
                messageType,
            },
            request
        );

        // Return success response
        return NextResponse.json({
            success: true,
            campaignId: campaignId,
            queued: queueMessages.length,
            message: `${queueMessages.length} messages queued successfully`,
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Campaign send error:', error);
        return NextResponse.json(
            {
                error: 'Failed to queue messages',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
});
