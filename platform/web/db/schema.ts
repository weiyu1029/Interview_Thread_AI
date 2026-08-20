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
