import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "../../SeoLandingPage";
import { LANGUAGES, localeFromPath } from "../../i18n";
import {
  languageAlternates,
  localeOpenGraph,
  localizedPath,
} from "../../intl-routing";
import {
  isSeoPageKey,
  SEO_PAGE_KEYS,
  SeoPageKey,
} from "../../seo-content";
import { localizedSeoPage } from "../../seo-localization";

type LocalizedToolProps = {
  params: Promise<{ locale: string; tool: string }>;
};

export function generateStaticParams() {
  return LANGUAGES.flatMap(([locale]) =>
    SEO_PAGE_KEYS.map((tool) => ({
      locale: locale.toLowerCase(),
      tool,
    })),
  );
}

export async function generateMetadata({
  params,
}: LocalizedToolProps): Promise<Metadata> {
  const { locale: pathLocale, tool } = await params;
  const locale = localeFromPath(pathLocale);
  if (!locale || !isSeoPageKey(tool)) return {};
  const page = localizedSeoPage(tool, locale);
  const path = localizedPath(locale, page.path);
  return {
    title: page.navLabel,
    description: page.description,
    alternates: {
      canonical: path,
      languages: languageAlternates(page.path),
    },
    keywords: page.keywords,
    openGraph: {
      type: "website",
      url: path,
      title: `${page.navLabel} | InterviewThread`,
      description: page.description,
      locale: localeOpenGraph(locale),
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
      title: `${page.navLabel} | InterviewThread`,
      description: page.description,
      images: ["/og-interviewthread.png"],
    },
  };
}

export default async function LocalizedTool({ params }: LocalizedToolProps) {
  const { locale: pathLocale, tool } = await params;
  const locale = localeFromPath(pathLocale);
  if (!locale || !isSeoPageKey(tool)) notFound();
  return <SeoLandingPage pageKey={tool as SeoPageKey} locale={locale} />;
}
