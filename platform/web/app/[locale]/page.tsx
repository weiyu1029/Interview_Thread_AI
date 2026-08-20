import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Home from "../page";
import { getAppUser } from "../auth";
import { accountSignInPath } from "../auth-paths";
import {
  LANGUAGES,
  localeFromPath,
  RTL_LOCALES,
} from "../i18n";
import { homepageCopyFor } from "../homepage-copy";
import {
  languageAlternates,
  localeOpenGraph,
  localizedPath,
} from "../intl-routing";

type LocalizedHomeProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ guest?: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return LANGUAGES.map(([locale]) => ({ locale: locale.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: LocalizedHomeProps): Promise<Metadata> {
  const { locale: pathLocale } = await params;
  const locale = localeFromPath(pathLocale);
  if (!locale) return {};
  const homepage = homepageCopyFor(locale);
  const title =
    locale === "en"
      ? "InterviewThread — AI mock interview preparation"
      : `InterviewThread — ${homepage.heroTitle}`;
  const description = homepage.description;
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
          alt: "InterviewThread AI mock interview practice",
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

export default async function LocalizedHome({ params, searchParams }: LocalizedHomeProps) {
  const [{ locale: pathLocale }, query, user] = await Promise.all([
    params,
    searchParams,
    getAppUser(),
  ]);
  const locale = localeFromPath(pathLocale);
  if (!locale) notFound();
  const homepage = homepageCopyFor(locale);
  const pageTitle =
    locale === "en"
      ? "InterviewThread — AI mock interview preparation"
      : `InterviewThread — ${homepage.heroTitle}`;
  const pageDescription = homepage.description;
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
      <Home
        initialLocale={locale}
        authenticated={Boolean(user)}
        guestMode={!user && query.guest === "1"}
        signInPath={accountSignInPath(locale, `${localizedPath(locale)}#workspace`)}
      />
    </div>
  );
}
