import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { accountCopyFor, openSourceLabelFor } from "../../account-copy";
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
  return {
    title: labels.account,
    description: copyFor(locale).heroBody,
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
  const openSourceLabel = openSourceLabelFor(locale);
  const accountPath = localizedPath(locale, "account");
  const workspacePath = `${localizedPath(locale)}#workspace`;
  const plans = [
    {
      id: "community" as const,
      name: openSourceLabel,
      price: labels.noCharge,
      note: detail.openCore,
      features: [
        detail.matrix,
        core.recommendations,
        detail.assistantTitle,
        `${core.manual} · ${core.hybrid} · ${core.automatic}`,
        core.tracker,
        core.market,
        core.feedback,
      ],
    },
  ];

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
            { label: openSourceLabel, href: "#account-plans" },
            { label: core.enter, href: workspacePath },
            ...(user
              ? [{ label: labels.signOut, href: chatGPTSignOutPath(accountPath) }]
              : []),
          ]}
        />
      </header>

      <ol className="account-steps" aria-label={labels.account}>
        <li className="active">
          <span>1</span>
          <b>{openSourceLabel}</b>
        </li>
        <li className={user ? "complete" : ""}>
          <span>2</span>
          <b>{labels.signIn}</b>
        </li>
        <li>
          <span>3</span>
          <b>{core.enter}</b>
        </li>
      </ol>

      <section className="account-hero">
        <div>
          <p className="eyebrow">CareerStoryMap · {labels.account}</p>
          <h1>{core.heroTitle}</h1>
          <p>{core.heroBody}</p>
        </div>
        {user ? (
          <aside className="identity-card" aria-label={labels.account}>
            <span>CareerStoryMap ID</span>
            <strong>{user.displayName}</strong>
            <small>{user.email}</small>
          </aside>
        ) : (
          <aside className="identity-card">
            <span>{labels.account}</span>
            <strong>{labels.signIn}</strong>
            <small>{labels.privacy}</small>
          </aside>
        )}
      </section>

      <section
        className="account-plans"
        id="account-plans"
        aria-label={openSourceLabel}
      >
        <div className="account-section-heading">
          <p className="eyebrow">{openSourceLabel}</p>
          <h2>{plans[0].name}</h2>
          <p>{labels.noCharge}</p>
        </div>
        <div className="account-plan-grid">
          {plans.map((item) => {
            const href = user ? workspacePath : chatGPTSignInPath(accountPath);
            const actionLabel = user ? core.enter : labels.signIn;
            return (
              <article className="selected" key={item.id}>
                <div className="account-plan-title">
                  <div>
                    <span>{item.note}</span>
                    <h3>{item.name}</h3>
                  </div>
                  <b>{openSourceLabel}</b>
                </div>
                <p className="account-price">{item.price}</p>
                <ul>
                  {item.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                <a className="button primary" href={href}>
                  {actionLabel}
                </a>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="account-footer">
        <p>{labels.privacy} {labels.noCharge}</p>
        <div>
          <a className="button primary" href={workspacePath}>{core.enter}</a>
          {user && (
            <a className="button secondary" href={chatGPTSignOutPath(accountPath)}>
              {labels.signOut}
            </a>
          )}
        </div>
      </footer>
    </main>
  );
}
