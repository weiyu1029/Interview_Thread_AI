import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  accountCopyFor,
  accountIntroCopyFor,
  openSourceLabelFor,
} from "../../account-copy";
import { BrandMark } from "../../BrandMark";
import { AccountActivity } from "../../AccountActivity";
import { MobileNav } from "../../MobileNav";
import { SiteFooter } from "../../SiteFooter";
import { getAppUser } from "../../auth";
import { safeReturnPath, signOutPath, oauthStartPath } from "../../auth-paths";
import { authCopyFor } from "../../auth-copy";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import {
  brandTaglineFor,
  copyFor,
  detailFor,
  localeDisplayName,
  localeFromPath,
  RTL_LOCALES,
} from "../../i18n";
import { localizedPath } from "../../intl-routing";

export const dynamic = "force-dynamic";

type AccountPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    auth_error?: string;
    provider?: string;
    return_to?: string;
  }>;
};

export async function generateMetadata({
  params,
}: AccountPageProps): Promise<Metadata> {
  const { locale: pathLocale } = await params;
  const locale = localeFromPath(pathLocale);
  if (!locale) return {};
  const labels = accountCopyFor(locale);
  const intro = accountIntroCopyFor(locale);
  return {
    title: `${labels.account} · InterviewThread`,
    description: intro.description,
    robots: { index: false, follow: false },
  };
}

export default async function AccountPage({
  params,
  searchParams,
}: AccountPageProps) {
  const [{ locale: pathLocale }, query, user] = await Promise.all([
    params,
    searchParams,
    getAppUser(),
  ]);
  const locale = localeFromPath(pathLocale);
  if (!locale) notFound();

  const core = copyFor(locale);
  const detail = detailFor(locale);
  const labels = accountCopyFor(locale);
  const intro = accountIntroCopyFor(locale);
  const authCopy = authCopyFor(locale);
  const openSourceLabel = openSourceLabelFor(locale);
  const accountPath = localizedPath(locale, "account");
  const workspacePath = `${localizedPath(locale)}#workspace`;
  const returnTo = safeReturnPath(query.return_to || workspacePath);
  const savedWork = [detail.matrix, core.interview, core.tracker];
  const signOutHref =
    user?.provider === "sites"
      ? chatGPTSignOutPath(accountPath)
      : signOutPath(accountPath);
  const providerLabel = user ? providerName(user.provider) : null;
  const authError = query.auth_error
    ? query.auth_error === "provider_not_configured"
      ? `${providerName(query.provider)}: ${authCopy.setupNeeded}`
      : authCopy.signInFailed
    : null;

  return (
    <main
      className="account-shell"
      lang={locale}
      dir={RTL_LOCALES.has(locale) ? "rtl" : "ltr"}
    >
      <header className="account-header">
        <a className="brand" href={localizedPath(locale)} aria-label="InterviewThread">
          <BrandMark />
          <span>InterviewThread <small>{brandTaglineFor(locale)}</small></span>
        </a>
        <span className="account-language">{localeDisplayName(locale)}</span>
        <MobileNav
          label={labels.account}
          items={[
            { label: "InterviewThread", href: localizedPath(locale) },
            { label: labels.account, href: "#account-card" },
            { label: core.enter, href: workspacePath },
            ...(user
              ? [{ label: labels.signOut, href: signOutHref }]
              : []),
          ]}
        />
      </header>

      <section className="account-simple">
        <div className="account-intro">
          <p className="eyebrow">InterviewThread · {labels.account}</p>
          <h1>{intro.title}</h1>
          <p className="account-intro-copy">{intro.description}</p>
          <div className="account-saved-work" aria-label={intro.title}>
            {savedWork.map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
          {user && (
            <AccountActivity
              locale={locale}
              title={intro.title}
              labels={{
                analysis_completed: detail.matrix,
                interview_started: core.interview,
                interview_answered: core.interview,
                tracker_updated: core.tracker,
                feedback_submitted: core.feedback,
                beta_application_submitted: betaLabel(locale),
                beta_application_withdrawn: betaLabel(locale),
              }}
            />
          )}
        </div>
        <aside className="account-action-card" id="account-card" aria-label={labels.account}>
          <div className="account-card-topline">
            <span>{labels.account}</span>
            <b>{openSourceLabel}</b>
          </div>

          {user ? (
            <div className="account-user">
              <small>{providerLabel} · InterviewThread</small>
              <strong>{user.displayName}</strong>
              {user.email && <span>{user.email}</span>}
              {user.providerUsername && <span>@{user.providerUsername}</span>}
              {user.providerProfileUrl && (
                <a
                  className="account-profile-link"
                  href={user.providerProfileUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {providerLabel} · {user.providerUsername ? `@${user.providerUsername}` : user.providerProfileUrl}
                </a>
              )}
            </div>
          ) : (
            <div className="account-choice">
              <strong>{labels.signIn}</strong>
              <p>{authCopy.identityNotice}</p>
            </div>
          )}

          {authError && (
            <p className="account-auth-error" role="alert">
              {authError}
            </p>
          )}

          {user ? (
            <div className="account-actions">
              <a className="button primary" href={workspacePath}>
                {core.enter}
              </a>
              <a
                className="button secondary"
                href={signOutHref}
              >
                {labels.signOut}
              </a>
              <a className="button secondary" href={localizedPath(locale, "beta")}>
                {betaLabel(locale)}
              </a>
            </div>
          ) : (
            <div className="oauth-provider-list" aria-label={labels.signIn}>
              {(["google", "github", "linkedin"] as const).map((provider) => (
                <a
                  className="oauth-provider-button"
                  data-provider={provider}
                  href={oauthStartPath(provider, returnTo, locale)}
                  key={provider}
                >
                  <span className="oauth-provider-mark" aria-hidden="true">
                    {providerMark(provider)}
                  </span>
                  <strong>{labels.signIn} · {providerName(provider)}</strong>
                </a>
              ))}
            </div>
          )}

          <div className="account-assurances">
            <p>{labels.noCharge}</p>
            <p>{labels.privacy}</p>
            <p>{authCopy.evidenceNotice}</p>
          </div>
        </aside>
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}

function providerName(value: string | undefined) {
  if (value === "google") return "Google";
  if (value === "github") return "GitHub";
  if (value === "linkedin") return "LinkedIn";
  if (value === "sites") return "InterviewThread workspace";
  return "Account";
}

function providerMark(provider: "google" | "github" | "linkedin") {
  if (provider === "google") return "G";
  if (provider === "github") return "GH";
  return "in";
}

function betaLabel(locale: string) {
  if (locale === "zh-TW") return "封閉測試";
  if (locale === "zh-CN") return "封闭测试";
  return "Closed beta";
}
