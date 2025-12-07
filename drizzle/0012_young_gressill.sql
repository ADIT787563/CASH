CREATE TABLE `content_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_settings_key_unique` ON `content_settings` (`key`);--> statement-breakpoint
CREATE TABLE `conversation_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`assigned_to` text NOT NULL,
	`assigned_by` text NOT NULL,
	`assigned_at` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_to`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`phone` text NOT NULL,
	`name` text,
	`email` text,
	`status` text DEFAULT 'new' NOT NULL,
	`assigned_to` text,
	`tags` text,
	`labels` text,
	`last_message` text,
	`last_message_time` text,
	`unread_count` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`total_orders` integer DEFAULT 0 NOT NULL,
	`total_spent` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_to`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `customers_user_id_idx` ON `customers` (`user_id`);--> statement-breakpoint
CREATE INDEX `customers_phone_idx` ON `customers` (`phone`);--> statement-breakpoint
CREATE INDEX `customers_status_idx` ON `customers` (`status`);--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feature_key` text NOT NULL,
	`is_enabled` integer DEFAULT false NOT NULL,
	`config` text,
	`description` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feature_flags_feature_key_unique` ON `feature_flags` (`feature_key`);--> statement-breakpoint
CREATE TABLE `pricing_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_id` text NOT NULL,
	`plan_name` text NOT NULL,
	`monthly_price` integer NOT NULL,
	`yearly_price` integer,
	`features` text NOT NULL,
	`limits` text NOT NULL,
	`icon` text,
	`color` text,
	`bg_color` text,
	`is_popular` integer DEFAULT false,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pricing_plans_plan_id_unique` ON `pricing_plans` (`plan_id`);--> statement-breakpoint
CREATE TABLE `rbac_team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`user_id` text,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role_id` text NOT NULL,
	`status` text DEFAULT 'invited' NOT NULL,
	`invite_token` text,
	`invite_expires_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rbac_team_members_invite_token_unique` ON `rbac_team_members` (`invite_token`);--> statement-breakpoint
