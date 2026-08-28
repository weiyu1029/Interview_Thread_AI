import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { jobTrackingCopyFor } from "../app/job-tracking-copy.ts";
import { applyJobSourceSnapshot } from "../app/job-tracking-sync.ts";
import { LANGUAGES } from "../app/i18n.ts";
import { upsertJobSourceAndSubscription } from "../db/job-tracking.ts";

const PROJECT_ROOT = new URL("../", import.meta.url);

test("all 40 supported locales have complete job-tracking copy", () => {
  assert.equal(LANGUAGES.length, 40);
  const englishCopy = jobTrackingCopyFor("en");
  const englishFields = Object.keys(englishCopy).sort();
  const freshnessFields = ["eyebrow", "sources", "activeJobs", "checked", "everyFiveMinutes"];
  assert.equal(englishFields.length, 36);
  for (const [locale] of LANGUAGES) {
    const copy = jobTrackingCopyFor(locale);
    assert.deepEqual(Object.keys(copy).sort(), englishFields, `${locale} has the full copy schema`);
    for (const [field, value] of Object.entries(copy)) {
      assert.ok(value.trim(), `${locale}.${field} must not be empty`);
    }
    if (locale !== "en") {
      for (const field of freshnessFields) {
        assert.notEqual(
          copy[field],
          englishCopy[field],
          `${locale}.${field} must not expose the English freshness label`,
        );
      }
    }
  }
});

class FakeStatement {
  constructor(db, sql, params = []) {
    this.db = db;
    this.sql = sql;
    this.params = params;
  }

  bind(...params) {
    return new FakeStatement(this.db, this.sql, params);
  }

  async all() {
    return this.db.all(this);
  }

  async first() {
    return this.db.first(this);
  }

  async run() {
    return this.db.run(this);
  }
}

class FakeD1 {
  constructor({ postings = [], activeSubscriptionCount = 0 } = {}) {
    this.postings = structuredClone(postings);
    this.activeSubscriptionCount = activeSubscriptionCount;
    this.executed = [];
  }

  prepare(sql) {
    return new FakeStatement(this, sql);
  }

  async batch(statements) {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    return results;
  }

  async all(statement) {
    const compact = statement.sql.replace(/\s+/g, " ").trim();
    if (compact.startsWith("SELECT * FROM job_postings WHERE source_id = ?")) {
      return {
        results: structuredClone(
          this.postings.filter((posting) => posting.source_id === statement.params[0]),
        ),
      };
    }
    if (compact.startsWith("SELECT id, job_id, kind, occurred_at FROM job_change_events")) {
      return { results: [] };
    }
    if (compact.startsWith("SELECT id, user_id, alerts_enabled, created_at FROM job_source_subscriptions")) {
      return { results: [] };
    }
    return { results: [] };
  }

  async first(statement) {
    const compact = statement.sql.replace(/\s+/g, " ").trim();
    if (compact.startsWith("SELECT * FROM job_sources WHERE provider = ?")) return null;
    if (compact.startsWith("SELECT COUNT(*) AS count FROM job_source_subscriptions")) {
      return { count: this.activeSubscriptionCount };
    }
    return null;
  }

