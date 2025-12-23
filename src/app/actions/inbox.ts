'use server';

import { db } from '@/db/index';
import { leads, messages } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export type LeadWithLastMessage = {
    id: number;
    name: string;
    phone: string;
    lastMessage: string | null;
    lastContacted: string | null;
    unreadCount?: number;
};

export async function getConversations(): Promise<LeadWithLastMessage[]> {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        return [];
    }

    // Fetch leads for the current user, ordered by most recently contacted
    const userLeads = await db.select({
        id: leads.id,
        name: leads.name,
        phone: leads.phone,
        lastMessage: leads.lastMessage,
        lastContacted: leads.lastContacted,
    })
        .from(leads)
        .where(eq(leads.userId, session.user.id))
        .orderBy(desc(leads.lastContacted));

    // TODO: Ideally join with messages to get unread count
    return userLeads;
}

export async function getMessages(leadId: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        return [];
    }

    // Ensure the lead belongs to the user for security
    const lead = await db.query.leads.findFirst({
        where: and(eq(leads.id, leadId), eq(leads.userId, session.user.id))
    });

    if (!lead) {
        throw new Error("Unauthorized access to lead");
    }

    const conversation = await db.select()
        .from(messages)
        .where(eq(messages.leadId, leadId))
        .orderBy(messages.createdAt); // Oldest first for chat history

    return conversation;
}

export async function sendMessage(leadId: number, content: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return { error: "Unauthorized" };

    const lead = await db.query.leads.findFirst({
        where: and(eq(leads.id, leadId), eq(leads.userId, session.user.id))
    });

    if (!lead) return { error: "Lead not found" };

    // Insert user message (outbound)
    await db.insert(messages).values({
        userId: session.user.id,
        leadId: leadId,
        direction: 'outbound',
        messageType: 'text',
        content: content,
        fromNumber: 'BUSINESS_PHONE', // Replace with actual business number logic later
        toNumber: lead.phone,
        phoneNumber: lead.phone,
        status: 'sent',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    });

    // Update lead's last message
    await db.update(leads)
        .set({
            lastMessage: content,
            lastContacted: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })
        .where(eq(leads.id, leadId));

    return { success: true };
}
