CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`description` text NOT NULL,
	`item_type` text,
	`item_id` text,
	`metadata` text,
	`ip_address` text,
	`user_agent` text,
	`severity` text DEFAULT 'info' NOT NULL,
	`category` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