  async run(statement) {
    const compact = statement.sql.replace(/\s+/g, " ").trim();
    this.executed.push({ sql: compact, params: statement.params });

    if (compact.startsWith("INSERT OR IGNORE INTO job_postings")) {
      const [
        id, sourceId, externalJobId, canonicalUrl, payloadJson, contentHash,
        firstSeenAt, lastSeenAt, lastChangedAt, lastSeenSyncId,
      ] = statement.params;
      if (!this.postings.some((posting) => posting.id === id)) {
        this.postings.push({
          id,
          source_id: sourceId,
          external_job_id: externalJobId,
          canonical_url: canonicalUrl,
          payload_json: payloadJson,
          content_hash: contentHash,
          active: 1,
          first_seen_at: firstSeenAt,
          last_seen_at: lastSeenAt,
          last_changed_at: lastChangedAt,
          removed_at: null,
          last_seen_sync_id: lastSeenSyncId,
          missing_success_count: 0,
        });
      }
    } else if (compact.startsWith("UPDATE job_postings SET canonical_url = ?")) {
      const [
        canonicalUrl, payloadJson, contentHash, lastSeenAt,
        , lastChangedAt, lastSeenSyncId, id,
      ] = statement.params;
      const row = this.postings.find((posting) => posting.id === id);
      if (row) {
        const changed = row.content_hash !== contentHash || row.active === 0;
        row.canonical_url = canonicalUrl;
        row.payload_json = payloadJson;
        row.content_hash = contentHash;
        row.active = 1;
        row.last_seen_at = lastSeenAt;
        if (changed) row.last_changed_at = lastChangedAt;
        row.removed_at = null;
        row.last_seen_sync_id = lastSeenSyncId;
        row.missing_success_count = 0;
      }
    } else if (compact.startsWith("UPDATE job_postings SET missing_success_count = ?")) {
      const [count, id] = statement.params;
      const row = this.postings.find((posting) => posting.id === id);
      if (row?.active) row.missing_success_count = count;
    } else if (compact.startsWith("UPDATE job_postings SET active = 0")) {
      const [removedAt, lastChangedAt, missingCount, id] = statement.params;
      const row = this.postings.find((posting) => posting.id === id);
      if (row?.active) {
        row.active = 0;
        row.removed_at = removedAt;
        row.last_changed_at = lastChangedAt;
        row.missing_success_count = missingCount;
      }
    }
    return { meta: { changes: 1 } };
  }

  matching(fragment) {
    return this.executed.filter((entry) => entry.sql.includes(fragment));
  }
}

function source(overrides = {}) {
  return {
    id: "source-1",
    provider: "lever",
    account: "example",
    employer: "Example",
    active: 1,
    next_sync_at: "2026-08-21T00:00:00.000Z",
    last_sync_at: null,
    last_success_at: null,
    last_snapshot_complete: 0,
    successful_sync_count: 1,
    consecutive_failures: 0,
    lease_expires_at: null,
    lease_owner: null,
    last_error_code: null,
    created_at: "2026-08-21T00:00:00.000Z",
    updated_at: "2026-08-21T00:00:00.000Z",
    ...overrides,
  };
}

function snapshot({ jobs = [], completeSnapshot = true } = {}) {
  return {
    source: {
      id: "lever",
      name: "Lever Postings API",
      docsUrl: "https://github.com/lever/postings-api",
      access: "Public postings",
      account: "example",
      employer: "Example",
      retrievedAt: "2026-08-21T01:00:00.000Z",
      coverage: "One employer's published public job board",
      detailCoverage: "Full posting descriptions",
    },
    jobs,
    completeSnapshot,
  };
}

function existingPosting(overrides = {}) {
  return {
    id: "job-row-1",
    source_id: "source-1",
    external_job_id: "lever:example:job-1",
    canonical_url: "https://jobs.lever.co/example/job-1/apply",
    payload_json: JSON.stringify({
      id: "lever:example:job-1",
      title: "Existing role",
      company: "Example",
      applyUrl: "https://jobs.lever.co/example/job-1/apply",
    }),
    content_hash: "existing-content-hash",
    active: 1,
    first_seen_at: "2026-08-21T00:00:00.000Z",
    last_seen_at: "2026-08-21T00:00:00.000Z",
    last_changed_at: "2026-08-21T00:00:00.000Z",
    removed_at: null,
    last_seen_sync_id: "previous-sync",
    missing_success_count: 0,
    ...overrides,
  };
}

test("the first successful snapshot establishes a baseline without change notifications", async () => {
  const db = new FakeD1();

  const result = await applyJobSourceSnapshot(
    db,
    source({ successful_sync_count: 0 }),
    snapshot({
      jobs: [{
        id: "lever:example:new-job",
        title: "New role",
        company: "Example",
        description: "A newly discovered job",
        applyUrl: "https://jobs.lever.co/example/new-job/apply",
      }],
    }),
  );

  assert.equal(result.baseline, true);
  assert.equal(db.postings.length, 1);
  assert.equal(db.matching("INSERT OR IGNORE INTO job_change_events").length, 0);
});

