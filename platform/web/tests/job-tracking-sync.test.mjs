import assert from "node:assert/strict";
import test from "node:test";
import { Miniflare } from "miniflare";
import {
  acquireJobSourceLease,
  deactivateJobSubscription,
  getJobSourceById,
  releaseJobSourceLease,
  runJobTrackingRetention,
  updateJobNotificationDestination,
  upsertJobSourceAndSubscription,
} from "../db/job-tracking.ts";
import { syncJobSource } from "../app/job-tracking-sync.ts";
import { deliverPendingJobAlertDigests } from "../app/job-alert-delivery.ts";

// Miniflare opens a loopback socket for its local D1 runtime. Keep the
// hermetic default suite portable and run this state-machine test explicitly
// in CI or locally with JOB_TRACKING_INTEGRATION=1.
const integrationTest = process.env.JOB_TRACKING_INTEGRATION === "1" ? test : test.skip;

function job(id, title = `Role ${id}`) {
  return {
    id,
    title,
    company: "Example Company",
    city: "Chicago",
    country: "United States",
    source: "Greenhouse",
    sourceUrl: `https://boards.greenhouse.io/example/jobs/${id}`,
    applyUrl: `https://boards.greenhouse.io/example/jobs/${id}`,
    isLive: true,
  };
}

function snapshot(jobs, offset, completeSnapshot = true) {
  return {
    source: {
      id: "greenhouse",
      name: "Greenhouse Job Board API",
      docsUrl: "https://developers.greenhouse.io/job-board.html",
      access: "Public published jobs",
      account: "example",
      employer: "Example",
      retrievedAt: new Date(Date.now() + offset).toISOString(),
      coverage: "Official employer board",
      detailCoverage: "Full posting descriptions",
    },
    jobs,
    completeSnapshot,
  };
}

async function database(t) {
  const mf = new Miniflare({
    modules: true,
    script: "export default { fetch() { return new Response('ok') } }",
    d1Databases: ["DB"],
  });
  t.after(() => mf.dispose());
  return mf.getD1Database("DB");
}

async function first(db, sql, ...values) {
  return db.prepare(sql).bind(...values).first();
}

integrationTest("D1 tracking baselines quietly and removes only after two complete misses", async (t) => {
  const db = await database(t);
  const { source } = await upsertJobSourceAndSubscription(db, {
    userId: "user-1",
    provider: "greenhouse",
    account: "example",
    employer: "Example",
    locale: "en",
  });

  await syncJobSource(db, source, snapshot([job("a"), job("b")], 1_000));
  assert.equal((await first(db, "SELECT COUNT(*) AS count FROM job_change_events")).count, 0);
  assert.equal((await first(db, "SELECT COUNT(*) AS count FROM job_alerts")).count, 0);

  await syncJobSource(db, source.id, snapshot([job("a")], 2_000));
  let missing = await first(db, "SELECT active, missing_success_count FROM job_postings WHERE external_job_id = 'b'");
  assert.deepEqual({ active: missing.active, missing: missing.missing_success_count }, { active: 1, missing: 1 });

  await syncJobSource(db, source.id, snapshot([], 3_000, false));
  missing = await first(db, "SELECT active, missing_success_count FROM job_postings WHERE external_job_id = 'b'");
  assert.deepEqual({ active: missing.active, missing: missing.missing_success_count }, { active: 1, missing: 1 });

  await syncJobSource(db, source.id, snapshot([job("a")], 4_000));
  missing = await first(db, "SELECT active, missing_success_count FROM job_postings WHERE external_job_id = 'b'");
  assert.deepEqual({ active: missing.active, missing: missing.missing_success_count }, { active: 0, missing: 2 });
  assert.equal((await first(db, "SELECT COUNT(*) AS count FROM job_change_events WHERE kind = 'removed'")).count, 1);
  assert.equal((await first(db, "SELECT COUNT(*) AS count FROM job_alerts WHERE channel = 'email'")).count, 0);
});

