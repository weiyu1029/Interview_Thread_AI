import type { MetadataRoute } from "next";
import { LANGUAGES } from "./i18n";
import { languageAlternates, localizedPath } from "./intl-routing";
import { SEO_PAGE_KEYS } from "./seo-content";
import { INFORMATION_PAGE_KEYS } from "./site-information";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://interviewthreadai.com";

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

  const information: MetadataRoute.Sitemap = LANGUAGES.flatMap(([locale]) =>
    INFORMATION_PAGE_KEYS.map((path) => ({
      url: `${SITE_URL}${localizedPath(locale, path)}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: path === "about" ? 0.65 : 0.45,
      alternates: { languages: absoluteAlternates(path) },
    })),
  );

  const beta: MetadataRoute.Sitemap = LANGUAGES.map(([locale]) => ({
    url: `${SITE_URL}${localizedPath(locale, "beta")}`,
    lastModified,
    changeFrequency: "monthly",
    priority: locale === "en" ? 0.7 : 0.6,
    alternates: { languages: absoluteAlternates("beta") },
  }));

  return [...homes, ...tools, ...information, ...beta];
}