test("an incomplete snapshot never advances missing or removed state", async () => {
  const db = new FakeD1({
    postings: [existingPosting({ missing_success_count: 1 })],
  });

  await applyJobSourceSnapshot(
    db,
    source(),
    snapshot({ jobs: [], completeSnapshot: false }),
  );

  assert.equal(db.postings[0].active, 1);
  assert.equal(db.postings[0].missing_success_count, 1);
  assert.equal(db.matching("UPDATE job_postings SET missing_success_count").length, 0);
  assert.equal(db.matching("UPDATE job_postings SET active = 0").length, 0);
});

test("a posting is removed only after two consecutive complete snapshots miss it", async () => {
  const db = new FakeD1({ postings: [existingPosting()] });
  const trackedSource = source();

  await applyJobSourceSnapshot(
    db,
    trackedSource,
    snapshot({ jobs: [], completeSnapshot: true }),
  );
  assert.equal(db.postings[0].active, 1);
  assert.equal(db.postings[0].missing_success_count, 1);
  assert.equal(db.matching("UPDATE job_postings SET active = 0").length, 0);

  await applyJobSourceSnapshot(
    db,
    trackedSource,
    snapshot({ jobs: [], completeSnapshot: true }),
  );
  assert.equal(db.postings[0].active, 0);
  assert.equal(db.postings[0].missing_success_count, 2);
  assert.equal(db.matching("UPDATE job_postings SET active = 0").length, 1);
  assert.equal(
    db.matching("INSERT OR IGNORE INTO job_change_events").filter(
      (entry) => entry.sql.includes("'removed'"),
    ).length,
    1,
  );
});

test("seeing a posting between complete misses resets the removal counter", async () => {
  const db = new FakeD1({ postings: [existingPosting()] });
  const trackedSource = source();

  await applyJobSourceSnapshot(
    db,
    trackedSource,
    snapshot({ jobs: [], completeSnapshot: true }),
  );
  assert.equal(db.postings[0].missing_success_count, 1);

  await applyJobSourceSnapshot(
    db,
    trackedSource,
    snapshot({
      jobs: [{
        id: "lever:example:job-1",
        title: "Existing role",
        company: "Example",
        applyUrl: "https://jobs.lever.co/example/job-1/apply",
      }],
      completeSnapshot: true,
    }),
  );
  assert.equal(db.postings[0].missing_success_count, 0);

  await applyJobSourceSnapshot(
    db,
    trackedSource,
    snapshot({ jobs: [], completeSnapshot: true }),
  );
  assert.equal(db.postings[0].active, 1);
  assert.equal(db.postings[0].missing_success_count, 1);
});

test("a user cannot subscribe to more than 20 active employers", async () => {
  const db = new FakeD1({ activeSubscriptionCount: 20 });

  await assert.rejects(
    upsertJobSourceAndSubscription(db, {
      userId: "user-1",
      provider: "lever",
      account: "twenty-first-employer",
      employer: "Twenty First Employer",
      locale: "en",
    }),
    /source_limit_reached/,
  );
  assert.equal(
    db.matching("INSERT INTO job_sources").length,
    0,
    "the limit must be enforced before writes",
  );
});

