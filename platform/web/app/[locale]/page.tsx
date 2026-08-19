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
  const title = `CareerStoryMap — ${copy.heroTitle}`;
  const path = localizedPath(locale);
  return {
    title: { absolute: title },
    description: copy.heroBody,
    alternates: {
      canonical: path,
      languages: languageAlternates(),
    },
    openGraph: {
      type: "website",
      siteName: "CareerStoryMap",
      url: path,
      title,
      description: copy.heroBody,
      locale: localeOpenGraph(locale),
      alternateLocale: LANGUAGES.filter(([code]) => code !== locale).map(
        ([code]) => localeOpenGraph(code),
      ),
      images: [
        {
          url: "/og-careerstorymap.png",
          width: 1536,
          height: 1024,
          alt: "CareerStoryMap — Map your evidence. Own your story.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: copy.heroBody,
      images: ["/og-careerstorymap.png"],
    },
  };
}

export default async function LocalizedHome({ params }: LocalizedHomeProps) {
  const { locale: pathLocale } = await params;
  const locale = localeFromPath(pathLocale);
  if (!locale) notFound();
  const copy = copyFor(locale);
  const pageUrl = localizedPath(locale);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `CareerStoryMap — ${copy.heroTitle}`,
    description: copy.heroBody,
    url: pageUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "CareerStoryMap",
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
