import type { JobSearchCandidate } from "../app/job-search.ts";
import type { ApprovedJobProvider } from "../app/job-source-gateway.ts";

const JOB_TRACKING_DDL = [
  `CREATE TABLE IF NOT EXISTS job_sources (
    id text PRIMARY KEY NOT NULL,
    provider text NOT NULL,
    account text NOT NULL,
    employer text NOT NULL,
    active integer DEFAULT 1 NOT NULL,
    next_sync_at text NOT NULL,
    last_sync_at text,
    last_success_at text,
    last_snapshot_complete integer DEFAULT 0 NOT NULL,
    successful_sync_count integer DEFAULT 0 NOT NULL,
    consecutive_failures integer DEFAULT 0 NOT NULL,
    lease_expires_at text,
    lease_owner text,
    last_error_code text,
    created_at text NOT NULL,
    updated_at text NOT NULL,
    UNIQUE (provider, account)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_job_sources_due ON job_sources (active, next_sync_at)`,
  `CREATE TABLE IF NOT EXISTS job_source_subscriptions (
    id text PRIMARY KEY NOT NULL,
    user_id text NOT NULL,
    source_id text NOT NULL,
    active integer DEFAULT 1 NOT NULL,
    alerts_enabled integer DEFAULT 1 NOT NULL,
    last_reconciled_change_id integer DEFAULT 0 NOT NULL,
    locale text DEFAULT 'en' NOT NULL,
    created_at text NOT NULL,
    updated_at text NOT NULL,
    UNIQUE (user_id, source_id),
    FOREIGN KEY (source_id) REFERENCES job_sources(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_job_source_subscriptions_user_updated ON job_source_subscriptions (user_id, updated_at)`,
  `CREATE INDEX IF NOT EXISTS idx_job_source_subscriptions_source_alerts ON job_source_subscriptions (source_id, alerts_enabled)`,
  `CREATE INDEX IF NOT EXISTS idx_job_source_subscriptions_source_reconciled ON job_source_subscriptions (source_id, last_reconciled_change_id)`,
  `CREATE TABLE IF NOT EXISTS job_postings (
    id text PRIMARY KEY NOT NULL,
    source_id text NOT NULL,
    external_job_id text NOT NULL,
    canonical_url text,
    payload_json text NOT NULL,
    content_hash text NOT NULL,
    active integer DEFAULT 1 NOT NULL,
    first_seen_at text NOT NULL,
    last_seen_at text NOT NULL,
    last_changed_at text NOT NULL,
    removed_at text,
    last_seen_sync_id text NOT NULL,
    missing_success_count integer DEFAULT 0 NOT NULL,
    UNIQUE (source_id, external_job_id),
    FOREIGN KEY (source_id) REFERENCES job_sources(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_job_postings_source_active_changed ON job_postings (source_id, active, last_changed_at)`,
  `CREATE TABLE IF NOT EXISTS job_change_events (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    source_id text NOT NULL,
    job_id text NOT NULL,
    kind text NOT NULL,
    sync_id text NOT NULL,
    event_key text NOT NULL,
    content_hash text NOT NULL,
    payload_json text NOT NULL,
    occurred_at text NOT NULL,
    UNIQUE (job_id, kind, event_key),
    FOREIGN KEY (source_id) REFERENCES job_sources(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_job_change_events_source_id ON job_change_events (source_id, id)`,
  `CREATE TABLE IF NOT EXISTS job_alerts (
    id text PRIMARY KEY NOT NULL,
    user_id text NOT NULL,
    subscription_id text NOT NULL,
    change_id integer NOT NULL,
    job_id text NOT NULL,
    channel text NOT NULL,
    state text DEFAULT 'pending' NOT NULL,
    attempt_count integer DEFAULT 0 NOT NULL,
    next_attempt_at text NOT NULL,
    created_at text NOT NULL,
    delivered_at text,
    UNIQUE (user_id, change_id, channel),
    FOREIGN KEY (subscription_id) REFERENCES job_source_subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (change_id) REFERENCES job_change_events(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_job_alerts_user_state_created ON job_alerts (user_id, state, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_job_alerts_state_attempt ON job_alerts (state, next_attempt_at)`,
  `CREATE TABLE IF NOT EXISTS job_notification_destinations (
    user_id text PRIMARY KEY NOT NULL,
    email text NOT NULL,
    email_enabled integer DEFAULT 0 NOT NULL,
    locale text DEFAULT 'en' NOT NULL,
    verified_at text NOT NULL,
    updated_at text NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS job_tracking_maintenance (
    key text PRIMARY KEY NOT NULL,
    ran_at text NOT NULL
  )`,
] as const;

