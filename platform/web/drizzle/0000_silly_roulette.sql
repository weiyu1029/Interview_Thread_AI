CREATE TABLE `feedback_submissions` (
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
CREATE INDEX `idx_feedback_priority_created_at` ON `feedback_submissions` (`priority`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
