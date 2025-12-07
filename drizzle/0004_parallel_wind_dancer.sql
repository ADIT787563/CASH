CREATE TABLE `account_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`full_name` text,
	`phone` text,
	`phone_verified` integer DEFAULT false NOT NULL,
	`timezone` text DEFAULT 'Asia/Kolkata' NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`logo_url` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_settings_user_id_unique` ON `account_settings` (`user_id`);--> statement-breakpoint
CREATE TABLE `analytics_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`retention_days` integer DEFAULT 30 NOT NULL,
	`realtime_enabled` integer DEFAULT false NOT NULL,
	`default_timezone` text DEFAULT 'Asia/Kolkata' NOT NULL,
	`csv_export_enabled` integer DEFAULT false NOT NULL,
	`png_export_enabled` integer DEFAULT false NOT NULL,
	`anonymize_pii` integer DEFAULT false NOT NULL,
	`webhook_url` text,
	`webhook_secret` text,
	`scheduled_report_enabled` integer DEFAULT false NOT NULL,
	`report_frequency` text DEFAULT 'weekly' NOT NULL,
	`report_time` text DEFAULT '09:00' NOT NULL,
	`report_recipients` text,
	`demo_mode` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analytics_settings_user_id_unique` ON `analytics_settings` (`user_id`);--> statement-breakpoint
CREATE TABLE `backup_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`frequency` text DEFAULT 'weekly' NOT NULL,
	`storage_provider` text,
	`storage_config` text,
	`last_backup_at` text,
	`next_backup_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `backup_schedules_user_id_unique` ON `backup_schedules` (`user_id`);--> statement-breakpoint
CREATE TABLE `catalog_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`default_template` text DEFAULT 'modern' NOT NULL,
	`auto_update` integer DEFAULT true NOT NULL,
	`pdf_download_enabled` integer DEFAULT false NOT NULL,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_settings_user_id_unique` ON `catalog_settings` (`user_id`);--> statement-breakpoint
CREATE TABLE `export_jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`job_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`file_url` text,
	`date_range_start` text,
	`date_range_end` text,
	`error_message` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`integration_type` text NOT NULL,
	`status` text DEFAULT 'disconnected' NOT NULL,
	`config` text,
	`last_sync_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `security_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`two_factor_enabled` integer DEFAULT false NOT NULL,
	`two_factor_method` text,
	`two_factor_secret` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `security_settings_user_id_unique` ON `security_settings` (`user_id`);--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`member_user_id` text,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`permissions` text,
	`invited_at` text NOT NULL,
	`accepted_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`session_token` text NOT NULL,
	`device_name` text,
	`ip_address` text,
	`user_agent` text,
	`last_active_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