const storageReadiness = new WeakMap<object, Promise<void>>();

export async function ensureJobTrackingStorage(db: D1Database) {
  const existing = storageReadiness.get(db as object);
  if (existing) return existing;
  const ready = db
    .batch(JOB_TRACKING_DDL.map((statement) => db.prepare(statement)))
    .then(() => undefined)
    .catch((error) => {
      storageReadiness.delete(db as object);
      throw error;
    });
  storageReadiness.set(db as object, ready);
  return ready;
}

export type JobSourceRecord = {
  id: string;
  provider: ApprovedJobProvider;
  account: string;
  employer: string;
  active: number;
  next_sync_at: string;
  last_sync_at: string | null;
  last_success_at: string | null;
  last_snapshot_complete: number;
  successful_sync_count: number;
  consecutive_failures: number;
  lease_expires_at: string | null;
  lease_owner: string | null;
  last_error_code: string | null;
  created_at: string;
  updated_at: string;
};

export type JobPostingRecord = {
  id: string;
  source_id: string;
  external_job_id: string;
  canonical_url: string | null;
  payload_json: string;
  content_hash: string;
  active: number;
  first_seen_at: string;
  last_seen_at: string;
  last_changed_at: string;
  removed_at: string | null;
  last_seen_sync_id: string;
  missing_success_count: number;
};

export async function findJobSource(
  db: D1Database,
  provider: ApprovedJobProvider,
  account: string,
) {
  await ensureJobTrackingStorage(db);
  return db.prepare(`SELECT * FROM job_sources WHERE provider = ? AND account = ? LIMIT 1`)
    .bind(provider, account.toLowerCase())
    .first<JobSourceRecord>();
}

export async function findActiveOwnedJobSource(
  db: D1Database,
  userId: string,
  provider: ApprovedJobProvider,
  account: string,
) {
  await ensureJobTrackingStorage(db);
  return db.prepare(
    `SELECT sources.*, subscriptions.id AS subscription_id,
       subscriptions.alerts_enabled, subscriptions.locale
     FROM job_sources sources
     JOIN job_source_subscriptions subscriptions ON subscriptions.source_id = sources.id
     WHERE sources.provider = ? AND sources.account = ?
       AND subscriptions.user_id = ? AND subscriptions.active = 1
     LIMIT 1`,
  ).bind(provider, account.toLowerCase(), userId).first<JobSourceRecord & {
    subscription_id: string;
    alerts_enabled: number;
    locale: string;
  }>();
}

export async function assertJobSourceCapacity(
  db: D1Database,
  userId: string,
  provider: ApprovedJobProvider,
  account: string,
) {
  await ensureJobTrackingStorage(db);
  const source = await findJobSource(db, provider, account.toLowerCase());
  if (source) {
    const existing = await db.prepare(
      `SELECT id FROM job_source_subscriptions
       WHERE user_id = ? AND source_id = ? AND active = 1 LIMIT 1`,
    ).bind(userId, source.id).first<{ id: string }>();
    if (existing) return;
  }
  const count = await db.prepare(
    `SELECT COUNT(*) AS count FROM job_source_subscriptions WHERE user_id = ? AND active = 1`,
  ).bind(userId).first<{ count: number }>();
  if (Number(count?.count || 0) >= 20) throw new Error("source_limit_reached");
}

