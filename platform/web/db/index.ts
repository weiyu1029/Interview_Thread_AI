import { env } from "cloudflare:workers";

const createFeedbackTable = `
  CREATE TABLE IF NOT EXISTS feedback_submissions (
    id text PRIMARY KEY NOT NULL,
    category text NOT NULL,
    rating integer NOT NULL,
    message text NOT NULL,
    plan text DEFAULT 'community' NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    locale text DEFAULT 'en' NOT NULL,
    status text DEFAULT 'new' NOT NULL,
    created_at text NOT NULL
  )
`;

const createFeedbackIndex = `
  CREATE INDEX IF NOT EXISTS idx_feedback_priority_created_at
  ON feedback_submissions (priority, created_at)
`;

const createFeedbackOwnersTable = `
  CREATE TABLE IF NOT EXISTS feedback_owners (
    feedback_id text PRIMARY KEY NOT NULL,
    user_id text NOT NULL,
    created_at text NOT NULL,
    FOREIGN KEY (feedback_id) REFERENCES feedback_submissions(id) ON DELETE CASCADE
  )
`;

const createFeedbackOwnersIndex = `
  CREATE INDEX IF NOT EXISTS idx_feedback_owners_user_created_at
  ON feedback_owners (user_id, created_at)
`;

const createFeedbackContextTable = `
  CREATE TABLE IF NOT EXISTS feedback_context (
    feedback_id text PRIMARY KEY NOT NULL,
    product_version text NOT NULL,
    surface text DEFAULT 'general' NOT NULL,
    beta_cohort text,
    created_at text NOT NULL,
    FOREIGN KEY (feedback_id) REFERENCES feedback_submissions(id) ON DELETE CASCADE
  )
`;

const createBetaParticipantsTable = `
  CREATE TABLE IF NOT EXISTS beta_participants (
    id text PRIMARY KEY NOT NULL,
    user_id text UNIQUE NOT NULL,
    status text DEFAULT 'applied' NOT NULL,
    cohort text DEFAULT 'waitlist' NOT NULL,
    role_family text NOT NULL,
    experience_level text NOT NULL,
    interview_timeline text NOT NULL,
    primary_goal text NOT NULL,
    locale text DEFAULT 'en' NOT NULL,
    research_consent integer DEFAULT 0 NOT NULL,
    product_updates_consent integer DEFAULT 0 NOT NULL,
    terms_version text NOT NULL,
    privacy_version text NOT NULL,
    product_version text NOT NULL,
    created_at text NOT NULL,
    updated_at text NOT NULL,
    withdrawn_at text
  )
`;

const createBetaParticipantsIndex = `
  CREATE INDEX IF NOT EXISTS idx_beta_participants_status_created_at
  ON beta_participants (status, created_at)
`;

const createUserActivityTable = `
  CREATE TABLE IF NOT EXISTS user_activity_events (
    id text PRIMARY KEY NOT NULL,
    user_id text NOT NULL,
    event_type text NOT NULL,
    locale text DEFAULT 'en' NOT NULL,
    created_at text NOT NULL
  )
`;

const createUserActivityIndex = `
  CREATE INDEX IF NOT EXISTS idx_user_activity_user_created_at
  ON user_activity_events (user_id, created_at DESC)
`;

const createAuthUsersTable = `
  CREATE TABLE IF NOT EXISTS auth_users (
    id text PRIMARY KEY NOT NULL,
    provider text NOT NULL,
    provider_user_id text NOT NULL,
    email text,
    display_name text NOT NULL,
    avatar_url text,
    provider_username text,
    provider_profile_url text,
    created_at text NOT NULL,
    updated_at text NOT NULL,
    UNIQUE (provider, provider_user_id)
  )
`;

const createAuthUsersIndex = `
  CREATE INDEX IF NOT EXISTS idx_auth_users_provider_identity
  ON auth_users (provider, provider_user_id)
`;

const createAuthSessionsTable = `
  CREATE TABLE IF NOT EXISTS auth_sessions (
    session_hash text PRIMARY KEY NOT NULL,
    user_id text NOT NULL,
    created_at text NOT NULL,
    expires_at text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
  )
`;

