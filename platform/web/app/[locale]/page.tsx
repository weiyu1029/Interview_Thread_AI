import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Home from "../page";
import {
  copyFor,
  LANGUAGES,
  localeFromPath,
  RTL_LOCALES,
} from "../i18n";
import {
  languageAlternates,
  localeOpenGraph,
  localizedPath,
} from "../intl-routing";

type LocalizedHomeProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return LANGUAGES.map(([locale]) => ({ locale: locale.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: LocalizedHomeProps): Promise<Metadata> {
  const { locale: pathLocale } = await params;
  const locale = localeFromPath(pathLocale);
  if (!locale) return {};
  const copy = copyFor(locale);
  const title =
    locale === "en"
      ? "InterviewThread — Free AI mock interview practice"
      : `InterviewThread — ${copy.heroTitle}`;
  const description =
    locale === "en"
      ? "Upload your resume and a job description to practice realistic interview questions with truthful, role-specific AI feedback."
      : copy.heroBody;
  const path = localizedPath(locale);
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: languageAlternates(),
    },
    openGraph: {
      type: "website",
      siteName: "InterviewThread",
      url: path,
      title,
      description,
      locale: localeOpenGraph(locale),
      alternateLocale: LANGUAGES.filter(([code]) => code !== locale).map(
        ([code]) => localeOpenGraph(code),
      ),
      images: [
        {
          url: "/og-interviewthread.png",
          width: 1200,
          height: 630,
          alt: "InterviewThread Interview Proof Pack",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-interviewthread.png"],
    },
  };
}

export default async function LocalizedHome({ params }: LocalizedHomeProps) {
  const { locale: pathLocale } = await params;
  const locale = localeFromPath(pathLocale);
  if (!locale) notFound();
  const copy = copyFor(locale);
  const pageTitle =
    locale === "en"
      ? "InterviewThread — Free AI mock interview practice"
      : `InterviewThread — ${copy.heroTitle}`;
  const pageDescription =
    locale === "en"
      ? "Upload your resume and a job description to practice realistic interview questions with truthful, role-specific AI feedback."
      : copy.heroBody;
  const pageUrl = localizedPath(locale);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: pageUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "InterviewThread",
      url: "/",
    },
  };
  return (
    <div lang={locale} dir={RTL_LOCALES.has(locale) ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Home initialLocale={locale} />
    </div>
  );
}