export async function upsertJobSourceAndSubscription(
  db: D1Database,
  input: {
    userId: string;
    provider: ApprovedJobProvider;
    account: string;
    employer: string;
    locale: string;
  },
) {
  await ensureJobTrackingStorage(db);
  const account = input.account.toLowerCase();
  const existingSource = await findJobSource(db, input.provider, account);
  const existingSubscription = existingSource
    ? await db.prepare(`SELECT id, active FROM job_source_subscriptions WHERE user_id = ? AND source_id = ? LIMIT 1`)
        .bind(input.userId, existingSource.id)
        .first<{ id: string; active: number }>()
    : null;

  if (!existingSubscription?.active) {
    const count = await db.prepare(`SELECT COUNT(*) AS count FROM job_source_subscriptions WHERE user_id = ? AND active = 1`)
      .bind(input.userId)
      .first<{ count: number }>();
    if (Number(count?.count || 0) >= 20) throw new Error("source_limit_reached");
  }

  const now = new Date().toISOString();
  const sourceId = existingSource?.id || crypto.randomUUID();
  const subscriptionId = existingSubscription?.id || crypto.randomUUID();
  await db.batch([
    db.prepare(
      `INSERT INTO job_sources
        (id, provider, account, employer, active, next_sync_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?)
       ON CONFLICT(provider, account) DO UPDATE SET
         employer = excluded.employer,
         active = 1,
         updated_at = excluded.updated_at`,
    ).bind(sourceId, input.provider, account, input.employer.slice(0, 500), now, now, now),
    db.prepare(
      `INSERT INTO job_source_subscriptions
        (id, user_id, source_id, active, alerts_enabled, locale, created_at, updated_at)
       SELECT ?, ?, sources.id, 1, 1, ?, ?, ?
       FROM job_sources sources
       WHERE sources.provider = ? AND sources.account = ?
         AND (
           EXISTS (
             SELECT 1 FROM job_source_subscriptions existing
             WHERE existing.user_id = ? AND existing.source_id = sources.id
               AND existing.active = 1
           )
           OR (
             SELECT COUNT(*) FROM job_source_subscriptions quota
             WHERE quota.user_id = ? AND quota.active = 1
           ) < 20
         )
       ON CONFLICT(user_id, source_id) DO UPDATE SET
         active = 1,
         locale = excluded.locale,
         updated_at = excluded.updated_at`,
    ).bind(
      subscriptionId,
      input.userId,
      input.locale.slice(0, 16),
      now,
      now,
      input.provider,
      account,
      input.userId,
      input.userId,
    ),
  ]);
  const source = await findJobSource(db, input.provider, account);
  if (!source) throw new Error("source_storage_failed");
  const subscription = await db.prepare(
    `SELECT id, created_at FROM job_source_subscriptions
     WHERE user_id = ? AND source_id = ? AND active = 1 LIMIT 1`,
  ).bind(input.userId, source.id).first<{ id: string; created_at: string }>();
  if (!subscription) {
    await db.prepare(
      `UPDATE job_sources SET active = 0, updated_at = ?
       WHERE id = ? AND NOT EXISTS (
         SELECT 1 FROM job_source_subscriptions
         WHERE source_id = ? AND active = 1
       )`,
    ).bind(now, source.id, source.id).run();
    const count = await db.prepare(
      `SELECT COUNT(*) AS count FROM job_source_subscriptions WHERE user_id = ? AND active = 1`,
    ).bind(input.userId).first<{ count: number }>();
    if (Number(count?.count || 0) >= 20) throw new Error("source_limit_reached");
    throw new Error("source_storage_failed");
  }
  return { source, subscription };
}

export async function acquireJobSourceLease(db: D1Database, sourceId: string) {
  await ensureJobTrackingStorage(db);
  const now = new Date();
  // A complete Lever board can require five upstream pages plus hundreds of
  // D1 writes. Keep the lease longer than the five-minute cron interval so a
  // slow but healthy sync cannot overlap the next scheduled invocation.
  const expires = new Date(now.getTime() + 10 * 60_000).toISOString();
  const owner = crypto.randomUUID();
  const result = await db.prepare(
    `UPDATE job_sources
     SET lease_expires_at = ?, lease_owner = ?, last_sync_at = ?, updated_at = ?
     WHERE id = ? AND active = 1
       AND (lease_expires_at IS NULL OR lease_expires_at <= ?)`,
  ).bind(expires, owner, now.toISOString(), now.toISOString(), sourceId, now.toISOString()).run();
  return Number(result.meta.changes || 0) === 1 ? owner : null;
}

