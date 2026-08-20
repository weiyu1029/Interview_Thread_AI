import { accountCopyFor } from "./account-copy";
import { BrandMark } from "./BrandMark";
import { ContactInboxForms } from "./ContactInboxForms";
import { MobileNav } from "./MobileNav";
import { SiteFooter } from "./SiteFooter";
import {
  brandTaglineFor,
  type LocaleCode,
  RTL_LOCALES,
} from "./i18n";
import { localizedPath } from "./intl-routing";
import {
  informationLabelsFor,
  informationPageCopyFor,
  type InformationPageKey,
} from "./site-information";

const REPOSITORY_URL = "https://github.com/weiyu1029/careerproof-agent";
const ISSUE_URL = `${REPOSITORY_URL}/issues/new/choose`;
const PRIVATE_REPORT_URL = `${REPOSITORY_URL}/security/advisories/new`;

const CONTACT_EMAILS = {
  general: "contact@interviewthreadai.com",
  feedback: "feedback@interviewthreadai.com",
  partnerships: "partnerships@interviewthreadai.com",
  support: "support@interviewthreadai.com",
  privacy: "privacy@interviewthreadai.com",
} as const;

export function InformationPage({
  locale,
  pageKey,
}: {
  locale: LocaleCode;
  pageKey: InformationPageKey;
}) {
  const labels = informationLabelsFor(locale);
  const page = informationPageCopyFor(locale, pageKey);
  const account = accountCopyFor(locale);
  const homePath = localizedPath(locale);
  const isReviewedTranslation = locale === "en" || locale === "zh-TW";
  const pageTitle = isReviewedTranslation ? page.title : labels[pageKey];
  const actionLabels =
    locale === "zh-TW"
      ? {
          issue: "建立公開產品 issue ↗",
          privateReport: "開始私人通報 ↗",
          repository: "查看開源程式庫 ↗",
          chooseContact: "選擇聯絡管道",
          guidance: "撰寫本政策時參考的官方指引",
        }
      : {
          issue: "Open a public product issue ↗",
          privateReport: "Start a private report ↗",
          repository: "View the repository ↗",
          chooseContact: "Choose a contact channel",
          guidance: "Official guidance consulted",
        };
  const contactChannels =
    locale === "zh-TW"
      ? [
          {
            label: "一般聯絡",
            description: "不確定該找誰時，先從這裡開始。",
            email: CONTACT_EMAILS.general,
          },
          {
            label: "產品意見回饋",
            description: "分享功能建議、操作問題或使用心得。",
            email: CONTACT_EMAILS.feedback,
          },
          {
            label: "合作洽詢",
            description: "開源合作、社群、研究與機構合作。",
            email: CONTACT_EMAILS.partnerships,
          },
          {
            label: "使用者支援",
            description: "帳號、登入或產品使用協助。",
            email: CONTACT_EMAILS.support,
          },
          {
            label: "隱私與資料請求",
            description: "資料存取、更正、匯出或刪除請求。",
            email: CONTACT_EMAILS.privacy,
          },
        ]
      : [
          {
            label: "General contact",
            description: "Start here when you are not sure which channel fits.",
            email: CONTACT_EMAILS.general,
          },
          {
            label: "Product feedback",
            description: "Share feature ideas, usability issues, or your experience.",
            email: CONTACT_EMAILS.feedback,
          },
          {
            label: "Partnerships",
            description: "Open-source, community, research, and institutional collaboration.",
            email: CONTACT_EMAILS.partnerships,
          },
          {
            label: "User support",
            description: "Get help with your account, sign-in, or product use.",
            email: CONTACT_EMAILS.support,
          },
          {
            label: "Privacy and data requests",
            description: "Request access, correction, export, or deletion of your data.",
            email: CONTACT_EMAILS.privacy,
          },
        ];

  return (
    <main
      className="information-page"
      lang={locale}
      dir={RTL_LOCALES.has(locale) ? "rtl" : "ltr"}
    >
      <header className="information-header">
        <a className="brand" href={homePath} aria-label="InterviewThread">
          <BrandMark />
          <span>
            InterviewThread <small>{brandTaglineFor(locale)}</small>
          </span>
        </a>
        <nav aria-label={labels.heading}>
          <a href={homePath}>InterviewThread</a>
          <a href={localizedPath(locale, "about")}>{labels.about}</a>
          <a href={localizedPath(locale, "contact")}>{labels.contact}</a>
          <a className="button secondary" href={localizedPath(locale, "account")}>
            {account.account}
          </a>
        </nav>
        <MobileNav
          label={labels.heading}
          items={[
            { label: "InterviewThread", href: homePath },
            { label: labels.about, href: localizedPath(locale, "about") },
            { label: labels.contact, href: localizedPath(locale, "contact") },
            { label: labels.terms, href: localizedPath(locale, "terms") },
            { label: labels.privacy, href: localizedPath(locale, "privacy") },
            { label: account.account, href: localizedPath(locale, "account") },
          ]}
        />
      </header>

      <article className="information-article">
        <header className="information-hero">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{pageTitle}</h1>
          <p>{page.description}</p>
          {page.updated && <time>{page.updated}</time>}
        </header>

        {!isReviewedTranslation && (
          <aside className="information-translation-note">
            The English text is the current controlling draft. Navigation is localized;
            a legally reviewed translation is not yet available for this language.
          </aside>
        )}

        {page.callout && (
          <aside className="information-callout">{page.callout}</aside>
        )}

        {pageKey === "contact" && (
          <>
            <section
              className="contact-channels"
              aria-label={locale === "zh-TW" ? "官方聯絡信箱" : "Official contact inboxes"}
            >
              {contactChannels.map((channel) => (
                <a key={channel.email} href={`mailto:${channel.email}`}>
                  <span>{channel.label}</span>
                  <strong>{channel.email}</strong>
                  <p>{channel.description}</p>
                </a>
              ))}
            </section>
            <ContactInboxForms locale={locale} />
          </>
        )}

        <div className="information-sections">
          {page.sections.map((section, index) => (
            <section key={section.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
                {pageKey === "contact" && index === 0 && (
                  <a className="information-action" href={ISSUE_URL}>
                    {actionLabels.issue}
                  </a>
                )}
                {pageKey === "contact" && index === 1 && (
                  <a className="information-action" href={PRIVATE_REPORT_URL}>
                    {actionLabels.privateReport}
                  </a>
                )}
                {pageKey === "contact" && index === 2 && (
                  <a className="information-action" href={REPOSITORY_URL}>
                    {actionLabels.repository}
                  </a>
                )}
              </div>
            </section>
          ))}
        </div>

        {(pageKey === "terms" || pageKey === "privacy") && (
          <aside className="information-links">
            <div>
              <strong>{labels.contact}</strong>
              <a href={localizedPath(locale, "contact")}>{actionLabels.chooseContact}</a>
            </div>
            <div>
              <strong>{pageKey === "privacy" ? actionLabels.guidance : labels.privacy}</strong>
              {pageKey === "privacy" ? (
                <>
                  <a href="https://developers.google.com/terms/api-services-user-data-policy">Google API user-data policy ↗</a>
                  <a href="https://www.linkedin.com/legal/l/api-terms-of-use">LinkedIn API terms ↗</a>
                  <a href="https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business">FTC privacy and security guide ↗</a>
                  <a href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/">ICO transparency guidance ↗</a>
                </>
              ) : (
                <a href={localizedPath(locale, "privacy")}>{labels.privacy}</a>
              )}
            </div>
          </aside>
        )}
      </article>

      <SiteFooter locale={locale} />
    </main>
  );
}