const createAuthSessionsIndex = `
  CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_expires_at
  ON auth_sessions (user_id, expires_at)
`;

let feedbackStorageReady: Promise<void> | null = null;
let authStorageReady: Promise<void> | null = null;

export function ensureFeedbackStorage() {
  if (!env.DB) {
    throw new Error("The InterviewThread feedback database is unavailable.");
  }

  if (!feedbackStorageReady) {
    feedbackStorageReady = env.DB
      .batch([
        env.DB.prepare(createFeedbackTable),
        env.DB.prepare(createFeedbackIndex),
        env.DB.prepare(createFeedbackOwnersTable),
        env.DB.prepare(createFeedbackOwnersIndex),
        env.DB.prepare(createFeedbackContextTable),
        env.DB.prepare(createBetaParticipantsTable),
        env.DB.prepare(createBetaParticipantsIndex),
        env.DB.prepare(createUserActivityTable),
        env.DB.prepare(createUserActivityIndex),
      ])
      .then(() => undefined)
      .catch((error) => {
        feedbackStorageReady = null;
        throw error;
      });
  }

  return feedbackStorageReady;
}

export function ensureAuthStorage() {
  if (!env.DB) {
    throw new Error("The InterviewThread account database is unavailable.");
  }

  if (!authStorageReady) {
    authStorageReady = env.DB
      .batch([
        env.DB.prepare(createAuthUsersTable),
        env.DB.prepare(createAuthUsersIndex),
        env.DB.prepare(createAuthSessionsTable),
        env.DB.prepare(createAuthSessionsIndex),
      ])
      .then(() => undefined)
      .catch((error) => {
        authStorageReady = null;
        throw error;
      });
  }

  return authStorageReady;
}

export type OAuthUserRecord = {
  id: string;
  provider: "google" | "github" | "linkedin";
  providerUserId: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  providerUsername: string | null;
  providerProfileUrl: string | null;
};

export async function upsertOAuthUser(user: OAuthUserRecord) {
  await ensureAuthStorage();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO auth_users
      (id, provider, provider_user_id, email, display_name, avatar_url,
       provider_username, provider_profile_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(provider, provider_user_id) DO UPDATE SET
       email = excluded.email,
       display_name = excluded.display_name,
       avatar_url = excluded.avatar_url,
       provider_username = excluded.provider_username,
       provider_profile_url = excluded.provider_profile_url,
       updated_at = excluded.updated_at`,
  )
    .bind(
      user.id,
      user.provider,
      user.providerUserId,
      user.email,
      user.displayName,
      user.avatarUrl,
      user.providerUsername,
      user.providerProfileUrl,
      now,
      now,
    )
    .run();
}

export async function createAuthSession(input: {
  sessionHash: string;
  userId: string;
  expiresAt: string;
}) {
  await ensureAuthStorage();
  await env.DB.batch([
    env.DB.prepare(
      `DELETE FROM auth_sessions WHERE expires_at <= ?`,
    ).bind(new Date().toISOString()),
    env.DB.prepare(
      `INSERT INTO auth_sessions
        (session_hash, user_id, created_at, expires_at)
       VALUES (?, ?, ?, ?)`,
    ).bind(
      input.sessionHash,
      input.userId,
      new Date().toISOString(),
      input.expiresAt,
    ),
  ]);
}

export async function findUserBySession(sessionHash: string) {
  await ensureAuthStorage();
  const row = await env.DB.prepare(
    `SELECT
       users.id,
       users.provider,
       users.email,
       users.display_name,
       users.avatar_url,
       users.provider_username,
       users.provider_profile_url
     FROM auth_sessions sessions
     JOIN auth_users users ON users.id = sessions.user_id
     WHERE sessions.session_hash = ? AND sessions.expires_at > ?
     LIMIT 1`,
  )
    .bind(sessionHash, new Date().toISOString())
    .first<{
      id: string;
      provider: OAuthUserRecord["provider"];
      email: string | null;
      display_name: string;
      avatar_url: string | null;
      provider_username: string | null;
      provider_profile_url: string | null;
    }>();

  if (!row) return null;
  return {
    userId: row.id,
    provider: row.provider,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    providerUsername: row.provider_username,
    providerProfileUrl: row.provider_profile_url,
  };
}

export async function deleteAuthSession(sessionHash: string) {
  if (!env.DB) return;
  await ensureAuthStorage();
  await env.DB.prepare(
    `DELETE FROM auth_sessions WHERE session_hash = ?`,
  )
    .bind(sessionHash)
    .run();
}

export type FeedbackSubmission = {
  id: string;
  userId: string;
  category: string;
  rating: number;
  message: string;
  plan: string;
  priority: number;
  locale: string;
  createdAt: string;
  productVersion: string;
  surface: string;
};

export async function insertFeedback(submission: FeedbackSubmission) {
  await ensureFeedbackStorage();
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO feedback_submissions
        (id, category, rating, message, plan, priority, locale, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      submission.id,
      submission.category,
      submission.rating,
      submission.message,
      submission.plan,
      submission.priority,
      submission.locale,
      submission.createdAt,
    ),
    env.DB.prepare(
      `INSERT INTO feedback_owners (feedback_id, user_id, created_at)
       VALUES (?, ?, ?)`,
    ).bind(submission.id, submission.userId, submission.createdAt),
    env.DB.prepare(
      `INSERT INTO feedback_context
        (feedback_id, product_version, surface, beta_cohort, created_at)
       VALUES (?, ?, ?, (SELECT cohort FROM beta_participants WHERE user_id = ? AND status IN ('invited', 'active') LIMIT 1), ?)`,
    ).bind(
      submission.id,
      submission.productVersion,
      submission.surface,
      submission.userId,
      submission.createdAt,
    ),
    env.DB.prepare(
      `INSERT INTO user_activity_events
        (id, user_id, event_type, locale, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(),
      submission.userId,
      "feedback_submitted",
      submission.locale,
      submission.createdAt,
    ),
  ]);
}

