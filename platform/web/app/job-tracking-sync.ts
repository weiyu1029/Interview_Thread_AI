import {
  acquireJobSourceLease,
  ensureJobTrackingStorage,
  getJobSourceById,
  listDueJobSources,
  listSourcePostings,
  releaseJobSourceLease,
  type JobPostingRecord,
  type JobSourceRecord,
} from "../db/job-tracking.ts";
import type { JobSearchCandidate } from "./job-search.ts";
import {
  fetchJobSourceSnapshot,
  jobSourceErrorCode,
  type JobSourceSnapshot,
} from "./job-source-gateway.ts";

type ChangeKind = "new" | "updated" | "removed" | "relisted";

function canonicalApplyUrl(value: string | undefined) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|gh_src|lever-source|source|ref)/i.test(key)) url.searchParams.delete(key);
    }
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function boundedJob(job: JobSearchCandidate): JobSearchCandidate {
  return {
    id: String(job.id || "").slice(0, 1_000),
    title: String(job.title || "Untitled role").slice(0, 500),
    company: String(job.company || "").slice(0, 500),
    description: String(job.description || "").slice(0, 32_000),
    department: String(job.department || "").slice(0, 500),
    region: String(job.region || "Worldwide").slice(0, 100),
    country: String(job.country || "Unspecified").slice(0, 100),
    city: String(job.city || "Location not specified").slice(0, 500),
    workStyle: String(job.workStyle || "Unspecified").slice(0, 100),
    industry: String(job.industry || "Other").slice(0, 500),
    employmentType: String(job.employmentType || "").slice(0, 100),
    seniority: String(job.seniority || "").slice(0, 100),
    salaryMin: Number.isFinite(job.salaryMin) ? job.salaryMin : undefined,
    salaryMax: Number.isFinite(job.salaryMax) ? job.salaryMax : undefined,
    latitude: Number.isFinite(job.latitude) ? job.latitude : undefined,
    longitude: Number.isFinite(job.longitude) ? job.longitude : undefined,
    publishedAt: String(job.publishedAt || "").slice(0, 100),
    source: String(job.source || "").slice(0, 100),
    sourceUrl: canonicalApplyUrl(job.sourceUrl),
    applyUrl: canonicalApplyUrl(job.applyUrl),
    isLive: true,
  };
}

