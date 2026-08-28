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
CREATE TABLE IF NOT EXISTS `feedback_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`rating` integer NOT NULL,
	`message` text NOT NULL,
	`plan` text DEFAULT 'community' NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_feedback_priority_created_at` ON `feedback_submissions` (`priority`,`created_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `job_alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subscription_id` text NOT NULL,
	`change_id` integer NOT NULL,
	`job_id` text NOT NULL,
	`channel` text NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`next_attempt_at` text NOT NULL,
	`created_at` text NOT NULL,
	`delivered_at` text,
	FOREIGN KEY (`subscription_id`) REFERENCES `job_source_subscriptions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`change_id`) REFERENCES `job_change_events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_id`) REFERENCES `job_postings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `job_alerts_user_change_channel_unique` ON `job_alerts` (`user_id`,`change_id`,`channel`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_job_alerts_user_state_created` ON `job_alerts` (`user_id`,`state`,`created_at`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_job_alerts_state_attempt` ON `job_alerts` (`state`,`next_attempt_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `job_change_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` text NOT NULL,
	`job_id` text NOT NULL,
	`kind` text NOT NULL,
	`sync_id` text NOT NULL,
	`event_key` text NOT NULL,
	`content_hash` text NOT NULL,
	`payload_json` text NOT NULL,
	`occurred_at` text NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `job_sources`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_id`) REFERENCES `job_postings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `job_change_events_job_kind_key_unique` ON `job_change_events` (`job_id`,`kind`,`event_key`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_job_change_events_source_id` ON `job_change_events` (`source_id`,`id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `job_notification_destinations` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_enabled` integer DEFAULT 0 NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`verified_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `job_tracking_maintenance` (
	`key` text PRIMARY KEY NOT NULL,
	`ran_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `job_postings` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`external_job_id` text NOT NULL,
	`canonical_url` text,
	`payload_json` text NOT NULL,
	`content_hash` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`first_seen_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`last_changed_at` text NOT NULL,
	`removed_at` text,
	`last_seen_sync_id` text NOT NULL,
	`missing_success_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `job_sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `job_postings_source_external_unique` ON `job_postings` (`source_id`,`external_job_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_job_postings_source_active_changed` ON `job_postings` (`source_id`,`active`,`last_changed_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `job_source_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`source_id` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`alerts_enabled` integer DEFAULT 1 NOT NULL,
	`last_reconciled_change_id` integer DEFAULT 0 NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `job_sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `job_source_subscriptions_user_source_unique` ON `job_source_subscriptions` (`user_id`,`source_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_job_source_subscriptions_user_updated` ON `job_source_subscriptions` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_job_source_subscriptions_source_alerts` ON `job_source_subscriptions` (`source_id`,`alerts_enabled`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_job_source_subscriptions_source_reconciled` ON `job_source_subscriptions` (`source_id`,`last_reconciled_change_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `job_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`account` text NOT NULL,
	`employer` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`next_sync_at` text NOT NULL,
	`last_sync_at` text,
	`last_success_at` text,
	`last_snapshot_complete` integer DEFAULT 0 NOT NULL,
	`successful_sync_count` integer DEFAULT 0 NOT NULL,
	`consecutive_failures` integer DEFAULT 0 NOT NULL,
	`lease_expires_at` text,
	`lease_owner` text,
	`last_error_code` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `job_sources_provider_account_unique` ON `job_sources` (`provider`,`account`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_job_sources_due` ON `job_sources` (`active`,`next_sync_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_activity_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event_type` text NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_user_activity_user_created_at` ON `user_activity_events` (`user_id`,`created_at`);