export async function releaseJobSourceLease(
  db: D1Database,
  sourceId: string,
  leaseOwner: string,
  input: { success: boolean; complete?: boolean; errorCode?: string },
) {
  const now = new Date();
  if (input.success) {
    const next = new Date(now.getTime() + 5 * 60_000).toISOString();
    await db.prepare(
      `UPDATE job_sources SET
         lease_expires_at = NULL,
         lease_owner = NULL,
         next_sync_at = ?,
         last_success_at = ?,
         last_snapshot_complete = ?,
         successful_sync_count = successful_sync_count + 1,
         consecutive_failures = 0,
         last_error_code = NULL,
         updated_at = ?
       WHERE id = ? AND lease_owner = ?`,
    ).bind(next, now.toISOString(), input.complete ? 1 : 0, now.toISOString(), sourceId, leaseOwner).run();
    return;
  }
  const source = await db.prepare(`SELECT consecutive_failures FROM job_sources WHERE id = ? LIMIT 1`)
    .bind(sourceId).first<{ consecutive_failures: number }>();
  const failures = Number(source?.consecutive_failures || 0) + 1;
  const delayMinutes = failures >= 4 ? 60 : failures >= 2 ? 15 : 5;
  await db.prepare(
    `UPDATE job_sources SET
       lease_expires_at = NULL,
       lease_owner = NULL,
       next_sync_at = ?,
       consecutive_failures = ?,
       last_error_code = ?,
       updated_at = ?
     WHERE id = ? AND lease_owner = ?`,
  ).bind(
    new Date(now.getTime() + delayMinutes * 60_000).toISOString(),
    failures,
    (input.errorCode || "provider_unavailable").slice(0, 80),
    now.toISOString(),
    sourceId,
    leaseOwner,
  ).run();
}

export async function listDueJobSources(db: D1Database, limit = 10) {
  await ensureJobTrackingStorage(db);
  const safeLimit = Math.max(1, Math.min(20, Math.trunc(limit)));
  const now = new Date().toISOString();
  const result = await db.prepare(
    `SELECT sources.* FROM job_sources sources
     WHERE sources.active = 1 AND sources.next_sync_at <= ?
       AND (sources.lease_expires_at IS NULL OR sources.lease_expires_at <= ?)
       AND EXISTS (
         SELECT 1 FROM job_source_subscriptions subscriptions
         WHERE subscriptions.source_id = sources.id AND subscriptions.active = 1
       )
     ORDER BY sources.next_sync_at ASC
     LIMIT ?`,
  ).bind(now, now, safeLimit).all<JobSourceRecord>();
  return result.results;
}

export async function getJobSourceById(db: D1Database, sourceId: string) {
  await ensureJobTrackingStorage(db);
  return db.prepare(`SELECT * FROM job_sources WHERE id = ? LIMIT 1`)
    .bind(sourceId).first<JobSourceRecord>();
}

export async function listSourcePostings(db: D1Database, sourceId: string) {
  await ensureJobTrackingStorage(db);
  const result = await db.prepare(`SELECT * FROM job_postings WHERE source_id = ?`)
    .bind(sourceId).all<JobPostingRecord>();
  return result.results;
}

export async function executeJobTrackingBatch(
  db: D1Database,
  statements: D1PreparedStatement[],
  chunkSize = 50,
) {
  for (let index = 0; index < statements.length; index += chunkSize) {
    await db.batch(statements.slice(index, index + chunkSize));
  }
}

function parseJob(value: string): JobSearchCandidate | null {
  try {
    return JSON.parse(value) as JobSearchCandidate;
  } catch {
    return null;
  }
}