integrationTest("D1 tracking deduplicates changes, supports repeated relists, and emails only after opt-in", async (t) => {
  const db = await database(t);
  const { source } = await upsertJobSourceAndSubscription(db, {
    userId: "user-2",
    provider: "greenhouse",
    account: "example",
    employer: "Example",
    locale: "en",
  });
  // Events discovered before notification opt-in must compare earlier than the
  // destination's real verified_at timestamp. Avoid future-dating these test
  // snapshots, which would invert that ordering and backfill an old event.
  await syncJobSource(db, source, snapshot([job("a")], -10_000));

  await syncJobSource(db, source.id, snapshot([job("a"), job("b")], -9_000));
  await syncJobSource(db, source.id, snapshot([job("a"), job("b")], -8_000));
  assert.equal((await first(db, "SELECT COUNT(*) AS count FROM job_change_events WHERE kind = 'new'")).count, 1);
  assert.equal((await first(db, "SELECT COUNT(*) AS count FROM job_alerts WHERE channel = 'email'")).count, 0);

  await updateJobNotificationDestination(db, {
    userId: "user-2",
    email: "verified@example.com",
    enabled: true,
    locale: "en",
  });
  await syncJobSource(db, source.id, snapshot([job("a"), job("b"), job("c")], 4_000));
  assert.equal((await first(db, "SELECT COUNT(*) AS count FROM job_alerts WHERE channel = 'email'")).count, 1);

  await syncJobSource(db, source.id, snapshot([job("a"), job("c")], 5_000));
  await syncJobSource(db, source.id, snapshot([job("a"), job("c")], 6_000));
  await syncJobSource(db, source.id, snapshot([job("a"), job("b"), job("c")], 7_000));
  assert.equal((await first(db, "SELECT COUNT(*) AS count FROM job_change_events WHERE kind = 'relisted'")).count, 1);

  await syncJobSource(db, source.id, snapshot([job("a"), job("c")], 8_000));
  await syncJobSource(db, source.id, snapshot([job("a"), job("c")], 9_000));
  await syncJobSource(db, source.id, snapshot([job("a"), job("b"), job("c")], 10_000));
  assert.equal((await first(db, "SELECT COUNT(*) AS count FROM job_change_events WHERE kind = 'relisted'")).count, 2);

  const current = await getJobSourceById(db, source.id);
  assert.equal(current.successful_sync_count, 10);
  assert.equal(current.last_snapshot_complete, 1);
});

integrationTest("D1 outbox reconciliation repairs a missing alert on the next sync", async (t) => {
  const db = await database(t);
  const { source } = await upsertJobSourceAndSubscription(db, {
    userId: "user-replay",
    provider: "greenhouse",
    account: "replay-example",
    employer: "Replay Example",
    locale: "en",
  });
  await updateJobNotificationDestination(db, {
    userId: "user-replay",
    email: "verified@example.com",
    enabled: true,
    locale: "en",
  });

  await syncJobSource(db, source, snapshot([job("a")], 1_000));
  await syncJobSource(db, source.id, snapshot([job("a"), job("b")], 2_000));
  assert.equal((await first(
    db,
    "SELECT COUNT(*) AS count FROM job_alerts WHERE channel = 'email'",
  )).count, 1);

  await db.prepare("DELETE FROM job_alerts WHERE channel = 'email'").run();
  await db.prepare(
    "UPDATE job_source_subscriptions SET last_reconciled_change_id = 0 WHERE user_id = ?",
  ).bind("user-replay").run();
  assert.equal((await first(
    db,
    "SELECT COUNT(*) AS count FROM job_alerts WHERE channel = 'email'",
  )).count, 0);

  await syncJobSource(db, source.id, snapshot([job("a"), job("b")], 3_000));
  assert.equal((await first(
    db,
    "SELECT COUNT(*) AS count FROM job_alerts WHERE channel = 'email'",
  )).count, 1);
});

integrationTest("an inactive subscription must pass the 20-company quota before reactivation", async (t) => {
  const db = await database(t);
  const firstSubscription = await upsertJobSourceAndSubscription(db, {
    userId: "reactivation-user",
    provider: "greenhouse",
    account: "inactive-source",
    employer: "Inactive Source",
    locale: "en",
  });
  await deactivateJobSubscription(db, "reactivation-user", firstSubscription.subscription.id);
  for (let index = 0; index < 20; index += 1) {
    await upsertJobSourceAndSubscription(db, {
      userId: "reactivation-user",
      provider: "greenhouse",
      account: `active-${index}`,
      employer: `Active ${index}`,
      locale: "en",
    });
  }

  await assert.rejects(
    upsertJobSourceAndSubscription(db, {
      userId: "reactivation-user",
      provider: "greenhouse",
      account: "inactive-source",
      employer: "Inactive Source",
      locale: "en",
    }),
    /source_limit_reached/,
  );
  assert.equal(
    (await first(db, "SELECT COUNT(*) AS count FROM job_source_subscriptions WHERE user_id = ? AND active = 1", "reactivation-user")).count,
    20,
  );
});

