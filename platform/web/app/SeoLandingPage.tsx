import { brandTaglineFor, copyFor, LocaleCode, RTL_LOCALES } from "./i18n";
import { localizedPath } from "./intl-routing";
import { SEO_PAGE_KEYS, SeoPageKey } from "./seo-content";
import { localizedSeoPage, seoUiFor } from "./seo-localization";
import { BrandMark } from "./BrandMark";
import { MobileNav } from "./MobileNav";

export function SeoLandingPage({
  pageKey,
  locale = "en",
}: {
  pageKey: SeoPageKey;
  locale?: LocaleCode;
}) {
  const page = localizedSeoPage(pageKey, locale);
  const ui = seoUiFor(locale);
  const core = copyFor(locale);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://interviewthread.com";
  const homePath = localizedPath(locale);
  const pagePath = localizedPath(locale, page.path);
  const pageUrl = `${siteUrl}${pagePath}`;
  const workspaceHref = `${homePath}?view=${encodeURIComponent(page.workspaceView)}#workspace`;
  const workflow = [
    { view: "Analyze", label: core.analyze },
    { view: "Recommendations", label: core.recommendations },
    { view: "Tracker", label: core.tracker },
    { view: "Interview Studio", label: core.interview },
  ];
  const related = SEO_PAGE_KEYS.map((key) => localizedSeoPage(key, locale)).filter(
    (candidate) => candidate.path !== page.path,
  );
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.navLabel,
      headline: page.title,
      description: page.description,
      url: pageUrl,
      inLanguage: locale,
      isPartOf: {
        "@type": "WebSite",
        name: "InterviewThread",
        url: siteUrl,
      },
      about: page.keywords,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "InterviewThread",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.navLabel,
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  return (
    <main
      className="seo-page"
      lang={locale}
      dir={RTL_LOCALES.has(locale) ? "rtl" : "ltr"}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="seo-header">
        <a className="brand" href={homePath} aria-label="InterviewThread home">
          <BrandMark />
          <span>
            InterviewThread <small>{brandTaglineFor(locale)}</small>
          </span>
        </a>
        <nav aria-label="Page navigation">
          <a href="#how-it-works">{ui.howItWorks}</a>
          <a href="#questions">{ui.questions}</a>
          <a className="button secondary" href={workspaceHref}>
            {ui.openWorkspace}
          </a>
        </nav>
        <MobileNav
          label={ui.exploreWorkflow}
          items={[
            { label: "InterviewThread", href: homePath },
            { label: ui.openWorkspace, href: workspaceHref },
            { label: ui.howItWorks, href: "#how-it-works" },
            { label: ui.questions, href: "#questions" },
            {
              label: core.enter,
              href: `${localizedPath(locale, "account")}?plan=community`,
            },
          ]}
        />
      </header>

      <nav className="seo-workflow-nav" aria-label={ui.exploreWorkflow}>
        {workflow.map((step, index) => (
          <a
            className={page.workspaceView === step.view ? "active" : ""}
            href={`${homePath}?view=${encodeURIComponent(step.view)}#workspace`}
            key={step.view}
          >
            <span>{index + 1}</span>
            {step.label}
          </a>
        ))}
      </nav>

      <section className="seo-hero">
        <div>
          <a className="seo-backlink" href={homePath}>
            InterviewThread / {page.navLabel}
          </a>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="lede">{page.description}</p>
          <div className="hero-actions">
            <a
              className="button primary"
              href={workspaceHref}
            >
              {page.primaryCta}
            </a>
            <a className="text-link" href="#how-it-works">
              {ui.seeHow}
            </a>
          </div>
        </div>
        <aside className="seo-map-card" aria-label="InterviewThread evidence flow">
          <div className="seo-map-heading">
            <span>{ui.mapTitle}</span>
            <b>{ui.evidenceLinked}</b>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div><small>{ui.source}</small><strong>{ui.resumeEvidence}</strong></div>
            </li>
            <li>
              <span>02</span>
              <div><small>{ui.target}</small><strong>{ui.jobRequirements}</strong></div>
            </li>
            <li>
              <span>03</span>
              <div><small>{ui.outcome}</small><strong>{ui.interviewStory}</strong></div>
            </li>
          </ol>
          <p>{page.summary}</p>
        </aside>
      </section>

      <section className="seo-metrics" aria-label="Product highlights">
        {page.metrics.map((metric) => (
          <div key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </section>

      <section className="seo-process" id="how-it-works">
        <div className="seo-section-heading">
          <p className="eyebrow">{ui.howItWorks}</p>
          <h2>{ui.clearerPath}</h2>
        </div>
        <div className="seo-step-grid">
          {page.steps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="seo-benefits">
        <div className="seo-benefit-intro">
          <p className="eyebrow">{ui.whyBrand}</p>
          <h2>{ui.accountable}</h2>
          <p>{page.summary}</p>
        </div>
        <div className="seo-benefit-list">
          {page.benefits.map((benefit) => (
            <article key={benefit.title}>
              <span aria-hidden="true" />
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="seo-faq" id="questions">
        <div className="seo-section-heading">
          <p className="eyebrow">{ui.questions}</p>
          <h2>{ui.beforeBegin}</h2>
        </div>
        <div>
          {page.faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="seo-related" aria-label="Explore InterviewThread tools">
        <p className="eyebrow">{ui.exploreWorkflow}</p>
        <h2>{ui.connectedDecisions}</h2>
        <div>
          {related.map((candidate) => (
            <a
              href={localizedPath(locale, candidate.path)}
              key={candidate.path}
            >
              <span>{candidate.navLabel}</span>
              <small>{candidate.eyebrow}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="seo-final-cta">
        <p className="eyebrow">Map your evidence. Own your story.</p>
        <h2>{ui.finalTitle}</h2>
        <a className="button primary" href={workspaceHref}>
          {ui.openProduct}
        </a>
      </section>

      <footer className="seo-footer">
        <span>InterviewThread</span>
        <span>{locale === "en" ? "Evidence that travels." : core.heroTitle}</span>
        <a href="https://github.com/weiyu1029/careerproof-agent">
          {ui.repository}
        </a>
      </footer>
    </main>
  );
}
