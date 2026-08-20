import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BetaProgramPage } from "../../BetaProgramPage";
import { betaCopyFor } from "../../beta-copy";
import { localeFromPath } from "../../i18n";
import { languageAlternates, localizedPath } from "../../intl-routing";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = localeFromPath((await params).locale);
  if (!locale) return {};
  const copy = betaCopyFor(locale);
  return { title: `${copy.label} | InterviewThread`, description: copy.description, alternates: { canonical: localizedPath(locale, "beta"), languages: languageAlternates("beta") }, robots: { index: true, follow: true } };
}

export default async function BetaPage({ params }: Props) {
  const locale = localeFromPath((await params).locale);
  if (!locale) notFound();
  return <BetaProgramPage locale={locale} />;
}
