import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  accountCopyFor,
  accountIntroCopyFor,
  openSourceLabelFor,
} from "../../account-copy";
import { BrandMark } from "../../BrandMark";
import { MobileNav } from "../../MobileNav";
import {
  chatGPTSignInPath,
  chatGPTSignOutPath,
  getChatGPTUser,
} from "../../chatgpt-auth";
import {
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
    title: `${labels.account} · CareerStoryMap`,
    description: intro.description,
    robots: { index: false, follow: false },
  };
}

export default async function AccountPage({
  params,
}: AccountPageProps) {
  const [{ locale: pathLocale }, user] = await Promise.all([
    params,
    getChatGPTUser(),
  ]);
  const locale = localeFromPath(pathLocale);
  if (!locale) notFound();

  const core = copyFor(locale);
  const detail = detailFor(locale);
  const labels = accountCopyFor(locale);
  const intro = accountIntroCopyFor(locale);
  const openSourceLabel = openSourceLabelFor(locale);
  const accountPath = localizedPath(locale, "account");
  const workspacePath = `${localizedPath(locale)}#workspace`;
  const savedWork = [detail.matrix, core.interview, core.tracker];

  return (
    <main
      className="account-shell"
      lang={locale}
      dir={RTL_LOCALES.has(locale) ? "rtl" : "ltr"}
    >
      <header className="account-header">
        <a className="brand" href={localizedPath(locale)} aria-label="CareerStoryMap">
          <BrandMark />
          <span>CareerStoryMap <small>Evidence to opportunity</small></span>
        </a>
        <span className="account-language">{localeDisplayName(locale)}</span>
        <MobileNav
          label={labels.account}
          items={[
            { label: "CareerStoryMap", href: localizedPath(locale) },
            { label: labels.account, href: "#account-card" },
            { label: core.enter, href: workspacePath },
            ...(user
              ? [{ label: labels.signOut, href: chatGPTSignOutPath(accountPath) }]
              : []),
          ]}
        />
      </header>

      <section className="account-simple">
        <div className="account-intro">
          <p className="eyebrow">CareerStoryMap · {labels.account}</p>
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
        </div>
        <aside className="account-action-card" id="account-card" aria-label={labels.account}>
          <div className="account-card-topline">
            <span>{labels.account}</span>
            <b>{openSourceLabel}</b>
          </div>

          {user ? (
            <div className="account-user">
              <small>CareerStoryMap ID</small>
              <strong>{user.displayName}</strong>
              <span>{user.email}</span>
            </div>
          ) : (
            <div className="account-choice">
              <strong>{labels.signIn}</strong>
              <p>{labels.noCharge}</p>
            </div>
          )}

          <div className="account-actions">
            <a
              className="button primary"
              href={user ? workspacePath : chatGPTSignInPath(accountPath)}
            >
              {user ? core.enter : labels.signIn}
            </a>
            <a
              className="button secondary"
              href={user ? chatGPTSignOutPath(accountPath) : workspacePath}
            >
              {user ? labels.signOut : intro.skipSignIn}
            </a>
          </div>

          <div className="account-assurances">
            <p>{labels.noCharge}</p>
            <p>{labels.privacy}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
