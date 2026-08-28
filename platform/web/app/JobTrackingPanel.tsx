"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { JobSearchCandidate } from "./job-search.ts";
import { jobTrackingCopyFor, jobTrackingRuntimeCopyFor } from "./job-tracking-copy.ts";
import type { LocaleCode } from "./i18n.ts";

type SourceRow = {
  subscription_id: string;
  provider: string;
  account: string;
  employer: string;
  next_sync_at: string;
  last_sync_at: string | null;
  last_success_at: string | null;
  last_error_code: string | null;
  consecutive_failures: number;
  alerts_enabled: number;
  active_count: number;
  new_count: number;
  updated_count: number;
  removed_count: number;
};

type TrackingJob = JobSearchCandidate & {
  tracking?: { sourceId: string; lastChangedAt: string; sourceCheckedAt: string | null };
};

type Snapshot = {
  subscriptions: SourceRow[];
  jobs: TrackingJob[];
  jobsIncluded: boolean;
  jobsVersion: string;
  activeJobCount: number;
  jobsTruncated: boolean;
  changesHasMore?: boolean;
  changes: Array<{
    id: number;
    kind: string;
    occurredAt: string;
    employer: string;
    job: JobSearchCandidate;
  }>;
  cursor: number;
  notification: { email: string; emailEnabled: boolean } | null;
};

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function relativeTime(locale: string, value: string | null) {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "—";
  const milliseconds = parsed - Date.now();
  const minutes = Math.round(milliseconds / 60_000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  return formatter.format(Math.round(hours / 24), "day");
}

function scheduledTime(locale: string, value: string | null, checking: string) {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "—";
  return parsed <= Date.now() ? checking : relativeTime(locale, value);
}

const PROVIDER_PLACEHOLDERS: Record<string, string> = {
  greenhouse: "https://boards.greenhouse.io/company",
  lever: "https://jobs.lever.co/company",
  "lever-eu": "https://jobs.eu.lever.co/company",
  ashby: "https://jobs.ashbyhq.com/company",
};

const subscribeToBrowserCapabilities = () => () => undefined;
const browserNotificationsAvailable = () => "Notification" in window;
const browserNotificationsUnavailableOnServer = () => false;

export function JobTrackingPanel({
  authenticated,
  locale,
  signInPath,
  onJobs,
  onSourceSummary,
}: {
  authenticated: boolean;
  locale: LocaleCode;
  signInPath?: string;
  onJobs: (jobs: JobSearchCandidate[], hasSources: boolean) => void;
  onSourceSummary: (summary: { sourceCount: number; lastSuccessAt: string | null }) => void;
}) {
  const copy = jobTrackingCopyFor(locale);
  const runtimeCopy = jobTrackingRuntimeCopyFor(locale);
  const [provider, setProvider] = useState("greenhouse");
  const [reference, setReference] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [browserAlerts, setBrowserAlerts] = useState(false);
  const [browserAlertsFailed, setBrowserAlertsFailed] = useState(false);
  const cursorRef = useRef(0);
  const initializedRef = useRef(false);
  const jobsVersionRef = useRef("");
  const requestSequenceRef = useRef(0);
  const appliedSequenceRef = useRef(0);
  const onJobsRef = useRef(onJobs);
  const onSourceSummaryRef = useRef(onSourceSummary);
  const loadControllerRef = useRef<AbortController | null>(null);
  const mutationInFlightRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);
  const syncChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    onJobsRef.current = onJobs;
    onSourceSummaryRef.current = onSourceSummary;
  }, [onJobs, onSourceSummary]);

  const browserAlertsSupported = useSyncExternalStore(
    subscribeToBrowserCapabilities,
    browserNotificationsAvailable,
    browserNotificationsUnavailableOnServer,
  ) && !browserAlertsFailed;

  const applySnapshot = useCallback((next: Snapshot, announce = false) => {
    const sources = (next.subscriptions || []).map((source) => ({
      ...source,
      active_count: numberValue(source.active_count),
      new_count: numberValue(source.new_count),
      updated_count: numberValue(source.updated_count),
      removed_count: numberValue(source.removed_count),
      alerts_enabled: numberValue(source.alerts_enabled),
      consecutive_failures: numberValue(source.consecutive_failures),
    }));
    const normalized = { ...next, subscriptions: sources };
    const newChanges = (next.changes || []).filter((change) => change.id > cursorRef.current);
    const alertableChanges = newChanges.filter((change) => change.kind === "new" || change.kind === "relisted");
    let notificationFailed = false;
    if (initializedRef.current && browserAlerts && alertableChanges.length && "Notification" in window && Notification.permission === "granted") {
      const first = alertableChanges[0]?.job;
      try {
        new Notification("InterviewThread", {
          body: alertableChanges.length === 1
            ? `${first?.title || copy.newJobs} · ${first?.company || ""}`
            : `${alertableChanges.length} ${copy.updatesAvailable}`,
        });
      } catch {
        // Notifications are best-effort. Unsupported constructors on some
        // mobile browsers must never prevent the job snapshot from applying.
        setBrowserAlerts(false);
        setBrowserAlertsFailed(true);
        notificationFailed = true;
      }
    }
    cursorRef.current = Math.max(cursorRef.current, Number(next.cursor || 0));
    jobsVersionRef.current = next.jobsVersion || jobsVersionRef.current;
    initializedRef.current = true;
    setSnapshot((previous) => {
      const changesById = new Map<number, Snapshot["changes"][number]>();
      for (const change of [...(previous?.changes || []), ...(next.changes || [])]) {
        changesById.set(change.id, change);
      }
      return {
        ...normalized,
        jobs: next.jobsIncluded ? next.jobs || [] : previous?.jobs || [],
        changes: [...changesById.values()].sort((a, b) => a.id - b.id).slice(-20),
      };
    });
    if (next.jobsIncluded) {
      onJobsRef.current(
        (next.jobs || []).map((job) => ({ ...job, isLive: true })),
        sources.length > 0,
      );
    }
    onSourceSummaryRef.current({
      sourceCount: sources.length,
      lastSuccessAt: sources.some((source) => !source.last_success_at)
        ? null
        : sources.map((source) => source.last_success_at).filter(Boolean).sort().at(0) || null,
    });
    if (notificationFailed) setMessage(runtimeCopy.browserUnsupported);
    else if (announce) setMessage(newChanges.length ? `${newChanges.length} ${copy.updatesAvailable}` : copy.refreshed);
  }, [browserAlerts, copy.newJobs, copy.refreshed, copy.updatesAvailable, runtimeCopy.browserUnsupported]);

  const load = useCallback(async (announce = false) => {
    if (!authenticated || mutationInFlightRef.current) return;
    const sequence = ++requestSequenceRef.current;
    loadControllerRef.current?.abort();
    const controller = new AbortController();
    loadControllerRef.current = controller;
    try {
      // Drain bounded event pages immediately so a large provider update never
      // advances the cursor past unseen changes. Jobs are only included when
      // their version changes; follow-up pages stay lightweight.
      for (let page = 0; page < 20; page += 1) {
        const params = new URLSearchParams({
          after: String(cursorRef.current),
          include_jobs: initializedRef.current ? "0" : "1",
          jobs_version: jobsVersionRef.current,
        });
        const response = await fetch(`/api/job-sources?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("load_failed");
        const payload = await response.json() as Snapshot;
        if (sequence < appliedSequenceRef.current) return;
        appliedSequenceRef.current = sequence;
        applySnapshot(payload, announce && page === 0);
        if (!payload.changesHasMore) break;
      }
    } catch (error) {
      if ((error as Error).name === "AbortError" || sequence < appliedSequenceRef.current) return;
      appliedSequenceRef.current = sequence;
      setMessage(copy.error);
    } finally {
      if (loadControllerRef.current === controller) loadControllerRef.current = null;
    }
  }, [applySnapshot, authenticated, copy.error]);

  useEffect(() => {
    if (!authenticated) return;
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("interviewthread-job-tracking");
      channel.onmessage = (event) => {
        if (event.data === "refresh") void load(false);
      };
      syncChannelRef.current = channel;
    }
    void load(false);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void load(false);
    }, 30_000);
    const resume = () => {
      if (document.visibilityState !== "visible") return;
      if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = window.setTimeout(() => void load(false), 150);
    };
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      loadControllerRef.current?.abort();
      syncChannelRef.current?.close();
      syncChannelRef.current = null;
      if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current);
      window.clearInterval(interval);
      window.removeEventListener("focus", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [authenticated, load]);

  async function addSource(event: FormEvent) {
    event.preventDefault();
    if (!reference.trim() || busy) return;
    mutationInFlightRef.current = true;
    loadControllerRef.current?.abort();
    setBusy(true);
    setMessage("");
    const sequence = ++requestSequenceRef.current;
    appliedSequenceRef.current = Math.max(appliedSequenceRef.current, sequence);
    try {
      const response = await fetch("/api/job-sources", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider, reference: reference.trim(), locale }),
      });
      const payload = await response.json() as Snapshot & { error?: string };
      if (!response.ok) throw new Error(payload.error || "add_failed");
      setReference("");
      if (sequence < appliedSequenceRef.current) return;
      appliedSequenceRef.current = sequence;
      applySnapshot(payload, true);
      syncChannelRef.current?.postMessage("refresh");
    } catch (error) {
      setMessage((error as Error).message === "source_limit_reached" ? copy.sourceLimit : copy.error);
    } finally {
      mutationInFlightRef.current = false;
      setBusy(false);
    }
  }

  async function mutateSource(source: SourceRow, action: "refresh" | "remove" | "alerts") {
    if (busy) return;
    if (action === "remove" && !window.confirm(`${copy.remove}?`)) return;
    mutationInFlightRef.current = true;
    loadControllerRef.current?.abort();
    appliedSequenceRef.current = Math.max(appliedSequenceRef.current, ++requestSequenceRef.current);
    setBusy(true);
    setMessage("");
    let shouldReload = false;
    try {
      const path = action === "refresh"
        ? `/api/job-sources/${encodeURIComponent(source.subscription_id)}/refresh`
        : `/api/job-sources/${encodeURIComponent(source.subscription_id)}`;
      const response = await fetch(path, {
        method: action === "remove" ? "DELETE" : action === "alerts" ? "PATCH" : "POST",
        ...(action === "alerts" ? {
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ alertsEnabled: !source.alerts_enabled, locale }),
        } : {}),
      });
      if (response.status === 429) {
        setMessage(runtimeCopy.refreshThrottled);
        return;
      }
      if (!response.ok) throw new Error("mutation_failed");
      shouldReload = true;
    } catch {
      setMessage(copy.error);
    } finally {
      mutationInFlightRef.current = false;
      setBusy(false);
    }
    if (shouldReload) await load(true);
    if (shouldReload) syncChannelRef.current?.postMessage("refresh");
  }

  async function toggleEmail() {
    if (busy) return;
    mutationInFlightRef.current = true;
    loadControllerRef.current?.abort();
    appliedSequenceRef.current = Math.max(appliedSequenceRef.current, ++requestSequenceRef.current);
    setBusy(true);
    let shouldReload = false;
    try {
      const response = await fetch("/api/job-alert-preferences", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ emailEnabled: !snapshot?.notification?.emailEnabled, locale }),
      });
      if (!response.ok) throw new Error("email_failed");
      shouldReload = true;
    } catch {
      setMessage(copy.error);
    } finally {
      mutationInFlightRef.current = false;
      setBusy(false);
    }
    if (shouldReload) await load(true);
    if (shouldReload) syncChannelRef.current?.postMessage("refresh");
  }

  async function toggleBrowser() {
    if (!("Notification" in window)) {
      setBrowserAlertsFailed(true);
      setMessage(runtimeCopy.browserUnsupported);
      return;
    }
    if (!browserAlerts && Notification.permission !== "granted") {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setMessage(runtimeCopy.browserDenied);
          return;
        }
      } catch {
        setBrowserAlertsFailed(true);
        setMessage(runtimeCopy.browserUnsupported);
        return;
      }
    }
    setBrowserAlerts((enabled) => !enabled);
  }

  const totalActive = useMemo(
    () => (snapshot?.subscriptions || []).reduce((sum, source) => sum + source.active_count, 0),
    [snapshot],
  );
  const feedFreshness = useMemo(
    () => (snapshot?.subscriptions || []).some((source) => !source.last_success_at)
      ? null
      : (snapshot?.subscriptions || []).map((source) => source.last_success_at).filter(Boolean).sort().at(0) || null,
    [snapshot],
  );
  const nextScheduledAt = useMemo(
    () => (snapshot?.subscriptions || []).map((source) => source.next_sync_at).filter(Boolean).sort().at(0) || null,
    [snapshot],
  );

  if (!authenticated) {
    return (
      <section className="job-tracking-panel job-tracking-sign-in">
        <div><p className="eyebrow">{copy.eyebrow}</p><h3>{copy.signIn}</h3><p>{copy.signInBody}</p></div>
        <a className="button primary" href={signInPath || `/${locale}/account`}>{copy.signIn}</a>
      </section>
    );
  }

  return (
    <section className="job-tracking-panel" aria-labelledby="job-tracking-title">
      <div className="job-tracking-heading">
        <div><p className="eyebrow">{copy.eyebrow}</p><h3 id="job-tracking-title">{copy.title}</h3><p>{copy.intro}</p></div>
        <div className="job-tracking-summary">
          <strong>{snapshot?.subscriptions.length || 0} {copy.sources}</strong>
          <span>{totalActive} {copy.activeJobs}</span>
          {snapshot?.subscriptions.length ? (
            <small>{copy.checked} {relativeTime(locale, feedFreshness)} · {runtimeCopy.nextCheckAt} {scheduledTime(locale, nextScheduledAt, copy.checking)}</small>
          ) : null}
        </div>
      </div>
      <div className="job-tracking-trust"><span>✓ {copy.everyFiveMinutes}</span><span>✓ {copy.noAutoApply}</span></div>
      <form className="source-connector-form" onSubmit={addSource}>
        <label><span>{copy.provider}</span><select value={provider} onChange={(event) => setProvider(event.target.value)}><option value="greenhouse">Greenhouse</option><option value="lever">Lever</option><option value="lever-eu">Lever EU</option><option value="ashby">Ashby</option></select></label>
        <label className="source-reference"><span>{copy.reference}</span><input dir="ltr" value={reference} onChange={(event) => setReference(event.target.value)} placeholder={PROVIDER_PLACEHOLDERS[provider] || copy.referencePlaceholder} inputMode="url" required /></label>
        <button className="button primary" disabled={busy}>{busy ? copy.adding : copy.add}</button>
      </form>
      {message && <p className="source-message" role="status">{message}</p>}
      {snapshot?.subscriptions.length ? (
        <div className="job-tracked-sources">
          {snapshot.subscriptions.map((source) => {
            const status = source.last_error_code ? copy.delayed : source.last_success_at ? copy.healthy : copy.checking;
            const statusClass = source.last_error_code ? "delayed" : source.last_success_at ? "healthy" : "checking";
            return (
              <article key={source.subscription_id}>
                <div className="job-source-status"><div><b><bdi dir="auto">{source.employer}</bdi></b><span><bdi dir="auto">{source.provider}</bdi> · <bdi dir="ltr">{source.account}</bdi></span></div><span className={statusClass}>{status}</span></div>
                <div className="job-source-counts"><span><b>{source.active_count}</b> {copy.activeJobs}</span><span><b>{source.new_count}</b> {copy.newJobs}</span><span><b>{source.updated_count}</b> {copy.updated}</span><span><b>{source.removed_count}</b> {copy.removed}</span></div>
                <p>{source.last_success_at ? <time dateTime={source.last_success_at}>{copy.checked} {relativeTime(locale, source.last_success_at)}</time> : <span>{copy.checking}</span>} · {runtimeCopy.nextCheckAt} <time dateTime={source.next_sync_at}>{scheduledTime(locale, source.next_sync_at, copy.checking)}</time></p>
                <div className="job-source-actions"><label><input type="checkbox" disabled={busy} checked={Boolean(source.alerts_enabled)} onChange={() => void mutateSource(source, "alerts")} /> {copy.alerts}</label><button type="button" disabled={busy} className="text-link" onClick={() => void mutateSource(source, "refresh")}>{copy.checkNow}</button><button type="button" disabled={busy} className="text-link danger" onClick={() => void mutateSource(source, "remove")}>{copy.remove}</button></div>
              </article>
            );
          })}
        </div>
      ) : <p className="job-tracking-empty">{copy.empty}</p>}
      {snapshot?.subscriptions.length && totalActive === 0 ? (
        <p className="job-tracking-empty" role="note">{runtimeCopy.noActiveJobs}</p>
      ) : null}
      {snapshot?.jobsTruncated && (
        <p className="job-tracking-limit" role="note">
          {copy.jobsLimited.replace("{count}", String(snapshot.activeJobCount))}
        </p>
      )}
      <section className="job-tracking-activity" aria-labelledby="job-tracking-activity-title">
        <h4 id="job-tracking-activity-title">{copy.recentActivity}</h4>
        {snapshot?.changes.length ? (
          <ul>
            {[...snapshot.changes].reverse().slice(0, 5).map((change) => (
              <li key={change.id}>
                <span>{change.kind === "removed" ? copy.removed : change.kind === "updated" ? copy.updated : copy.newJobs}</span>
                <div><b><bdi dir="auto">{change.job.title || change.employer}</bdi></b><small><bdi dir="auto">{change.job.company || change.employer}</bdi> · {relativeTime(locale, change.occurredAt)}</small></div>
              </li>
            ))}
          </ul>
        ) : <p>{copy.noRecentActivity}</p>}
      </section>
      <div className="job-notification-settings">
        <label><input type="checkbox" disabled={busy} checked={Boolean(snapshot?.notification?.emailEnabled)} onChange={() => void toggleEmail()} /> <span>{copy.emailAlerts}{snapshot?.notification?.email ? <> · <bdi dir="ltr">{snapshot.notification.email}</bdi></> : ""}</span></label>
        <label><input type="checkbox" disabled={busy || !browserAlertsSupported} checked={browserAlerts} onChange={() => void toggleBrowser()} /> <span>{copy.browserAlerts}{!browserAlertsSupported ? ` · ${runtimeCopy.browserUnsupported}` : ""}</span></label>
        <small>{copy.emailNotice}</small>
      </div>
    </section>
  );
}
