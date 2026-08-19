import Link from "next/link";
import { SEO_PAGES, SeoPageKey } from "./seo-content";

export function SeoLandingPage({ pageKey }: { pageKey: SeoPageKey }) {
  const page = SEO_PAGES[pageKey];
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://careerstorymap.com";
  const pageUrl = `${siteUrl}${page.path}`;
  const related = Object.values(SEO_PAGES).filter(
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
      isPartOf: {
        "@type": "WebSite",
        name: "CareerStoryMap",
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
          name: "CareerStoryMap",
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
    <main className="seo-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="seo-header">
        <Link className="brand" href="/" aria-label="CareerStoryMap home">
          <span className="brand-mark" aria-hidden="true">CS</span>
          <span>
            CareerStoryMap <small>Evidence to opportunity</small>
          </span>
        </Link>
        <nav aria-label="Page navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#questions">Questions</a>
          <Link className="button secondary" href="/#workspace">
            Open workspace
          </Link>
        </nav>
      </header>

      <section className="seo-hero">
        <div>
          <Link className="seo-backlink" href="/">
            CareerStoryMap / {page.navLabel}
          </Link>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="lede">{page.description}</p>
          <div className="hero-actions">
            <Link
              className="button primary"
              href={`/?view=${encodeURIComponent(page.workspaceView)}#workspace`}
            >
              {page.primaryCta}
            </Link>
            <a className="text-link" href="#how-it-works">
              See how it works
            </a>
          </div>
        </div>
        <aside className="seo-map-card" aria-label="CareerStoryMap evidence flow">
          <div className="seo-map-heading">
            <span>Career story map</span>
            <b>Evidence-linked</b>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div><small>Source</small><strong>Resume evidence</strong></div>
            </li>
            <li>
              <span>02</span>
              <div><small>Target</small><strong>Job requirements</strong></div>
            </li>
            <li>
              <span>03</span>
              <div><small>Outcome</small><strong>Interview story</strong></div>
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
          <p className="eyebrow">How it works</p>
          <h2>A clearer path from experience to opportunity.</h2>
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
          <p className="eyebrow">Why CareerStoryMap</p>
          <h2>Useful because it stays accountable to the source.</h2>
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
          <p className="eyebrow">Questions</p>
          <h2>What to know before you begin.</h2>
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

      <section className="seo-related" aria-label="Explore CareerStoryMap tools">
        <p className="eyebrow">Explore the career workflow</p>
        <h2>One evidence map, six connected decisions.</h2>
        <div>
          {related.map((candidate) => (
            <Link href={candidate.path} key={candidate.path}>
              <span>{candidate.navLabel}</span>
              <small>{candidate.eyebrow}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="seo-final-cta">
        <p className="eyebrow">Map your evidence. Own your story.</p>
        <h2>Build a story that can hold up under a real interview.</h2>
        <Link className="button primary" href="/#workspace">
          Open CareerStoryMap
        </Link>
      </section>

      <footer className="seo-footer">
        <span>CareerStoryMap</span>
        <span>Evidence that travels.</span>
        <a href="https://github.com/weiyu1029/careerproof-agent">
          Open-source repository
        </a>
      </footer>
    </main>
  );
}
