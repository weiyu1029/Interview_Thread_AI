import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ||
    requestHeaders.get("host") ||
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ||
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "CareerProof Global — Evidence that travels";
  const description =
    "Turn verified career stories into stronger global job matches, multilingual applications, and evidence-grounded interview narratives.";
  const image = new URL("/og-v2.png", origin).toString();

  return {
    metadataBase: new URL(origin),
    title,
    description,
    alternates: { canonical: origin },
    keywords: [
      "career evidence",
      "job matching",
      "resume analysis",
      "global jobs",
      "open source career tools",
    ],
    applicationName: "CareerProof Global",
    category: "career technology",
    manifest: "/site.webmanifest",
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
      title,
      description,
      images: [{ url: image, width: 1732, height: 908 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CareerProof Global",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Evidence-grounded global job matching, career story development, market insights, and application tracking.",
    isAccessibleForFree: true,
    license: "https://github.com/weiyu1029/careerproof-agent/blob/main/LICENSE",
  };
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
