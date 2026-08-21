import { accountCopyFor, openSourceLabelFor } from "./account-copy";
import { brandTaglineFor, type LocaleCode } from "./i18n";
import { localizedPath } from "./intl-routing";
import { informationLabelsFor } from "./site-information";
import { betaLabelFor } from "./beta-copy";

const REPOSITORY_URL =
  "https://github.com/weiyu1029/Interview_Thread_AI";

export function SiteFooter({ locale }: { locale: LocaleCode }) {
  const labels = informationLabelsFor(locale);
  const account = accountCopyFor(locale);
  const openSource = openSourceLabelFor(locale);

  return (
    <footer className="site-footer">
      <div className="site-footer-brand">
        <strong>InterviewThread</strong>
        <p>{brandTaglineFor(locale)}</p>
        <small>{account.noCharge}</small>
      </div>
      <nav aria-label={labels.heading}>
        <strong>{labels.heading}</strong>
        <a href={localizedPath(locale, "about")}>{labels.about}</a>
        <a href={localizedPath(locale, "contact")}>{labels.contact}</a>
        <a href={localizedPath(locale, "terms")}>{labels.terms}</a>
        <a href={localizedPath(locale, "privacy")}>{labels.privacy}</a>
        <a href={localizedPath(locale, "beta")}>{betaLabelFor(locale)}</a>
      </nav>
      <div className="site-footer-community">
        <strong>{openSource}</strong>
        <a href={REPOSITORY_URL}>{labels.repository}</a>
        <a href={localizedPath(locale, "beta")}>{betaLabelFor(locale)}</a>
        <p>MIT</p>
      </div>
      <p className="site-footer-legal">
        © {new Date().getFullYear()} InterviewThread · MIT
      </p>
    </footer>
  );
}
