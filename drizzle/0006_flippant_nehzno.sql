ALTER TABLE `products` ADD `short_description` text;--> statement-breakpoint
ALTER TABLE `products` ADD `long_description` text;--> statement-breakpoint
ALTER TABLE `products` ADD `compare_at_price` integer;--> statement-breakpoint
ALTER TABLE `products` ADD `discount_percentage` integer;--> statement-breakpoint
ALTER TABLE `products` ADD `discount_valid_from` text;--> statement-breakpoint
ALTER TABLE `products` ADD `discount_valid_to` text;--> statement-breakpoint
ALTER TABLE `products` ADD `bulk_pricing` text;--> statement-breakpoint
ALTER TABLE `products` ADD `currency_code` text DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `barcode` text;--> statement-breakpoint
ALTER TABLE `products` ADD `subcategory` text;--> statement-breakpoint
ALTER TABLE `products` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `products` ADD `vendor` text;--> statement-breakpoint
ALTER TABLE `products` ADD `gallery_images` text;--> statement-breakpoint
ALTER TABLE `products` ADD `variants` text;--> statement-breakpoint
ALTER TABLE `products` ADD `weight` integer;--> statement-breakpoint
ALTER TABLE `products` ADD `dimensions` text;--> statement-breakpoint
ALTER TABLE `products` ADD `shipping_class` text;--> statement-breakpoint
ALTER TABLE `products` ADD `hsn_code` text;--> statement-breakpoint
ALTER TABLE `products` ADD `tax_rate` integer;--> statement-breakpoint
ALTER TABLE `products` ADD `gst_inclusive` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `age_restricted` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `return_policy` text;--> statement-breakpoint
ALTER TABLE `products` ADD `visibility` text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `publish_date` text;--> statement-breakpoint
ALTER TABLE `products` ADD `shareable_slug` text;--> statement-breakpoint
ALTER TABLE `products` ADD `shareable_password` text;--> statement-breakpoint
ALTER TABLE `products` ADD `utm_params` text;--> statement-breakpoint
ALTER TABLE `products` ADD `template` text DEFAULT 'basic' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `seo_title` text;--> statement-breakpoint
ALTER TABLE `products` ADD `seo_description` text;--> statement-breakpoint
ALTER TABLE `products` ADD `canonical_url` text;--> statement-breakpoint
ALTER TABLE `products` ADD `auto_sync_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `last_synced_at` text;--> statement-breakpoint
ALTER TABLE `products` ADD `external_url` text;--> statement-breakpoint
ALTER TABLE `products` ADD `custom_attributes` text;--> statement-breakpoint
ALTER TABLE `products` ADD `view_tracking_enabled` integer DEFAULT true NOT NULL;