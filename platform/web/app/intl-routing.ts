import { LANGUAGES, LocaleCode, localeToPath } from "./i18n";

export const INDEXABLE_LOCALES = LANGUAGES.map(([locale]) => locale);

export function localizedPath(locale: LocaleCode, pathname = "") {
  const suffix = pathname
    ? pathname.startsWith("/")
      ? pathname
      : `/${pathname}`
    : "";
  return `/${localeToPath(locale)}${suffix}`;
}

export function languageAlternates(pathname = "") {
  return Object.fromEntries([
    ...INDEXABLE_LOCALES.map((locale) => [
      locale,
      localizedPath(locale, pathname),
    ]),
    ["x-default", localizedPath("en", pathname)],
  ]);
}

export function localeOpenGraph(locale: LocaleCode) {
  return locale.replace("-", "_");
}
