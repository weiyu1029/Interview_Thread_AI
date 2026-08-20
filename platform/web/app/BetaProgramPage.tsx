import { BetaApplication } from "./BetaApplication";
import { BrandMark } from "./BrandMark";
import { MobileNav } from "./MobileNav";
import { SiteFooter } from "./SiteFooter";
import { getAppUser } from "./auth";
import { accountCopyFor } from "./account-copy";
import { betaCopyFor } from "./beta-copy";
import { brandTaglineFor, localeDisplayName, type LocaleCode, RTL_LOCALES } from "./i18n";
import { localizedPath } from "./intl-routing";

export async function BetaProgramPage({ locale }: { locale: LocaleCode }) {
  const [copy, user] = await Promise.all([Promise.resolve(betaCopyFor(locale)), getAppUser()]);
  const account = accountCopyFor(locale);
  const accountHref = `${localizedPath(locale, "account")}?return_to=${encodeURIComponent(localizedPath(locale, "beta"))}`;

  return (
    <main className="beta-shell" lang={locale} dir={RTL_LOCALES.has(locale) ? "rtl" : "ltr"}>
      <header className="account-header">
        <a className="brand" href={localizedPath(locale)} aria-label="InterviewThread"><BrandMark /><span>InterviewThread <small>{brandTaglineFor(locale)}</small></span></a>
        <span className="account-language">{localeDisplayName(locale)}</span>
        <MobileNav label={copy.label} items={[{ label: "InterviewThread", href: localizedPath(locale) }, { label: copy.label, href: "#beta-application" }, { label: account.account, href: localizedPath(locale, "account") }]} />
      </header>

      <section className="beta-hero">
        <p className="eyebrow">InterviewThread · {copy.label}</p>
        <h1>{copy.title}</h1>
        <p className="beta-lede">{copy.description}</p>
        <p className="beta-notice">{copy.notice}</p>
        {locale !== "en" && locale !== "zh-TW" && <p className="translation-draft-notice">{copy.fallbackNotice}</p>}
      </section>

      <section className="beta-stage-grid" aria-label={copy.title}>
        {copy.stages.map(([title, description], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h2>{title}</h2><p>{description}</p></article>)}
      </section>

      <section id="beta-application" className="beta-application-section">
        <BetaApplication authenticated={Boolean(user)} locale={locale} accountHref={accountHref} termsHref={localizedPath(locale, "terms")} privacyHref={localizedPath(locale, "privacy")} copy={copy} />
      </section>

      <section className="beta-release-loop">
        <div><p className="eyebrow">InterviewThread · {copy.releaseTitle}</p><h2>{copy.releaseTitle}</h2></div>
        <div className="beta-release-grid">{copy.releaseSteps.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
        <div className="beta-gates"><h3>{copy.gatesTitle}</h3><ul>{copy.gates.map((gate) => <li key={gate}>{gate}</li>)}</ul></div>
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}