export async function jobTrackingSnapshotForUser(
  db: D1Database,
  userId: string,
  afterCursor = 0,
  options: { includeJobs?: boolean; knownJobsVersion?: string } = {},
) {
  await ensureJobTrackingStorage(db);
  const safeCursor = Number.isSafeInteger(afterCursor) && afterCursor >= 0 ? afterCursor : 0;
  const subscriptions = await db.prepare(
    `SELECT
       subscriptions.id AS subscription_id,
       subscriptions.alerts_enabled,
       subscriptions.locale,
       sources.*,
       (SELECT COUNT(*) FROM job_postings postings WHERE postings.source_id = sources.id AND postings.active = 1) AS active_count,
       (SELECT COUNT(*) FROM job_change_events changes WHERE changes.source_id = sources.id AND changes.kind IN ('new','relisted') AND changes.occurred_at >= subscriptions.created_at) AS new_count,
       (SELECT COUNT(*) FROM job_change_events changes WHERE changes.source_id = sources.id AND changes.kind = 'updated' AND changes.occurred_at >= subscriptions.created_at) AS updated_count,
       (SELECT COUNT(*) FROM job_change_events changes WHERE changes.source_id = sources.id AND changes.kind = 'removed' AND changes.occurred_at >= subscriptions.created_at) AS removed_count
     FROM job_source_subscriptions subscriptions
     JOIN job_sources sources ON sources.id = subscriptions.source_id
     WHERE subscriptions.user_id = ? AND subscriptions.active = 1
     ORDER BY subscriptions.updated_at DESC`,
  ).bind(userId).all<Record<string, unknown>>();

  const changes = await db.prepare(
    `SELECT changes.*, sources.employer, sources.provider
     FROM job_change_events changes
     JOIN job_sources sources ON sources.id = changes.source_id
     JOIN job_source_subscriptions subscriptions ON subscriptions.source_id = changes.source_id
     WHERE subscriptions.user_id = ? AND subscriptions.active = 1
       AND subscriptions.alerts_enabled = 1 AND changes.id > ?
       AND changes.occurred_at > subscriptions.updated_at
     ORDER BY changes.id ASC
     LIMIT 101`,
  ).bind(userId, safeCursor).all<{
    id: number; source_id: string; job_id: string; kind: string;
    payload_json: string; occurred_at: string; employer: string; provider: string;
  }>();

  const jobVersionRow = await db.prepare(
    `SELECT COUNT(DISTINCT postings.id) AS total,
       COALESCE(MAX(postings.last_changed_at), '') AS changed_at
     FROM job_postings postings
     JOIN job_source_subscriptions subscriptions ON subscriptions.source_id = postings.source_id
     WHERE subscriptions.user_id = ? AND subscriptions.active = 1 AND postings.active = 1`,
  ).bind(userId).first<{ total: number; changed_at: string }>();
  const activeJobCount = Number(jobVersionRow?.total || 0);
  const jobsVersion = `${jobVersionRow?.changed_at || ""}:${activeJobCount}`;
  const includeJobs = options.includeJobs !== false || options.knownJobsVersion !== jobsVersion;
  const jobs = includeJobs
    ? await db.prepare(
        `SELECT postings.*, sources.provider, sources.employer, sources.last_success_at
         FROM job_postings postings
         JOIN job_sources sources ON sources.id = postings.source_id
         JOIN job_source_subscriptions subscriptions ON subscriptions.source_id = sources.id
         WHERE subscriptions.user_id = ? AND subscriptions.active = 1 AND postings.active = 1
         ORDER BY postings.last_changed_at DESC
         LIMIT 1000`,
      ).bind(userId).all<JobPostingRecord & { provider: string; employer: string; last_success_at: string | null }>()
    : { results: [] as Array<JobPostingRecord & { provider: string; employer: string; last_success_at: string | null }> };

  const destination = await db.prepare(
    `SELECT email, email_enabled, locale, verified_at, updated_at
     FROM job_notification_destinations WHERE user_id = ? LIMIT 1`,
  ).bind(userId).first<{
    email: string; email_enabled: number; locale: string; verified_at: string; updated_at: string;
  }>();

  const mappedJobs = jobs.results.flatMap((row) => {
    const job = parseJob(row.payload_json);
    return job ? [{
      ...job,
      description: String(job.description || "").slice(0, 8_000),
      tracking: {
        sourceId: row.source_id,
        lifecycle: row.active ? "active" : "removed",
        firstSeenAt: row.first_seen_at,
        lastSeenAt: row.last_seen_at,
        lastChangedAt: row.last_changed_at,
        removedAt: row.removed_at,
        sourceCheckedAt: row.last_success_at,
      },
    }] : [];
  });
  const changePage = changes.results.slice(0, 100);
  const mappedChanges = changePage.flatMap((row) => {
    const job = parseJob(row.payload_json);
    return job ? [{
      id: row.id,
      sourceId: row.source_id,
      jobId: row.job_id,
      kind: row.kind,
      occurredAt: row.occurred_at,
      employer: row.employer,
      provider: row.provider,
      job,
    }] : [];
  });
  const cursor = Math.max(safeCursor, ...mappedChanges.map((change) => change.id));

  return {
    subscriptions: subscriptions.results,
    jobs: mappedJobs,
    jobsIncluded: includeJobs,
    jobsVersion,
    activeJobCount,
    jobsTruncated: includeJobs && activeJobCount > mappedJobs.length,
    changes: mappedChanges,
    changesHasMore: changes.results.length > changePage.length,
    cursor,
    notification: destination ? {
      email: destination.email,
      emailEnabled: Boolean(destination.email_enabled),
      locale: destination.locale,
      verifiedAt: destination.verified_at,
      updatedAt: destination.updated_at,
    } : null,
    checkedAt: new Date().toISOString(),
  };
}

