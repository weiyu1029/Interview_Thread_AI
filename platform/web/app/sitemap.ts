import type { MetadataRoute } from "next";
import { SEO_PAGE_KEYS } from "./seo-content";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://careerstorymap.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...SEO_PAGE_KEYS.map((path) => ({
      url: `${SITE_URL}/${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
  ];
}