function notificationJob(job: JobSearchCandidate) {
  return {
    id: job.id,
    title: String(job.title || "Untitled role").slice(0, 500),
    company: String(job.company || "").slice(0, 500),
    city: String(job.city || "").slice(0, 500),
    country: String(job.country || "").slice(0, 100),
    workStyle: String(job.workStyle || "").slice(0, 100),
    source: String(job.source || "").slice(0, 100),
    sourceUrl: canonicalApplyUrl(job.sourceUrl),
    applyUrl: canonicalApplyUrl(job.applyUrl),
    publishedAt: String(job.publishedAt || "").slice(0, 100),
  };
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function postingIdentity(sourceId: string, externalJobId: string) {
  return `job_${(await sha256(`${sourceId}\n${externalJobId}`)).slice(0, 40)}`;
}

function statementGroups<T>(items: T[], build: (item: T) => D1PreparedStatement[]) {
  const groups: D1PreparedStatement[][] = [];
  let current: D1PreparedStatement[] = [];
  for (const item of items) {
    const statements = build(item);
    if (current.length + statements.length > 40 && current.length) {
      groups.push(current);
      current = [];
    }
    current.push(...statements);
  }
  if (current.length) groups.push(current);
  return groups;
}

async function reconcileAlertsForSource(db: D1Database, sourceId: string) {
  const now = new Date().toISOString();
  // This is a replayable transactional-outbox reconciliation, not a one-shot
  // step for only the current sync. If a prior posting batch committed and the
  // worker failed before alert creation, the next successful sync repairs it.
  await db.batch([
    db.prepare(
      `INSERT OR IGNORE INTO job_alerts
        (id, user_id, subscription_id, change_id, job_id, channel, state,
         attempt_count, next_attempt_at, created_at, delivered_at)
       SELECT lower(hex(randomblob(16))), subscriptions.user_id, subscriptions.id,
         changes.id, changes.job_id, 'in_app', 'sent', 0, ?, ?, ?
       FROM job_change_events changes
       JOIN job_source_subscriptions subscriptions ON subscriptions.source_id = changes.source_id
       WHERE changes.source_id = ? AND subscriptions.active = 1
         AND subscriptions.alerts_enabled = 1
         AND changes.id > subscriptions.last_reconciled_change_id
         AND changes.occurred_at > subscriptions.updated_at`,
    ).bind(now, now, now, sourceId),
    db.prepare(
      `INSERT OR IGNORE INTO job_alerts
        (id, user_id, subscription_id, change_id, job_id, channel, state,
         attempt_count, next_attempt_at, created_at)
       SELECT lower(hex(randomblob(16))), subscriptions.user_id, subscriptions.id,
         changes.id, changes.job_id, 'email', 'pending', 0, ?, ?
       FROM job_change_events changes
       JOIN job_source_subscriptions subscriptions ON subscriptions.source_id = changes.source_id
       JOIN job_notification_destinations destinations ON destinations.user_id = subscriptions.user_id
       WHERE changes.source_id = ? AND changes.kind IN ('new', 'relisted')
         AND subscriptions.active = 1 AND subscriptions.alerts_enabled = 1
         AND destinations.email_enabled = 1
         AND changes.id > subscriptions.last_reconciled_change_id
         AND changes.occurred_at > subscriptions.updated_at
         AND changes.occurred_at > destinations.verified_at`,
    ).bind(now, now, sourceId),
    db.prepare(
      `UPDATE job_source_subscriptions
       SET last_reconciled_change_id = COALESCE(
         (SELECT MAX(changes.id) FROM job_change_events changes WHERE changes.source_id = ?),
         last_reconciled_change_id
       )
       WHERE source_id = ? AND active = 1`,
    ).bind(sourceId, sourceId),
  ]);
}

export async function applyJobSourceSnapshot(
  db: D1Database,
  source: JobSourceRecord,
  snapshot: JobSourceSnapshot,
  leaseOwner: string,
) {
  await ensureJobTrackingStorage(db);
  if (leaseOwner) {
    const lease = await db.prepare(
      `SELECT id FROM job_sources WHERE id = ? AND lease_owner = ?
       AND lease_expires_at > ? LIMIT 1`,
    ).bind(source.id, leaseOwner, new Date().toISOString()).first<{ id: string }>();
    if (!lease) throw new Error("source_lease_lost");
  }
  const now = snapshot.source.retrievedAt || new Date().toISOString();
  const syncId = crypto.randomUUID();
  const baseline = source.successful_sync_count === 0;
  const existing = await listSourcePostings(db, source.id);
  const existingByExternalId = new Map(existing.map((row) => [row.external_job_id, row]));
  const seen = new Set<string>();
  const prepared = await Promise.all(snapshot.jobs.map(async (rawJob) => {
    const job = boundedJob(rawJob);
    const externalJobId = job.id;
    const payloadJson = JSON.stringify(job);
    const contentHash = await sha256(payloadJson);
    return {
      job,
      externalJobId,
      payloadJson,
      contentHash,
      canonicalUrl: canonicalApplyUrl(job.applyUrl || job.sourceUrl),
      postingId: await postingIdentity(source.id, externalJobId),
      existing: existingByExternalId.get(externalJobId),
    };
  }));

  const groups = statementGroups(prepared, (item) => {
    seen.add(item.externalJobId);
    const row = item.existing;
    const statements: D1PreparedStatement[] = [];
    let kind: ChangeKind | null = null;
    if (!row) {
      statements.push(
        db.prepare(
          `INSERT OR IGNORE INTO job_postings
            (id, source_id, external_job_id, canonical_url, payload_json,
             content_hash, active, first_seen_at, last_seen_at, last_changed_at,
             removed_at, last_seen_sync_id, missing_success_count)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, NULL, ?, 0)`,
        ).bind(
          item.postingId, source.id, item.externalJobId, item.canonicalUrl,
          item.payloadJson, item.contentHash, now, now, now, syncId,
        ),
      );
      kind = "new";
    } else {
      if (!row.active) kind = "relisted";
      else if (row.content_hash !== item.contentHash) kind = "updated";
      statements.push(
        db.prepare(
          `UPDATE job_postings SET
             canonical_url = ?, payload_json = ?, content_hash = ?, active = 1,
             last_seen_at = ?, last_changed_at = CASE WHEN content_hash <> ? OR active = 0 THEN ? ELSE last_changed_at END,
             removed_at = NULL, last_seen_sync_id = ?, missing_success_count = 0
           WHERE id = ?`,
        ).bind(
          item.canonicalUrl, item.payloadJson, item.contentHash, now,
          item.contentHash, now, syncId, row.id,
        ),
      );
    }
    if (!baseline && kind) {
      const eventKey = kind === "updated"
        ? `updated:${item.contentHash}:${row?.last_changed_at || "unknown"}`
        : kind === "relisted"
          ? `relisted:${item.contentHash}:${row?.removed_at || row?.last_changed_at || "unknown"}`
          : `first:${item.contentHash}`;
      statements.push(
        db.prepare(
          `INSERT OR IGNORE INTO job_change_events
            (source_id, job_id, kind, sync_id, event_key, content_hash, payload_json, occurred_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          source.id, row?.id || item.postingId, kind, syncId, eventKey,
          item.contentHash, JSON.stringify(notificationJob(item.job)), now,
        ),
      );
    }
    return statements;
  });
  for (const statements of groups) await db.batch(statements);

  if (snapshot.completeSnapshot) {
    const missing = existing.filter((row) => row.active && !seen.has(row.external_job_id));
    const missingGroups = statementGroups(missing, (row: JobPostingRecord) => {
      const nextMissingCount = row.missing_success_count + 1;
      if (nextMissingCount < 2) {
        return [db.prepare(
          `UPDATE job_postings SET missing_success_count = ? WHERE id = ? AND active = 1`,
        ).bind(nextMissingCount, row.id)];
      }
      const statements = [
        db.prepare(
          `UPDATE job_postings SET active = 0, removed_at = ?, last_changed_at = ?,
             missing_success_count = ? WHERE id = ? AND active = 1`,
        ).bind(now, now, nextMissingCount, row.id),
      ];
      if (!baseline) {
        const storedJob = (() => {
          try { return JSON.parse(row.payload_json) as JobSearchCandidate; }
          catch { return { id: row.external_job_id, title: "Untitled role" }; }
        })();
        statements.push(
          db.prepare(
            `INSERT OR IGNORE INTO job_change_events
              (source_id, job_id, kind, sync_id, event_key, content_hash, payload_json, occurred_at)
             VALUES (?, ?, 'removed', ?, ?, ?, ?, ?)`,
          ).bind(
            source.id, row.id, syncId,
            `removed:${row.content_hash}:${row.last_seen_at}`,
            row.content_hash, JSON.stringify(notificationJob(storedJob)), now,
          ),
        );
      }
      return statements;
    });
    for (const statements of missingGroups) await db.batch(statements);
  }

  await reconcileAlertsForSource(db, source.id);
  await releaseJobSourceLease(db, source.id, leaseOwner, {
    success: true,
    complete: snapshot.completeSnapshot,
  });
  return { syncId, baseline, count: prepared.length, completeSnapshot: snapshot.completeSnapshot };
}

export async function syncJobSource(
  db: D1Database,
  sourceOrId: JobSourceRecord | string,
  suppliedSnapshot?: JobSourceSnapshot,
) {
  const source = typeof sourceOrId === "string"
    ? await getJobSourceById(db, sourceOrId)
    : sourceOrId;
  if (!source) throw new Error("source_not_found");
  const leaseOwner = await acquireJobSourceLease(db, source.id);
  if (!leaseOwner) return { skipped: "leased" as const };
  try {
    const snapshot = suppliedSnapshot || await fetchJobSourceSnapshot(source.provider, source.account);
    return await applyJobSourceSnapshot(db, source, snapshot, leaseOwner);
  } catch (error) {
    await releaseJobSourceLease(db, source.id, leaseOwner, {
      success: false,
      errorCode: jobSourceErrorCode(error),
    });
    throw error;
  }
}

export async function runDueJobSyncs(db: D1Database, batchSize = 20) {
  const sources = await listDueJobSources(db, batchSize);
  const results: Array<{ sourceId: string; ok: boolean; count?: number; errorCode?: string }> = [];
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < sources.length) {
      const source = sources[nextIndex++];
      try {
        const result = await syncJobSource(db, source);
        results.push({
          sourceId: source.id,
          ok: true,
          count: "count" in result ? result.count : 0,
        });
      } catch (error) {
        results.push({ sourceId: source.id, ok: false, errorCode: jobSourceErrorCode(error) });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, sources.length) }, () => worker()));
  return results;
}