integrationTest("an expired worker cannot release a newer source lease", async (t) => {
  const db = await database(t);
  const { source } = await upsertJobSourceAndSubscription(db, {
    userId: "lease-user",
    provider: "greenhouse",
    account: "lease-source",
    employer: "Lease Source",
    locale: "en",
  });
  const oldOwner = await acquireJobSourceLease(db, source.id);
  assert.ok(oldOwner);
  await db.prepare("UPDATE job_sources SET lease_expires_at = ? WHERE id = ?")
    .bind("2000-01-01T00:00:00.000Z", source.id).run();
  const newOwner = await acquireJobSourceLease(db, source.id);
  assert.ok(newOwner);
  assert.notEqual(newOwner, oldOwner);

  await releaseJobSourceLease(db, source.id, oldOwner, { success: true, complete: true });
  const stillLeased = await getJobSourceById(db, source.id);
  assert.equal(stillLeased.lease_owner, newOwner);
});

integrationTest("overlapping notification workers claim an email alert only once", async (t) => {
  const db = await database(t);
  const { source } = await upsertJobSourceAndSubscription(db, {
    userId: "delivery-user",
    provider: "greenhouse",
    account: "delivery-source",
    employer: "Delivery Source",
    locale: "en",
  });
  await updateJobNotificationDestination(db, {
    userId: "delivery-user",
    email: "verified@example.com",
    enabled: true,
    locale: "en",
  });
  await syncJobSource(db, source, snapshot([job("baseline")], -2_000));
  await syncJobSource(db, source.id, snapshot([job("baseline"), job("new-role")], 2_000));

  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  globalThis.fetch = async () => {
    providerCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 25));
    return new Response("{}", { status: 200 });
  };
  t.after(() => { globalThis.fetch = originalFetch; });
  const environment = {
    RESEND_API_KEY: "test-key",
    EMAIL_FROM: "InterviewThread <notifications@send.interviewthreadai.com>",
  };
  await Promise.all([
    deliverPendingJobAlertDigests(db, environment),
    deliverPendingJobAlertDigests(db, environment),
  ]);

  assert.equal(providerCalls, 1);
  assert.equal(
    (await first(db, "SELECT COUNT(*) AS count FROM job_alerts WHERE channel = 'email' AND state = 'sent'")).count,
    1,
  );
});

integrationTest("daily retention removes stale opt-outs and unused sources", async (t) => {
  const db = await database(t);
  const { source, subscription } = await upsertJobSourceAndSubscription(db, {
    userId: "retention-user",
    provider: "greenhouse",
    account: "retention-source",
    employer: "Retention Source",
    locale: "en",
  });
  await updateJobNotificationDestination(db, {
    userId: "retention-user",
    email: "verified@example.com",
    enabled: false,
    locale: "en",
  });
  await deactivateJobSubscription(db, "retention-user", subscription.id);
  const old = "2000-01-01T00:00:00.000Z";
  await db.batch([
    db.prepare("UPDATE job_source_subscriptions SET updated_at = ? WHERE id = ?").bind(old, subscription.id),
    db.prepare("UPDATE job_notification_destinations SET updated_at = ? WHERE user_id = ?").bind(old, "retention-user"),
    db.prepare("UPDATE job_sources SET updated_at = ? WHERE id = ?").bind(old, source.id),
  ]);

  const firstRun = await runJobTrackingRetention(db);
  const secondRun = await runJobTrackingRetention(db);
  assert.equal(firstRun.ran, true);
  assert.equal(secondRun.ran, false);
  assert.equal((await first(db, "SELECT COUNT(*) AS count FROM job_source_subscriptions")).count, 0);
  assert.equal((await first(db, "SELECT COUNT(*) AS count FROM job_notification_destinations")).count, 0);
  assert.equal((await first(db, "SELECT COUNT(*) AS count FROM job_sources")).count, 0);
});

integrationTest("D1 enforces the 20-company quota across concurrent subscriptions", async (t) => {
  const db = await database(t);
  for (let index = 0; index < 19; index += 1) {
    await upsertJobSourceAndSubscription(db, {
      userId: "quota-user",
      provider: "greenhouse",
      account: `quota-${index}`,
      employer: `Quota ${index}`,
      locale: "en",
    });
  }

  const results = await Promise.allSettled([
    upsertJobSourceAndSubscription(db, {
      userId: "quota-user",
      provider: "greenhouse",
      account: "quota-19-a",
      employer: "Quota 19 A",
      locale: "en",
    }),
    upsertJobSourceAndSubscription(db, {
      userId: "quota-user",
      provider: "greenhouse",
      account: "quota-19-b",
      employer: "Quota 19 B",
      locale: "en",
    }),
  ]);

  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
  const rejected = results.find((result) => result.status === "rejected");
  assert.match(String(rejected?.reason), /source_limit_reached/);
  assert.equal(
    (await first(db, "SELECT COUNT(*) AS count FROM job_source_subscriptions WHERE user_id = ? AND active = 1", "quota-user")).count,
    20,
  );
});
