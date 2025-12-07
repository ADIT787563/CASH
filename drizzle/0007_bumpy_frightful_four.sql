CREATE TABLE `business_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`full_name` text NOT NULL,
	`business_name` text NOT NULL,
	`business_category` text NOT NULL,
	`phone_number` text NOT NULL,
	`business_email` text NOT NULL,
	`street` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`pincode` text NOT NULL,
	`gst_number` text,
	`is_complete` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `business_profiles_user_id_unique` ON `business_profiles` (`user_id`);