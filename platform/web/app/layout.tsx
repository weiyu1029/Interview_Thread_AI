import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { LANGUAGES } from "./i18n";
import { languageAlternates } from "./intl-routing";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function requestOrigin() {
  const requestHeaders = await headers();
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configuredOrigin) return configuredOrigin;
  const host =
    requestHeaders.get("x-forwarded-host") ||
    requestHeaders.get("host") ||
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ||
    (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const origin = await requestOrigin();
  const title = "CareerStoryMap — Build interview stories you can defend.";
  const description =
    "Turn one job description and your real experience into an evidence map, defensible interview stories, likely follow-up questions, and a focused mock interview.";
  const image = new URL("/og-careerstorymap.png", origin).toString();
  const englishHome = new URL("/en", origin).toString();

  return {
    metadataBase: new URL(origin),
    title: {
      default: title,
      template: "%s | CareerStoryMap",
    },
    description,
    alternates: {
      canonical: englishHome,
      languages: languageAlternates(),
    },
    keywords: [
      "interview proof pack",
      "resume job description match",
      "interview story builder",
      "career evidence map",
      "resume evidence gaps",
      "AI mock interview",
      "interview story coaching",
      "open source career tools",
    ],
    applicationName: "CareerStoryMap",
    category: "career technology",
    manifest: "/site.webmanifest",
    icons: {
      icon: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
      apple: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName: "CareerStoryMap",
      url: englishHome,
      title,
      description,
      locale: "en_US",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "CareerStoryMap Interview Proof Pack",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const origin = await requestOrigin();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "CareerStoryMap",
      slogan: "Map your evidence. Own your story.",
      url: origin,
      sameAs: ["https://github.com/weiyu1029/CareerStoryMap-agent"],
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "CareerStoryMap",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Turn a real resume and job description into an evidence-grounded Interview Proof Pack with defensible stories, visible gaps, likely follow-ups, and a focused mock interview.",
      featureList: [
        "Resume-to-job-description evidence map",
        "Three strongest role-match proofs",
        "Three real capability or evidence gaps",
        "Three to five defensible interview stories",
        "Ten likely follow-up questions",
        "Thirty-minute interview preparation plan",
        "Evidence-grounded voice and text mock interviews",
      ],
      url: origin,
      inLanguage: LANGUAGES.map(([code]) => code),
      isAccessibleForFree: true,
      offers: [
        {
          "@type": "Offer",
          name: "Open-source edition",
          price: "0",
          priceCurrency: "USD",
        },
      ],
      license: "https://github.com/weiyu1029/CareerStoryMap-agent/blob/main/LICENSE",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "CareerStoryMap",
      alternateName: "Career Story Map",
      url: origin,
      description:
        "Open-source interview preparation grounded in evidence a candidate can defend.",
      inLanguage: LANGUAGES.map(([code]) => code),
    },
  ];
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
