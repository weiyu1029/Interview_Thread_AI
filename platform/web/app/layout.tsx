import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Source_Serif_4,
} from "next/font/google";
import { headers } from "next/headers";
import { LANGUAGES, localeToPath, RTL_LOCALES } from "./i18n";
import { languageAlternates } from "./intl-routing";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
  const favicon = new URL("/interviewthread-favicon-v4.ico", origin).toString();
  const favicon32 = new URL(
    "/interviewthread-favicon-32-v4.png",
    origin,
  ).toString();
  const icon192 = new URL("/interviewthread-icon-192-v4.png", origin).toString();
  const icon512 = new URL("/interviewthread-icon-512-v4.png", origin).toString();
  const appleIcon = new URL("/interviewthread-apple-v4.png", origin).toString();
  const manifest = new URL(
    "/interviewthread-site-v4.webmanifest",
    origin,
  ).toString();
  const title = "InterviewThread — AI mock interview preparation";
  const description =
    "Build truthful interview stories and practice realistic, role-specific questions with AI feedback grounded in your evidence.";
  const image = new URL("/og-interviewthread.png", origin).toString();
  const englishHome = new URL("/en", origin).toString();

  return {
    metadataBase: new URL(origin),
    title: {
      default: title,
      template: "%s | InterviewThread",
    },
    description,
    alternates: {
      canonical: englishHome,
      languages: languageAlternates(),
    },
    keywords: [
      "AI mock interview",
      "mock interview practice",
      "job interview practice",
      "interview question predictor",
      "interview questions from resume and job description",
      "behavioral interview practice",
      "voice mock interview",
      "interview answer feedback",
      "resume job description match",
    ],
    applicationName: "InterviewThread",
    category: "career technology",
    manifest,
    icons: {
      icon: [
        {
          url: favicon,
          sizes: "any",
        },
        {
          url: favicon32,
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: icon192,
          sizes: "192x192",
          type: "image/png",
        },
        {
          url: icon512,
          sizes: "512x512",
          type: "image/png",
        },
      ],
      apple: [
        {
          url: appleIcon,
          sizes: "180x180",
          type: "image/png",
        },
      ],
      shortcut: [favicon],
    },
    other: {
      "msapplication-config": "/browserconfig.xml",
      "msapplication-TileColor": "#f4f3ef",
      "msapplication-TileImage": icon192,
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
      siteName: "InterviewThread",
      url: englishHome,
      title,
      description,
      locale: "en_US",
      images: [
        {
          url: image,
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
      images: [image],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const origin = await requestOrigin();
  const logo = new URL("/icon-512.png", origin).toString();
  const previewImage = new URL("/og-interviewthread.png", origin).toString();
  const documentLocaleMap = Object.fromEntries(
    LANGUAGES.map(([locale]) => [localeToPath(locale), locale]),
  );
  const rtlLocalePaths = Array.from(RTL_LOCALES, localeToPath);
  const documentLanguageBootstrap = `(function(){try{var path=(location.pathname.split('/')[1]||'en').toLowerCase();var locales=${JSON.stringify(documentLocaleMap)};var rtl=${JSON.stringify(rtlLocalePaths)};var locale=locales[path]||'en';document.documentElement.lang=locale;document.documentElement.dir=rtl.includes(path)?'rtl':'ltr';}catch(_){}})();`;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "InterviewThread",
      slogan: "Find the thread. Own the interview.",
      url: origin,
      logo: {
        "@type": "ImageObject",
        url: logo,
        width: 512,
        height: 512,
      },
      image: previewImage,
      sameAs: ["https://github.com/weiyu1029/Interview_Thread_AI"],
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "InterviewThread",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Upload a real resume and job description to practice realistic interview questions with truthful, role-specific feedback.",
      image: previewImage,
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
      offers: [
        {
          "@type": "Offer",
          name: "Open-source edition",
          price: "0",
          priceCurrency: "USD",
        },
      ],
      license: "https://github.com/weiyu1029/Interview_Thread_AI/blob/main/LICENSE",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "InterviewThread",
      alternateName: ["Interview Thread", "InterviewThread AI"],
      url: origin,
      description:
        "Open-source interview preparation grounded in evidence a candidate can defend.",
      image: previewImage,
      inLanguage: LANGUAGES.map(([code]) => code),
    },
  ];
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sourceSerif.variable} ${cormorant.variable}`}
      >
        <script dangerouslySetInnerHTML={{ __html: documentLanguageBootstrap }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
