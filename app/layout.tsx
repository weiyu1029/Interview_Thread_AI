import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { LANGUAGES } from "./i18n";
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
  const title = "CareerStoryMap — Map your evidence. Own your story.";
  const description =
    "Match your resume to any job description, build credible career stories, practice AI interviews, and discover stronger-fit roles worldwide.";
  const image = new URL("/og-careerstorymap.png", origin).toString();

  return {
    metadataBase: new URL(origin),
    title: {
      default: title,
      template: "%s | CareerStoryMap",
    },
    description,
    alternates: { canonical: origin },
    keywords: [
      "career evidence",
      "AI job matching",
      "career intelligence",
      "resume analysis",
      "resume keyword analysis",
      "AI mock interview",
      "interview story coaching",
      "global jobs",
      "multilingual job search",
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
      url: origin,
      title,
      description,
      locale: "en_US",
      images: [
        {
          url: image,
          width: 1536,
          height: 1024,
          alt: "CareerStoryMap — Map your evidence. Own your story.",
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
      sameAs: ["https://github.com/weiyu1029/careerproof-agent"],
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "CareerStoryMap",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Evidence-grounded resume and job analysis, interview story development, multi-persona AI mock interviews, global job matching, market insights, and application tracking.",
      featureList: [
        "Evidence-grounded resume and job description analysis",
        "Global job recommendations from approved employer sources",
        "Market insight by geography and role",
        "Multilingual interface across 40 languages",
        "Voice and text mock interviews for HR, hiring manager, executive, peer, and case scenarios",
        "Application tracker and career copilot",
      ],
      url: origin,
      inLanguage: LANGUAGES.map(([code]) => code),
      isAccessibleForFree: true,
      offers: [
        {
          "@type": "Offer",
          name: "Community",
          price: "0",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "15",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            billingDuration: "P1M",
          },
        },
        {
          "@type": "Offer",
          name: "Pro annual",
          price: "150",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            billingDuration: "P1Y",
          },
        },
        {
          "@type": "Offer",
          name: "Team",
          price: "35",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            billingDuration: "P1M",
            unitText: "seat",
          },
        },
        {
          "@type": "Offer",
          name: "Enterprise",
          price: "15000",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            billingDuration: "P1Y",
          },
        },
      ],
      license: "https://github.com/weiyu1029/careerproof-agent/blob/main/LICENSE",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "CareerStoryMap",
      alternateName: "Career Story Map",
      url: origin,
      description:
        "Open-source global career intelligence grounded in the evidence a candidate can support.",
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
