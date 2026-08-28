import { ensureJobTrackingStorage, executeJobTrackingBatch } from "../db/job-tracking.ts";
import { localeFromPath, localeToPath } from "./i18n.ts";

const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";

export type JobAlertEnvironment = {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
};

type PendingAlert = {
  id: string;
  user_id: string;
  attempt_count: number;
  email: string;
  locale: string;
  payload_json: string;
  employer: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character] || character);
}

function parseAlertJob(value: string) {
  try {
    const job = JSON.parse(value) as Record<string, unknown>;
    return {
      title: String(job.title || "New role").slice(0, 500),
      company: String(job.company || "").slice(0, 500),
      city: String(job.city || "").slice(0, 500),
      applyUrl: String(job.applyUrl || job.sourceUrl || "").slice(0, 2_048),
    };
  } catch {
    return { title: "New role", company: "", city: "", applyUrl: "" };
  }
}

async function sendDigest(
  alerts: PendingAlert[],
  environment: JobAlertEnvironment,
) {
  const apiKey = environment.RESEND_API_KEY?.trim();
  const from = environment.EMAIL_FROM?.trim();
  if (!apiKey || !from) return { ok: false, unavailable: true } as const;
  const jobs = alerts.map((alert) => ({ ...parseAlertJob(alert.payload_json), employer: alert.employer }));
  const list = jobs.map((job) => {
    const location = job.city ? `<div style="color:#697586">${escapeHtml(job.city)}</div>` : "";
    const title = job.applyUrl.startsWith("https://")
      ? `<a href="${escapeHtml(job.applyUrl)}" style="color:#183b56">${escapeHtml(job.title)}</a>`
      : escapeHtml(job.title);
    return `<li style="margin:0 0 16px"><strong>${title}</strong><div>${escapeHtml(job.company || job.employer)}</div>${location}</li>`;
  }).join("");
  const text = jobs.map((job) => `${job.title} — ${job.company || job.employer}${job.applyUrl ? `\n${job.applyUrl}` : ""}`).join("\n\n");
  const first = alerts[0];
  const last = alerts[alerts.length - 1];
  const locale = localeFromPath(first.locale) || "en";
  const manageUrl = `https://interviewthreadai.com/${localeToPath(locale)}#workspace`;
  try {
    const response = await fetch(RESEND_EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "idempotency-key": `job-digest-${first.user_id}-${first.id}-${last.id}`.slice(0, 256),
      },
      body: JSON.stringify({
        from,
        to: [first.email],
        subject: jobs.length === 1
          ? `[InterviewThread] New role at ${jobs[0].company || jobs[0].employer}`
          : `[InterviewThread] ${jobs.length} new roles from companies you track`,
        text: `InterviewThread found new published roles from companies you chose to track.\n\n${text}\n\nManage alerts at ${manageUrl}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.55;color:#1f2933;max-width:680px"><h1 style="font-size:22px">New roles from companies you track</h1><p>InterviewThread found newly published roles. It never applies on your behalf.</p><ul style="padding-left:22px">${list}</ul><p><a href="${manageUrl}">Review roles and notification settings</a></p></div>`,
        tags: [
          { name: "source", value: "job_tracking" },
          { name: "kind", value: "new_job_digest" },
        ],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return { ok: response.ok, unavailable: false } as const;
  } catch {
    return { ok: false, unavailable: false } as const;
  }
}

export async function deliverPendingJobAlertDigests(
  db: D1Database,
  environment: JobAlertEnvironment,
) {
  await ensureJobTrackingStorage(db);
  const now = new Date().toISOString();
  const result = await db.prepare(
    `SELECT alerts.id, alerts.user_id, alerts.attempt_count,
       destinations.email, destinations.locale,
       changes.payload_json, sources.employer
     FROM job_alerts alerts
     JOIN job_notification_destinations destinations ON destinations.user_id = alerts.user_id
     JOIN job_change_events changes ON changes.id = alerts.change_id
     JOIN job_sources sources ON sources.id = changes.source_id
     JOIN job_source_subscriptions subscriptions ON subscriptions.id = alerts.subscription_id
     WHERE alerts.channel = 'email'
       AND (
         (alerts.state = 'pending' AND alerts.next_attempt_at <= ?)
         OR (alerts.state LIKE 'sending:%' AND alerts.next_attempt_at <= ?)
       )
       AND destinations.email_enabled = 1
       AND subscriptions.active = 1 AND subscriptions.alerts_enabled = 1
       AND changes.occurred_at > subscriptions.updated_at
       AND changes.occurred_at > destinations.verified_at
     ORDER BY alerts.created_at ASC
     LIMIT 200`,
  ).bind(now, now).all<PendingAlert>();
  const byUser = new Map<string, PendingAlert[]>();
  for (const alert of result.results) {
    const group = byUser.get(alert.user_id) || [];
    if (group.length < 20) group.push(alert);
    byUser.set(alert.user_id, group);
  }

  let sent = 0;
  for (const alerts of byUser.values()) {
    // Claim each row before the external side effect. A five-minute expiry
    // makes a crashed worker replayable, while the unique claim prevents two
    // overlapping scheduled invocations from sending the same digest.
    const claim = `sending:${crypto.randomUUID()}`;
    const claimExpiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
    const claimedResults = await db.batch(alerts.map((alert) => db.prepare(
      `UPDATE job_alerts SET state = ?, next_attempt_at = ?
       WHERE id = ? AND channel = 'email' AND (
         (state = 'pending' AND next_attempt_at <= ?)
         OR (state LIKE 'sending:%' AND next_attempt_at <= ?)
       )`,
    ).bind(claim, claimExpiresAt, alert.id, now, now)));
    const claimed = alerts.filter((_, index) => Number(claimedResults[index]?.meta.changes || 0) === 1);
    if (!claimed.length) continue;

    // Re-check consent after claiming and immediately before provider contact.
    // Opt-out APIs also cancel claimed rows, which makes this query return none.
    const placeholders = claimed.map(() => "?").join(",");
    const confirmedResult = await db.prepare(
      `SELECT alerts.id, alerts.user_id, alerts.attempt_count,
         destinations.email, destinations.locale,
         changes.payload_json, sources.employer
       FROM job_alerts alerts
       JOIN job_notification_destinations destinations ON destinations.user_id = alerts.user_id
       JOIN job_change_events changes ON changes.id = alerts.change_id
       JOIN job_sources sources ON sources.id = changes.source_id
       JOIN job_source_subscriptions subscriptions ON subscriptions.id = alerts.subscription_id
       WHERE alerts.state = ? AND alerts.id IN (${placeholders})
         AND destinations.email_enabled = 1
         AND subscriptions.active = 1 AND subscriptions.alerts_enabled = 1
         AND changes.occurred_at > subscriptions.updated_at
         AND changes.occurred_at > destinations.verified_at
       ORDER BY alerts.created_at ASC`,
    ).bind(claim, ...claimed.map((alert) => alert.id)).all<PendingAlert>();
    const confirmed = confirmedResult.results;
    const confirmedIds = new Set(confirmed.map((alert) => alert.id));
    const noLongerEligible = claimed.filter((alert) => !confirmedIds.has(alert.id));
    if (noLongerEligible.length) {
      await executeJobTrackingBatch(db, noLongerEligible.map((alert) => db.prepare(
        `UPDATE job_alerts SET state = 'cancelled' WHERE id = ? AND state = ?`,
      ).bind(alert.id, claim)));
    }
    if (!confirmed.length) continue;

    const outcome = await sendDigest(confirmed, environment);
    if (outcome.unavailable) {
      await executeJobTrackingBatch(db, confirmed.map((alert) => db.prepare(
        `UPDATE job_alerts SET state = 'pending', next_attempt_at = ? WHERE id = ? AND state = ?`,
      ).bind(now, alert.id, claim)));
      break;
    }
    const statements = confirmed.map((alert) => {
      if (outcome.ok) {
        return db.prepare(
          `UPDATE job_alerts SET state = 'sent', delivered_at = ?, attempt_count = attempt_count + 1 WHERE id = ? AND state = ?`,
        ).bind(new Date().toISOString(), alert.id, claim);
      }
      const attempts = alert.attempt_count + 1;
      return db.prepare(
        `UPDATE job_alerts SET state = ?, attempt_count = ?, next_attempt_at = ? WHERE id = ? AND state = ?`,
      ).bind(
        attempts >= 5 ? "failed" : "pending",
        attempts,
        new Date(Date.now() + Math.min(60, 2 ** attempts * 5) * 60_000).toISOString(),
        alert.id,
        claim,
      );
    });
    await executeJobTrackingBatch(db, statements);
    if (outcome.ok) sent += confirmed.length;
  }
  return { pending: result.results.length, sent };
}
