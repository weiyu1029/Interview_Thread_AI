import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const feedbackSubmissions = sqliteTable("feedback_submissions", {
  id: text("id").primaryKey().notNull(),
  category: text("category").notNull(),
  rating: integer("rating").notNull(),
  message: text("message").notNull(),
  plan: text("plan").default("community").notNull(),
  priority: integer("priority").default(0).notNull(),
  locale: text("locale").default("en").notNull(),
  status: text("status").default("new").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("idx_feedback_priority_created_at").on(table.priority, table.createdAt),
]);

export const feedbackOwners = sqliteTable("feedback_owners", {
  feedbackId: text("feedback_id").primaryKey().notNull().references(() => feedbackSubmissions.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_feedback_owners_user_created_at").on(table.userId, table.createdAt)]);

export const feedbackContext = sqliteTable("feedback_context", {
  feedbackId: text("feedback_id").primaryKey().notNull().references(() => feedbackSubmissions.id, { onDelete: "cascade" }),
  productVersion: text("product_version").notNull(),
  surface: text("surface").default("general").notNull(),
  betaCohort: text("beta_cohort"),
  createdAt: text("created_at").notNull(),
});

export const userActivityEvents = sqliteTable("user_activity_events", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull(),
  eventType: text("event_type").notNull(),
  locale: text("locale").default("en").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_user_activity_user_created_at").on(table.userId, table.createdAt)]);

export const authUsers = sqliteTable("auth_users", {
  id: text("id").primaryKey().notNull(),
  provider: text("provider").notNull(),
  providerUserId: text("provider_user_id").notNull(),
  email: text("email"),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  providerUsername: text("provider_username"),
  providerProfileUrl: text("provider_profile_url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("auth_users_provider_provider_user_id_unique").on(table.provider, table.providerUserId), index("idx_auth_users_provider_identity").on(table.provider, table.providerUserId)]);

export const authSessions = sqliteTable("auth_sessions", {
  sessionHash: text("session_hash").primaryKey().notNull(),
  userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
}, (table) => [index("idx_auth_sessions_user_expires_at").on(table.userId, table.expiresAt)]);

export const betaParticipants = sqliteTable("beta_participants", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull(),
  status: text("status").default("applied").notNull(),
  cohort: text("cohort").default("waitlist").notNull(),
  roleFamily: text("role_family").notNull(),
  experienceLevel: text("experience_level").notNull(),
  interviewTimeline: text("interview_timeline").notNull(),
  primaryGoal: text("primary_goal").notNull(),
  locale: text("locale").default("en").notNull(),
  researchConsent: integer("research_consent").default(0).notNull(),
  productUpdatesConsent: integer("product_updates_consent").default(0).notNull(),
  termsVersion: text("terms_version").notNull(),
  privacyVersion: text("privacy_version").notNull(),
  productVersion: text("product_version").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  withdrawnAt: text("withdrawn_at"),
}, (table) => [uniqueIndex("beta_participants_user_id_unique").on(table.userId), index("idx_beta_participants_status_created_at").on(table.status, table.createdAt)]);

export const jobSources = sqliteTable("job_sources", {
  id: text("id").primaryKey().notNull(),
  provider: text("provider").notNull(),
  account: text("account").notNull(),
  employer: text("employer").notNull(),
  active: integer("active").default(1).notNull(),
  nextSyncAt: text("next_sync_at").notNull(),
  lastSyncAt: text("last_sync_at"),
  lastSuccessAt: text("last_success_at"),
  lastSnapshotComplete: integer("last_snapshot_complete").default(0).notNull(),
  successfulSyncCount: integer("successful_sync_count").default(0).notNull(),
  consecutiveFailures: integer("consecutive_failures").default(0).notNull(),
  leaseExpiresAt: text("lease_expires_at"),
  leaseOwner: text("lease_owner"),
  lastErrorCode: text("last_error_code"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("job_sources_provider_account_unique").on(table.provider, table.account),
  index("idx_job_sources_due").on(table.active, table.nextSyncAt),
]);

export const jobSourceSubscriptions = sqliteTable("job_source_subscriptions", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull(),
  sourceId: text("source_id").notNull().references(() => jobSources.id, { onDelete: "cascade" }),
  active: integer("active").default(1).notNull(),
  alertsEnabled: integer("alerts_enabled").default(1).notNull(),
  lastReconciledChangeId: integer("last_reconciled_change_id").default(0).notNull(),
  locale: text("locale").default("en").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("job_source_subscriptions_user_source_unique").on(table.userId, table.sourceId),
  index("idx_job_source_subscriptions_user_updated").on(table.userId, table.updatedAt),
  index("idx_job_source_subscriptions_source_alerts").on(table.sourceId, table.alertsEnabled),
  index("idx_job_source_subscriptions_source_reconciled").on(table.sourceId, table.lastReconciledChangeId),
]);

export const jobPostings = sqliteTable("job_postings", {
  id: text("id").primaryKey().notNull(),
  sourceId: text("source_id").notNull().references(() => jobSources.id, { onDelete: "cascade" }),
  externalJobId: text("external_job_id").notNull(),
  canonicalUrl: text("canonical_url"),
  payloadJson: text("payload_json").notNull(),
  contentHash: text("content_hash").notNull(),
  active: integer("active").default(1).notNull(),
  firstSeenAt: text("first_seen_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
  lastChangedAt: text("last_changed_at").notNull(),
  removedAt: text("removed_at"),
  lastSeenSyncId: text("last_seen_sync_id").notNull(),
  missingSuccessCount: integer("missing_success_count").default(0).notNull(),
}, (table) => [
  uniqueIndex("job_postings_source_external_unique").on(table.sourceId, table.externalJobId),
  index("idx_job_postings_source_active_changed").on(table.sourceId, table.active, table.lastChangedAt),
]);

export const jobChangeEvents = sqliteTable("job_change_events", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  sourceId: text("source_id").notNull().references(() => jobSources.id, { onDelete: "cascade" }),
  jobId: text("job_id").notNull().references(() => jobPostings.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  syncId: text("sync_id").notNull(),
  eventKey: text("event_key").notNull(),
  contentHash: text("content_hash").notNull(),
  payloadJson: text("payload_json").notNull(),
  occurredAt: text("occurred_at").notNull(),
}, (table) => [
  uniqueIndex("job_change_events_job_kind_key_unique").on(table.jobId, table.kind, table.eventKey),
  index("idx_job_change_events_source_id").on(table.sourceId, table.id),
]);

export const jobAlerts = sqliteTable("job_alerts", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull(),
  subscriptionId: text("subscription_id").notNull().references(() => jobSourceSubscriptions.id, { onDelete: "cascade" }),
  changeId: integer("change_id").notNull().references(() => jobChangeEvents.id, { onDelete: "cascade" }),
  jobId: text("job_id").notNull().references(() => jobPostings.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  state: text("state").default("pending").notNull(),
  attemptCount: integer("attempt_count").default(0).notNull(),
  nextAttemptAt: text("next_attempt_at").notNull(),
  createdAt: text("created_at").notNull(),
  deliveredAt: text("delivered_at"),
}, (table) => [
  uniqueIndex("job_alerts_user_change_channel_unique").on(table.userId, table.changeId, table.channel),
  index("idx_job_alerts_user_state_created").on(table.userId, table.state, table.createdAt),
  index("idx_job_alerts_state_attempt").on(table.state, table.nextAttemptAt),
]);

export const jobNotificationDestinations = sqliteTable("job_notification_destinations", {
  userId: text("user_id").primaryKey().notNull(),
  email: text("email").notNull(),
  emailEnabled: integer("email_enabled").default(0).notNull(),
  locale: text("locale").default("en").notNull(),
  verifiedAt: text("verified_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const jobTrackingMaintenance = sqliteTable("job_tracking_maintenance", {
  key: text("key").primaryKey().notNull(),
  ranAt: text("ran_at").notNull(),
});
