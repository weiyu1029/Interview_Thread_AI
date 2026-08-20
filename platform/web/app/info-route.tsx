import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InformationPage } from "./InformationPage";
import { localeFromPath } from "./i18n";
import {
  languageAlternates,
  localeOpenGraph,
  localizedPath,
} from "./intl-routing";
import {
  informationLabelsFor,
  informationPageCopyFor,
  type InformationPageKey,
} from "./site-information";

export type InformationRouteProps = {
  params: Promise<{ locale: string }>;
};

export async function informationMetadata(
  props: InformationRouteProps,
  pageKey: InformationPageKey,
): Promise<Metadata> {
  const { locale: pathLocale } = await props.params;
  const locale = localeFromPath(pathLocale);
  if (!locale) return {};
  const copy = informationPageCopyFor(locale, pageKey);
  const labels = informationLabelsFor(locale);
  const title = locale === "en" || locale === "zh-TW" ? copy.title : labels[pageKey];
  const path = localizedPath(locale, pageKey);

  return {
    title,
    description: copy.description,
    alternates: {
      canonical: path,
      languages: languageAlternates(pageKey),
    },
    openGraph: {
      type: "website",
      url: path,
      title: `${title} | InterviewThread`,
      description: copy.description,
      locale: localeOpenGraph(locale),
    },
  };
}

export async function renderInformationRoute(
  props: InformationRouteProps,
  pageKey: InformationPageKey,
) {
  const { locale: pathLocale } = await props.params;
  const locale = localeFromPath(pathLocale);
  if (!locale) notFound();
  return <InformationPage locale={locale} pageKey={pageKey} />;
}