export async function deactivateJobSubscription(
  db: D1Database,
  userId: string,
  subscriptionId: string,
) {
  await ensureJobTrackingStorage(db);
  const now = new Date().toISOString();
  const owned = await db.prepare(
    `SELECT source_id FROM job_source_subscriptions WHERE id = ? AND user_id = ? AND active = 1 LIMIT 1`,
  ).bind(subscriptionId, userId).first<{ source_id: string }>();
  if (!owned) return false;
  await db.batch([
    db.prepare(
      `UPDATE job_source_subscriptions SET active = 0, alerts_enabled = 0, updated_at = ? WHERE id = ? AND user_id = ?`,
    ).bind(now, subscriptionId, userId),
    db.prepare(
      `UPDATE job_alerts SET state = 'cancelled'
       WHERE subscription_id = ? AND user_id = ?
         AND (state = 'pending' OR state LIKE 'sending:%')`,
    ).bind(subscriptionId, userId),
  ]);
  await db.prepare(
    `UPDATE job_sources SET active = CASE WHEN EXISTS (
       SELECT 1 FROM job_source_subscriptions WHERE source_id = ? AND active = 1
     ) THEN 1 ELSE 0 END, updated_at = ? WHERE id = ?`,
  ).bind(owned.source_id, now, owned.source_id).run();
  return true;
}

export async function getOwnedJobSource(
  db: D1Database,
  userId: string,
  subscriptionId: string,
) {
  await ensureJobTrackingStorage(db);
  return db.prepare(
    `SELECT sources.*, subscriptions.id AS subscription_id,
       subscriptions.alerts_enabled, subscriptions.locale
     FROM job_source_subscriptions subscriptions
     JOIN job_sources sources ON sources.id = subscriptions.source_id
     WHERE subscriptions.id = ? AND subscriptions.user_id = ? AND subscriptions.active = 1
     LIMIT 1`,
  ).bind(subscriptionId, userId).first<JobSourceRecord & {
    subscription_id: string;
    alerts_enabled: number;
    locale: string;
  }>();
}

export async function updateJobSubscription(
  db: D1Database,
  input: { userId: string; subscriptionId: string; alertsEnabled: boolean; locale: string },
) {
  await ensureJobTrackingStorage(db);
  const now = new Date().toISOString();
  const results = await db.batch([
    db.prepare(
      `UPDATE job_source_subscriptions
       SET alerts_enabled = ?, locale = ?, updated_at = ?
       WHERE id = ? AND user_id = ? AND active = 1`,
    ).bind(
      input.alertsEnabled ? 1 : 0,
      input.locale.slice(0, 16),
      now,
      input.subscriptionId,
      input.userId,
    ),
    db.prepare(
      `UPDATE job_alerts SET state = 'cancelled'
       WHERE subscription_id = ? AND user_id = ?
         AND (state = 'pending' OR state LIKE 'sending:%') AND ? = 0`,
    ).bind(input.subscriptionId, input.userId, input.alertsEnabled ? 1 : 0),
  ]);
  return Number(results[0]?.meta.changes || 0) === 1;
}