export const USER_ACTIVITY_TYPES = [
  "analysis_completed",
  "interview_started",
  "interview_answered",
  "tracker_updated",
  "feedback_submitted",
  "beta_application_submitted",
  "beta_application_withdrawn",
] as const;

export type UserActivityType = (typeof USER_ACTIVITY_TYPES)[number];

export type UserActivityEvent = {
  id: string;
  userId: string;
  eventType: UserActivityType;
  locale: string;
  createdAt: string;
};

export async function recordUserActivity(event: UserActivityEvent) {
  await ensureFeedbackStorage();
  await env.DB.prepare(
    `INSERT INTO user_activity_events
      (id, user_id, event_type, locale, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(
      event.id,
      event.userId,
      event.eventType,
      event.locale,
      event.createdAt,
    )
    .run();
}

export async function listUserActivity(userId: string, limit = 12) {
  if (!env.DB) return [];
  await ensureFeedbackStorage();
  const safeLimit = Math.max(1, Math.min(50, Math.trunc(limit)));
  const result = await env.DB.prepare(
    `SELECT id, event_type, locale, created_at
     FROM user_activity_events
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
  )
    .bind(userId, safeLimit)
    .all<{
      id: string;
      event_type: UserActivityType;
      locale: string;
      created_at: string;
    }>();

  return result.results.map((row) => ({
    id: row.id,
    eventType: row.event_type,
    locale: row.locale,
    createdAt: row.created_at,
  }));
}

export const BETA_STATUSES = [
  "applied",
  "invited",
  "active",
  "paused",
  "withdrawn",
] as const;

export type BetaStatus = (typeof BETA_STATUSES)[number];

export type BetaParticipant = {
  id: string;
  userId: string;
  status: BetaStatus;
  cohort: string;
  roleFamily: string;
  experienceLevel: string;
  interviewTimeline: string;
  primaryGoal: string;
  locale: string;
  researchConsent: boolean;
  productUpdatesConsent: boolean;
  termsVersion: string;
  privacyVersion: string;
  productVersion: string;
  createdAt: string;
  updatedAt: string;
  withdrawnAt: string | null;
};