test("scheduled sync runs every five minutes and schedules background work", async () => {
  const [vite, worker, database] = await Promise.all([
    readFile(new URL("vite.config.ts", PROJECT_ROOT), "utf8"),
    readFile(new URL("worker/index.ts", PROJECT_ROOT), "utf8"),
    readFile(new URL("db/job-tracking.ts", PROJECT_ROOT), "utf8"),
  ]);

  assert.match(vite, /crons:\s*\["\*\/5 \* \* \* \*"\]/);
  assert.match(worker, /async scheduled\s*\(/);
  assert.match(worker, /ctx\.waitUntil\s*\(/);
  assert.match(worker, /runDueJobSyncs\(env\.DB,\s*20\)/);
  assert.match(database, /now\.getTime\(\) \+ 5 \* 60_000/);
  assert.match(database, /now\.getTime\(\) \+ 10 \* 60_000/);
  assert.match(database, /lease_expires_at IS NULL OR sources\.lease_expires_at <= \?/);
  assert.match(database, /lease_owner = \?/);
  assert.match(database, /WHERE id = \? AND lease_owner = \?/);
  assert.match(worker, /runJobTrackingRetention\(env\.DB\)/);
});

test("job-tracking APIs require authentication and mark user data private", async () => {
  const routePaths = [
    "app/api/job-sources/route.ts",
    "app/api/job-sources/[id]/route.ts",
    "app/api/job-sources/[id]/refresh/route.ts",
    "app/api/job-alert-preferences/route.ts",
  ];
  const routes = await Promise.all(
    routePaths.map(async (path) => [
      path,
      await readFile(new URL(path, PROJECT_ROOT), "utf8"),
    ]),
  );

  for (const [path, contents] of routes) {
    assert.match(contents, /getAppUser\s*\(/, `${path} must authenticate callers`);
    assert.match(contents, /sign_in_required/, `${path} must reject anonymous callers`);
    assert.match(contents, /Cache-Control/, `${path} must set an explicit cache policy`);
    assert.match(contents, /private, no-store/, `${path} must not publicly cache user data`);
  }

  const createRoute = routes.find(([path]) => path.endsWith("job-sources/route.ts"))[1];
  assert.ok(
    createRoute.indexOf("const user = await getAppUser()")
      < createRoute.indexOf("const snapshot = await fetchJobSourceSnapshot"),
    "authentication must happen before an employer source fetch",
  );
  assert.ok(
    createRoute.indexOf("findActiveOwnedJobSource")
      < createRoute.indexOf("const snapshot = await fetchJobSourceSnapshot"),
    "an already tracked source must be returned before another provider fetch",
  );
  const database = await readFile(new URL("db/job-tracking.ts", PROJECT_ROOT), "utf8");
  assert.match(database, /changes\.id ASC\s+LIMIT 101/);
  assert.match(database, /changesHasMore:/);
});

test("public job snapshots bypass stale caches and expose retrieval freshness", async () => {
  const route = await readFile(new URL("app/api/jobs/route.ts", PROJECT_ROOT), "utf8");

  assert.match(route, /const retrievedAt = snapshot\.source\.retrievedAt/);
  assert.match(route, /retrievedAt,\s*\n\s*freshness:\s*\{/);
  assert.match(route, /updateMode:\s*"on-demand"/);
  assert.match(route, /sourceKind:\s*"official-employer-board"/);
  assert.match(route, /cached:\s*false/);
  assert.match(route, /"Cache-Control":\s*"no-store"/);
  assert.equal(
    [...route.matchAll(/headers: NO_STORE_HEADERS/g)].length,
    3,
    "success, validation, and provider-error responses must all be non-cacheable",
  );
  assert.match(route, /status: clientError \? 400 : 502, headers: NO_STORE_HEADERS/);
  assert.doesNotMatch(route, /stale-while-revalidate/);
  assert.doesNotMatch(route, /max-age=300/);
});

test("market insights distinguish tracked-board signals from demonstration data", async () => {
  const page = await readFile(new URL("app/page.tsx", PROJECT_ROOT), "utf8");

  assert.match(
    page,
    /const hasTrackedBoardSignal =\s*authenticated && trackedSourceCount > 0 && sourceJobs !== null/,
    "tracked jobs must not depend on ad-hoc sourceMeta",
  );
  assert.match(page, /Tracked-board signal/);
  assert.match(page, /scheduled to refresh about every five minutes/);
  assert.match(page, /not the global labor market/);
  assert.match(page, /trackingLastSuccessLabel/);
  assert.match(page, /trackedSourceCount/);
  assert.match(page, /Demonstration data only—not live job-market totals/);
  assert.match(page, /jobTrackingCopyFor\(locale\)/);
  assert.match(page, /jobTrackingUi\.everyFiveMinutes/);
  assert.match(page, /jobTrackingUi\.checked/);
  assert.match(page, /detail\.sourcePolicy/);
});

test("the five-minute scheduler records started and successful heartbeats", async () => {
  const worker = await readFile(new URL("worker/index.ts", PROJECT_ROOT), "utf8");
  const database = await readFile(
    new URL("db/job-tracking.ts", PROJECT_ROOT),
    "utf8",
  );

  assert.match(worker, /recordJobTrackingSchedulerHeartbeat/);
  assert.match(worker, /"started"/);
  assert.match(worker, /"succeeded"/);
  assert.match(worker, /new Date\(controller\.scheduledTime\)\.toISOString\(\)/);
  assert.match(database, /scheduler-\$\{phase\}/);
  assert.match(database, /ON CONFLICT\(key\) DO UPDATE SET ran_at = excluded\.ran_at/);
});
