import { localeFromPath, type LocaleCode } from "./i18n";
import { localizedPath } from "./intl-routing";

const APP_ORIGIN = "https://interviewthread.local";

export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";

  try {
    const url = new URL(value, APP_ORIGIN);
    if (url.origin !== APP_ORIGIN || isReservedAuthPath(url.pathname)) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export function accountSignInPath(
  locale: LocaleCode,
  returnTo: string,
): string {
  const safeReturnTo = safeReturnPath(returnTo);
  return `${localizedPath(locale, "account")}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function signOutPath(returnTo = "/"): string {
  return `/api/auth/sign-out?return_to=${encodeURIComponent(safeReturnPath(returnTo))}`;
}

export function accountPathForReturnTo(returnTo: string): string {
  const firstSegment = safeReturnPath(returnTo).split("/").filter(Boolean)[0];
  const locale = localeFromPath(firstSegment || "en") || "en";
  return localizedPath(locale, "account");
}

export function oauthStartPath(
  provider: "google" | "github" | "linkedin",
  returnTo: string,
  locale?: LocaleCode,
): string {
  const localeQuery = locale ? `&locale=${encodeURIComponent(locale.toLowerCase())}` : "";
  return `/api/auth/start/${provider}?return_to=${encodeURIComponent(safeReturnPath(returnTo))}${localeQuery}`;
}

function isReservedAuthPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/auth/") ||
    pathname === "/signin-with-chatgpt" ||
    pathname === "/signout-with-chatgpt" ||
    pathname === "/callback"
  );
}
