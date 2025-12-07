ALTER TABLE `business_settings` ADD `short_bio` text;--> statement-breakpoint
ALTER TABLE `business_settings` ADD `store_url` text;--> statement-breakpoint
ALTER TABLE `business_settings` ADD `business_hours` text;--> statement-breakpoint
ALTER TABLE `business_settings` ADD `address` text;--> statement-breakpoint
ALTER TABLE `business_settings` ADD `gst_number` text;--> statement-breakpoint
ALTER TABLE `business_settings` ADD `made_in_india` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `chatbot_settings` ADD `default_response_tone` text DEFAULT 'friendly' NOT NULL;--> statement-breakpoint
ALTER TABLE `chatbot_settings` ADD `language_fallback` text;--> statement-breakpoint
ALTER TABLE `chatbot_settings` ADD `keyword_triggers` text;--> statement-breakpoint
ALTER TABLE `chatbot_settings` ADD `auto_reply_templates` text;