export async function updateJobNotificationDestination(
  db: D1Database,
  input: { userId: string; email: string; enabled: boolean; locale: string },
) {
  await ensureJobTrackingStorage(db);
  const now = new Date().toISOString();
  await db.batch([
    db.prepare(
      `INSERT INTO job_notification_destinations
        (user_id, email, email_enabled, locale, verified_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         email = excluded.email,
         email_enabled = excluded.email_enabled,
         locale = excluded.locale,
         verified_at = excluded.verified_at,
         updated_at = excluded.updated_at`,
    ).bind(input.userId, input.email, input.enabled ? 1 : 0, input.locale.slice(0, 16), now, now),
    db.prepare(
      `UPDATE job_alerts SET state = 'cancelled'
       WHERE user_id = ? AND channel = 'email'
         AND (state = 'pending' OR state LIKE 'sending:%') AND ? = 0`,
    ).bind(input.userId, input.enabled ? 1 : 0),
  ]);
}

export async function runJobTrackingRetention(db: D1Database) {
  await ensureJobTrackingStorage(db);
  const now = new Date();
  const dailyCutoff = new Date(now.getTime() - 24 * 60 * 60_000).toISOString();
  const claim = await db.prepare(
    `INSERT INTO job_tracking_maintenance (key, ran_at) VALUES ('retention', ?)
     ON CONFLICT(key) DO UPDATE SET ran_at = excluded.ran_at
     WHERE job_tracking_maintenance.ran_at <= ?`,
  ).bind(now.toISOString(), dailyCutoff).run();
  if (Number(claim.meta.changes || 0) !== 1) return { ran: false };

  const inactiveCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60_000).toISOString();
  const alertCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60_000).toISOString();
  const historyCutoff = new Date(now.getTime() - 180 * 24 * 60 * 60_000).toISOString();
  const results = await db.batch([
    db.prepare(
      `DELETE FROM job_alerts
       WHERE state IN ('sent', 'cancelled', 'failed') AND created_at < ?`,
    ).bind(alertCutoff),
    db.prepare(
      `DELETE FROM job_source_subscriptions WHERE active = 0 AND updated_at < ?`,
    ).bind(inactiveCutoff),
    db.prepare(
      `DELETE FROM job_notification_destinations WHERE email_enabled = 0 AND updated_at < ?`,
    ).bind(inactiveCutoff),
    db.prepare(
      `DELETE FROM job_change_events
       WHERE occurred_at < ? AND NOT EXISTS (
         SELECT 1 FROM job_alerts alerts WHERE alerts.change_id = job_change_events.id
       )`,
    ).bind(historyCutoff),
    db.prepare(
      `DELETE FROM job_postings
       WHERE active = 0 AND removed_at < ? AND NOT EXISTS (
         SELECT 1 FROM job_change_events changes WHERE changes.job_id = job_postings.id
       )`,
    ).bind(historyCutoff),
    db.prepare(
      `DELETE FROM job_sources
       WHERE active = 0 AND updated_at < ? AND NOT EXISTS (
         SELECT 1 FROM job_source_subscriptions subscriptions
         WHERE subscriptions.source_id = job_sources.id AND subscriptions.active = 1
       )`,
    ).bind(inactiveCutoff),
  ]);
  return {
    ran: true,
    deleted: results.reduce((sum, result) => sum + Number(result.meta.changes || 0), 0),
  };
}

export async function recordJobTrackingSchedulerHeartbeat(
  db: D1Database,
  phase: "started" | "succeeded",
  ranAt = new Date().toISOString(),
) {
  await ensureJobTrackingStorage(db);
  await db.prepare(
    `INSERT INTO job_tracking_maintenance (key, ran_at) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET ran_at = excluded.ran_at`,
  ).bind(`scheduler-${phase}`, ranAt).run();
}

export { JOB_TRACKING_DDL };