CREATE TABLE `role_hierarchy` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`parent_role_id` text NOT NULL,
	`child_role_id` text NOT NULL,
	`order_position` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`child_role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text,
	`role_name` text NOT NULL,
	`description` text,
	`permissions` text NOT NULL,
	`parent_role_id` text,
	`is_system_role` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
DROP INDEX "account_settings_user_id_unique";--> statement-breakpoint
DROP INDEX "analytics_settings_user_id_unique";--> statement-breakpoint
DROP INDEX "backup_schedules_user_id_unique";--> statement-breakpoint
DROP INDEX "business_profiles_user_id_unique";--> statement-breakpoint
DROP INDEX "business_settings_user_id_unique";--> statement-breakpoint
DROP INDEX "catalog_settings_user_id_unique";--> statement-breakpoint
DROP INDEX "chatbot_settings_user_id_unique";--> statement-breakpoint
DROP INDEX "content_settings_key_unique";--> statement-breakpoint
DROP INDEX "customers_user_id_idx";--> statement-breakpoint
DROP INDEX "customers_phone_idx";--> statement-breakpoint
DROP INDEX "customers_status_idx";--> statement-breakpoint
DROP INDEX "feature_flags_feature_key_unique";--> statement-breakpoint
DROP INDEX "leads_user_id_idx";--> statement-breakpoint
DROP INDEX "leads_status_idx";--> statement-breakpoint
DROP INDEX "leads_phone_idx";--> statement-breakpoint
DROP INDEX "messages_user_id_idx";--> statement-breakpoint
DROP INDEX "messages_customer_id_idx";--> statement-breakpoint
DROP INDEX "messages_lead_id_idx";--> statement-breakpoint
DROP INDEX "messages_from_number_idx";--> statement-breakpoint
DROP INDEX "messages_to_number_idx";--> statement-breakpoint
DROP INDEX "orders_user_id_idx";--> statement-breakpoint
DROP INDEX "orders_status_idx";--> statement-breakpoint
DROP INDEX "orders_created_at_idx";--> statement-breakpoint
DROP INDEX "pricing_plans_plan_id_unique";--> statement-breakpoint
DROP INDEX "products_user_id_idx";--> statement-breakpoint
DROP INDEX "products_category_idx";--> statement-breakpoint
DROP INDEX "products_status_idx";--> statement-breakpoint
DROP INDEX "rbac_team_members_invite_token_unique";--> statement-breakpoint
DROP INDEX "security_settings_user_id_unique";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "team_invites_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "webhook_events_event_id_unique";--> statement-breakpoint
DROP INDEX "webhook_logs_event_id_unique";--> statement-breakpoint
ALTER TABLE `messages` ALTER COLUMN "status" TO "status" text NOT NULL DEFAULT 'sent';--> statement-breakpoint
CREATE UNIQUE INDEX `account_settings_user_id_unique` ON `account_settings` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `analytics_settings_user_id_unique` ON `analytics_settings` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `backup_schedules_user_id_unique` ON `backup_schedules` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `business_profiles_user_id_unique` ON `business_profiles` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `business_settings_user_id_unique` ON `business_settings` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_settings_user_id_unique` ON `catalog_settings` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `chatbot_settings_user_id_unique` ON `chatbot_settings` (`user_id`);--> statement-breakpoint
CREATE INDEX `leads_user_id_idx` ON `leads` (`user_id`);--> statement-breakpoint
CREATE INDEX `leads_status_idx` ON `leads` (`status`);--> statement-breakpoint
CREATE INDEX `leads_phone_idx` ON `leads` (`phone`);--> statement-breakpoint
CREATE INDEX `messages_user_id_idx` ON `messages` (`user_id`);--> statement-breakpoint
CREATE INDEX `messages_customer_id_idx` ON `messages` (`customer_id`);--> statement-breakpoint
CREATE INDEX `messages_lead_id_idx` ON `messages` (`lead_id`);--> statement-breakpoint
CREATE INDEX `messages_from_number_idx` ON `messages` (`from_number`);--> statement-breakpoint
CREATE INDEX `messages_to_number_idx` ON `messages` (`to_number`);--> statement-breakpoint
CREATE INDEX `orders_user_id_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `orders_created_at_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `products_user_id_idx` ON `products` (`user_id`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `security_settings_user_id_unique` ON `security_settings` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `team_invites_token_unique` ON `team_invites` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `webhook_events_event_id_unique` ON `webhook_events` (`event_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `webhook_logs_event_id_unique` ON `webhook_logs` (`event_id`);--> statement-breakpoint
ALTER TABLE `messages` ADD `customer_id` integer REFERENCES customers(id);--> statement-breakpoint
ALTER TABLE `messages` ADD `from_number` text NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `to_number` text NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `message_type` text NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `whatsapp_message_id` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `error_message` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `raw_payload` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `media_url` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `timestamp` text NOT NULL;--> statement-breakpoint
ALTER TABLE `business_settings` ADD `logo_url` text;--> statement-breakpoint
ALTER TABLE `business_settings` ADD `cover_image_url` text;--> statement-breakpoint
ALTER TABLE `business_settings` ADD `social_links` text;--> statement-breakpoint
ALTER TABLE `business_settings` ADD `maintenance_mode` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `business_settings` DROP COLUMN `address`;--> statement-breakpoint
ALTER TABLE `business_settings` DROP COLUMN `gst_number`;--> statement-breakpoint
ALTER TABLE `business_settings` DROP COLUMN `made_in_india`;--> statement-breakpoint
ALTER TABLE `business_settings` DROP COLUMN `website_url`;--> statement-breakpoint
ALTER TABLE `leads` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `products` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `templates` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `user` ADD `auth_provider` text DEFAULT 'email' NOT NULL;