type BetaRow = {
  id: string;
  user_id: string;
  status: BetaStatus;
  cohort: string;
  role_family: string;
  experience_level: string;
  interview_timeline: string;
  primary_goal: string;
  locale: string;
  research_consent: number;
  product_updates_consent: number;
  terms_version: string;
  privacy_version: string;
  product_version: string;
  created_at: string;
  updated_at: string;
  withdrawn_at: string | null;
};

function mapBetaParticipant(row: BetaRow): BetaParticipant {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    cohort: row.cohort,
    roleFamily: row.role_family,
    experienceLevel: row.experience_level,
    interviewTimeline: row.interview_timeline,
    primaryGoal: row.primary_goal,
    locale: row.locale,
    researchConsent: Boolean(row.research_consent),
    productUpdatesConsent: Boolean(row.product_updates_consent),
    termsVersion: row.terms_version,
    privacyVersion: row.privacy_version,
    productVersion: row.product_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    withdrawnAt: row.withdrawn_at,
  };
}

export async function findBetaParticipant(userId: string) {
  await ensureFeedbackStorage();
  const row = await env.DB.prepare(
    `SELECT * FROM beta_participants WHERE user_id = ? LIMIT 1`,
  )
    .bind(userId)
    .first<BetaRow>();
  return row ? mapBetaParticipant(row) : null;
}

export async function upsertBetaParticipant(input: {
  userId: string;
  roleFamily: string;
  experienceLevel: string;
  interviewTimeline: string;
  primaryGoal: string;
  locale: string;
  researchConsent: boolean;
  productUpdatesConsent: boolean;
  termsVersion: string;
  privacyVersion: string;
  productVersion: string;
}) {
  await ensureFeedbackStorage();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO beta_participants
      (id, user_id, status, cohort, role_family, experience_level,
       interview_timeline, primary_goal, locale, research_consent,
       product_updates_consent, terms_version, privacy_version,
       product_version, created_at, updated_at, withdrawn_at)
     VALUES (?, ?, 'applied', 'waitlist', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
     ON CONFLICT(user_id) DO UPDATE SET
       status = CASE
         WHEN beta_participants.status IN ('invited', 'active', 'paused')
           THEN beta_participants.status
         ELSE 'applied'
       END,
       role_family = excluded.role_family,
       experience_level = excluded.experience_level,
       interview_timeline = excluded.interview_timeline,
       primary_goal = excluded.primary_goal,
       locale = excluded.locale,
       research_consent = excluded.research_consent,
       product_updates_consent = excluded.product_updates_consent,
       terms_version = excluded.terms_version,
       privacy_version = excluded.privacy_version,
       product_version = excluded.product_version,
       updated_at = excluded.updated_at,
       withdrawn_at = NULL`,
  )
    .bind(
      crypto.randomUUID(),
      input.userId,
      input.roleFamily,
      input.experienceLevel,
      input.interviewTimeline,
      input.primaryGoal,
      input.locale,
      input.researchConsent ? 1 : 0,
      input.productUpdatesConsent ? 1 : 0,
      input.termsVersion,
      input.privacyVersion,
      input.productVersion,
      now,
      now,
    )
    .run();
  return findBetaParticipant(input.userId);
}

export async function withdrawBetaParticipant(userId: string) {
  await ensureFeedbackStorage();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE beta_participants
     SET status = 'withdrawn', research_consent = 0,
         product_updates_consent = 0, withdrawn_at = ?, updated_at = ?
     WHERE user_id = ?`,
  )
    .bind(now, now, userId)
    .run();
  return findBetaParticipant(userId);
}

export type AdminProductMetrics = {
  generatedAt: string;
  accounts: {
    total: number;
    createdLast7Days: number;
  };
  activity: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
    activeAccountsLast7Days: number;
    activeAccountsLast30Days: number;
    byTypeLast30Days: Array<{
      eventType: UserActivityType;
      count: number;
    }>;
  };
  beta: {
    total: number;
    byStatus: Array<{
      status: BetaStatus;
      count: number;
    }>;
  };
  feedback: {
    total: number;
    new: number;
  };
};

