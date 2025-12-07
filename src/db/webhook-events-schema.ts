import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { user } from './schema';

// Webhook events table for idempotency
export const webhookEvents = sqliteTable('webhook_events', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    eventId: text('event_id').notNull(), // WhatsApp event ID
    eventType: text('event_type').notNull(), // 'message', 'status', etc.
    payload: text('payload', { mode: 'json' }).notNull(),
    processedAt: text('processed_at').notNull(),
    createdAt: text('created_at').notNull(),
}, (table) => ({
    eventIdIdx: index('webhook_events_event_id_idx').on(table.eventId),
    userIdIdx: index('webhook_events_user_id_idx').on(table.userId),
}));
