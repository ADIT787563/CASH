CREATE TABLE `message_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`campaign_id` integer,
	`phone` text NOT NULL,
	`message_type` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`last_attempt_at` text,
	`error_message` text,
	`delivery_status` text,
	`sent_at` text,
	`delivered_at` text,
	`read_at` text,
	`failed_at` text,
	`error_code` text,
	`scheduled_for` text,
	`processed_at` text,
	`whatsapp_message_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `webhook_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`event_id` text NOT NULL,
	`raw_payload` text NOT NULL,
	`processed` integer DEFAULT false NOT NULL,
	`processed_at` text,
	`error_message` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `webhook_logs_event_id_unique` ON `webhook_logs` (`event_id`);--> statement-breakpoint
ALTER TABLE `campaigns` ADD `failed_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `clicked_count` integer DEFAULT 0 NOT NULL;