type CountRow = { count: number };

function countFrom(row: CountRow | null) {
  return Number(row?.count || 0);
}

/**
 * Returns aggregate-only product metrics for the private operator dashboard.
 * Only grouped counts leave this function; source content and request
 * metadata remain outside this aggregate reporting boundary.
 */
export async function getAdminProductMetrics(): Promise<AdminProductMetrics> {
  await Promise.all([ensureAuthStorage(), ensureFeedbackStorage()]);

  const now = Date.now();
  const last24Hours = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    accountsTotal,
    accountsLast7Days,
    activityLast24Hours,
    activityLast7Days,
    activityLast30Days,
    activeAccountsLast7Days,
    activeAccountsLast30Days,
    feedbackTotal,
    feedbackNew,
    betaTotal,
    activityByType,
    betaByStatus,
  ] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS count FROM auth_users").first<CountRow>(),
    env.DB.prepare(
      "SELECT COUNT(*) AS count FROM auth_users WHERE created_at >= ?",
    )
      .bind(last7Days)
      .first<CountRow>(),
    env.DB.prepare(
      "SELECT COUNT(*) AS count FROM user_activity_events WHERE created_at >= ?",
    )
      .bind(last24Hours)
      .first<CountRow>(),
    env.DB.prepare(
      "SELECT COUNT(*) AS count FROM user_activity_events WHERE created_at >= ?",
    )
      .bind(last7Days)
      .first<CountRow>(),
    env.DB.prepare(
      "SELECT COUNT(*) AS count FROM user_activity_events WHERE created_at >= ?",
    )
      .bind(last30Days)
      .first<CountRow>(),
    env.DB.prepare(
      "SELECT COUNT(DISTINCT user_id) AS count FROM user_activity_events WHERE created_at >= ?",
    )
      .bind(last7Days)
      .first<CountRow>(),
    env.DB.prepare(
      "SELECT COUNT(DISTINCT user_id) AS count FROM user_activity_events WHERE created_at >= ?",
    )
      .bind(last30Days)
      .first<CountRow>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM feedback_submissions").first<CountRow>(),
    env.DB.prepare(
      "SELECT COUNT(*) AS count FROM feedback_submissions WHERE status = 'new'",
    ).first<CountRow>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM beta_participants").first<CountRow>(),
    env.DB.prepare(
      `SELECT event_type, COUNT(*) AS count
       FROM user_activity_events
       WHERE created_at >= ?
       GROUP BY event_type
       ORDER BY count DESC`,
    )
      .bind(last30Days)
      .all<{ event_type: UserActivityType; count: number }>(),
    env.DB.prepare(
      `SELECT status, COUNT(*) AS count
       FROM beta_participants
       GROUP BY status
       ORDER BY count DESC`,
    ).all<{ status: BetaStatus; count: number }>(),
  ]);

  return {
    generatedAt: new Date(now).toISOString(),
    accounts: {
      total: countFrom(accountsTotal),
      createdLast7Days: countFrom(accountsLast7Days),
    },
    activity: {
      last24Hours: countFrom(activityLast24Hours),
      last7Days: countFrom(activityLast7Days),
      last30Days: countFrom(activityLast30Days),
      activeAccountsLast7Days: countFrom(activeAccountsLast7Days),
      activeAccountsLast30Days: countFrom(activeAccountsLast30Days),
      byTypeLast30Days: activityByType.results
        .filter((row) => USER_ACTIVITY_TYPES.includes(row.event_type))
        .map((row) => ({
          eventType: row.event_type,
          count: Number(row.count || 0),
        })),
    },
    beta: {
      total: countFrom(betaTotal),
      byStatus: betaByStatus.results
        .filter((row) => BETA_STATUSES.includes(row.status))
        .map((row) => ({
          status: row.status,
          count: Number(row.count || 0),
        })),
    },
    feedback: {
      total: countFrom(feedbackTotal),
      new: countFrom(feedbackNew),
    },
  };
}
