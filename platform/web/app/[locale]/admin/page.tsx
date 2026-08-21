import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminProductMetrics } from "../../../db";
import { isAdminEmail } from "../../admin-access";
import { getAppUser } from "../../auth";
import { BrandMark } from "../../BrandMark";
import { localeFromPath } from "../../i18n";
import { localizedPath } from "../../intl-routing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Operations · InterviewThread",
  description: "Private aggregate operations dashboard for InterviewThread.",
  robots: { index: false, follow: false },
};

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

const EVENT_LABELS: Record<string, string> = {
  analysis_completed: "Interview plans completed",
  interview_started: "Mock interviews started",
  interview_answered: "Interview answers completed",
  tracker_updated: "Application tracker updates",
  feedback_submitted: "Feedback submissions",
  beta_application_submitted: "Beta applications",
  beta_application_withdrawn: "Beta withdrawals",
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale: pathLocale } = await params;
  const locale = localeFromPath(pathLocale);
  if (!locale) notFound();

  const user = await getAppUser();
  if (!user || !isAdminEmail(user.email)) notFound();

  const metrics = await getAdminProductMetrics();
  const generatedAt = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(metrics.generatedAt));

  return (
    <main className="admin-shell" lang={locale}>
      <header className="admin-header">
        <a className="brand" href={localizedPath(locale)} aria-label="InterviewThread">
          <BrandMark />
          <span>InterviewThread <small>Operations</small></span>
        </a>
        <a className="button secondary" href={localizedPath(locale)}>
          Return to product
        </a>
      </header>

      <section className="admin-intro">
        <p className="eyebrow">Private · Aggregate only</p>
        <h1>Product and operations pulse</h1>
        <p>
          This dashboard counts signed-in product events and service records. It
          never displays resumes, job descriptions, interview answers,
          transcripts, audio, names, email addresses, IP addresses, or browser
          identifiers.
        </p>
        <small>Generated {generatedAt} UTC</small>
      </section>

      <section className="admin-metric-grid" aria-label="Product metrics">
        <Metric label="Accounts" value={metrics.accounts.total} note={`${metrics.accounts.createdLast7Days} new in 7 days`} />
        <Metric label="Active accounts" value={metrics.activity.activeAccountsLast7Days} note={`${metrics.activity.activeAccountsLast30Days} in 30 days`} />
        <Metric label="Product events" value={metrics.activity.last7Days} note={`${metrics.activity.last24Hours} in 24 hours`} />
        <Metric label="Beta participants" value={metrics.beta.total} note="All lifecycle states" />
        <Metric label="Feedback" value={metrics.feedback.total} note={`${metrics.feedback.new} awaiting review`} />
      </section>

      <section className="admin-detail-grid">
        <article className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="eyebrow">Last 30 days</p>
              <h2>Signed-in product events</h2>
            </div>
            <b>{metrics.activity.last30Days}</b>
          </div>
          <div className="admin-row-list">
            {metrics.activity.byTypeLast30Days.length ? (
              metrics.activity.byTypeLast30Days.map((row) => (
                <div key={row.eventType}>
                  <span>{EVENT_LABELS[row.eventType] || row.eventType}</span>
                  <strong>{row.count}</strong>
                </div>
              ))
            ) : (
              <p>No signed-in events recorded in this period.</p>
            )}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="eyebrow">Founding beta</p>
              <h2>Cohort status</h2>
            </div>
            <b>{metrics.beta.total}</b>
          </div>
          <div className="admin-row-list">
            {metrics.beta.byStatus.length ? (
              metrics.beta.byStatus.map((row) => (
                <div key={row.status}>
                  <span>{row.status}</span>
                  <strong>{row.count}</strong>
                </div>
              ))
            ) : (
              <p>No beta participants recorded yet.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-privacy-note">
        <strong>Privacy boundary</strong>
        <p>
          Cloudflare provides operational traffic and error telemetry. This
          application dashboard uses only aggregate D1 counts from existing
          signed-in records. Career content is deliberately excluded.
        </p>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
      <small>{note}</small>
    </article>
  );
}

