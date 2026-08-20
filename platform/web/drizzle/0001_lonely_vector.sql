CREATE TABLE IF NOT EXISTS `auth_sessions` (
	`session_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_auth_sessions_user_expires_at` ON `auth_sessions` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `auth_users` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`email` text,
	`display_name` text NOT NULL,
	`avatar_url` text,
	`provider_username` text,
	`provider_profile_url` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `auth_users_provider_provider_user_id_unique` ON `auth_users` (`provider`,`provider_user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_auth_users_provider_identity` ON `auth_users` (`provider`,`provider_user_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `beta_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'applied' NOT NULL,
	`cohort` text DEFAULT 'waitlist' NOT NULL,
	`role_family` text NOT NULL,
	`experience_level` text NOT NULL,
	`interview_timeline` text NOT NULL,
	`primary_goal` text NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`research_consent` integer DEFAULT 0 NOT NULL,
	`product_updates_consent` integer DEFAULT 0 NOT NULL,
	`terms_version` text NOT NULL,
	`privacy_version` text NOT NULL,
	`product_version` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`withdrawn_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `beta_participants_user_id_unique` ON `beta_participants` (`user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_beta_participants_status_created_at` ON `beta_participants` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `feedback_context` (
	`feedback_id` text PRIMARY KEY NOT NULL,
	`product_version` text NOT NULL,
	`surface` text DEFAULT 'general' NOT NULL,
	`beta_cohort` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`feedback_id`) REFERENCES `feedback_submissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `feedback_owners` (
	`feedback_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`feedback_id`) REFERENCES `feedback_submissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_feedback_owners_user_created_at` ON `feedback_owners` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_activity_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event_type` text NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_user_activity_user_created_at` ON `user_activity_events` (`user_id`,`created_at`);
