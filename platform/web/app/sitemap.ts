import type { MetadataRoute } from "next";
import { LANGUAGES } from "./i18n";
import { languageAlternates, localizedPath } from "./intl-routing";
import { SEO_PAGE_KEYS } from "./seo-content";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://careerstorymap.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const absoluteAlternates = (pathname = "") =>
    Object.fromEntries(
      Object.entries(languageAlternates(pathname)).map(([locale, path]) => [
        locale,
        `${SITE_URL}${path}`,
      ]),
    );

  const homes: MetadataRoute.Sitemap = LANGUAGES.map(([locale]) => ({
    url: `${SITE_URL}${localizedPath(locale)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: locale === "en" ? 1 : 0.9,
    alternates: { languages: absoluteAlternates() },
  }));

  const tools: MetadataRoute.Sitemap = LANGUAGES.flatMap(([locale]) =>
    SEO_PAGE_KEYS.map((path) => ({
      url: `${SITE_URL}${localizedPath(locale, path)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: locale === "en" ? 0.85 : 0.75,
      alternates: { languages: absoluteAlternates(path) },
    })),
  );

  return [...homes, ...tools];
}
