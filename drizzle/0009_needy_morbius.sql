CREATE TABLE `team_invites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`business_id` text NOT NULL,
	`token` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_invites_token_unique` ON `team_invites` (`token`);--> statement-breakpoint
ALTER TABLE `team_members` ADD `invite_id` integer REFERENCES team_invites(id);--> statement-breakpoint
ALTER TABLE `templates` ADD `whatsapp_template_id` text;--> statement-breakpoint
ALTER TABLE `templates` ADD `header` text;--> statement-breakpoint
ALTER TABLE `templates` ADD `footer` text;--> statement-breakpoint
ALTER TABLE `templates` ADD `language` text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE `templates` ADD `buttons` text;--> statement-breakpoint
ALTER TABLE `templates` ADD `status` text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `templates` ADD `rejection_reason` text;--> statement-breakpoint
ALTER TABLE `user` ADD `role` text DEFAULT 'owner' NOT NULL;