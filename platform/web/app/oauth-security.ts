import { safeReturnPath } from "./auth-paths";
import type { LocaleCode } from "./i18n";
import { callbackPath, type OAuthProvider } from "./oauth-providers";

export const AUTH_SESSION_COOKIE = "interviewthread_session";
const OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export type OAuthStatePayload = {
  provider: OAuthProvider;
  state: string;
  verifier: string;
  returnTo: string;
  locale: LocaleCode;
  expiresAt: number;
};

export async function createOAuthState(
  provider: OAuthProvider,
  returnTo: string,
  locale: LocaleCode,
  secret: string,
) {
  const state = randomToken(32);
  const verifier = randomToken(64);
  const payload: OAuthStatePayload = {
    provider,
    state,
    verifier,
    returnTo: safeReturnPath(returnTo),
    locale,
    expiresAt: Date.now() + OAUTH_STATE_MAX_AGE_SECONDS * 1000,
  };
  const encoded = encodeText(JSON.stringify(payload));
  const signature = await hmac(encoded, secret);
  return {
    payload,
    challenge: await sha256Base64Url(verifier),
    cookieValue: `${encoded}.${signature}`,
  };
}

export async function verifyOAuthState(
  value: string | undefined,
  secret: string,
): Promise<OAuthStatePayload | null> {
  if (!value) return null;
  const [encoded, signature, extra] = value.split(".");
  if (!encoded || !signature || extra) return null;
  const expected = await hmac(encoded, secret);
  if (!constantTimeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(decodeText(encoded)) as Partial<OAuthStatePayload>;
    if (
      !isProvider(payload.provider) ||
      typeof payload.state !== "string" ||
      typeof payload.verifier !== "string" ||
      typeof payload.returnTo !== "string" ||
      typeof payload.locale !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt < Date.now()
    ) {
      return null;
    }
    return {
      provider: payload.provider,
      state: payload.state,
      verifier: payload.verifier,
      returnTo: safeReturnPath(payload.returnTo),
      locale: payload.locale as LocaleCode,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}

export function oauthStateCookieName(provider: OAuthProvider) {
  return `interviewthread_oauth_${provider}`;
}

export function stateCookie(
  provider: OAuthProvider,
  value: string,
  secure: boolean,
): string {
  return serializeCookie(oauthStateCookieName(provider), value, {
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
    path: callbackPath(provider),
    secure,
  });
}

export function clearStateCookie(
  provider: OAuthProvider,
  secure: boolean,
): string {
  return serializeCookie(oauthStateCookieName(provider), "", {
    maxAge: 0,
    path: callbackPath(provider),
    secure,
  });
}

export function sessionCookie(value: string, secure: boolean): string {
  return serializeCookie(AUTH_SESSION_COOKIE, value, {
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    secure,
  });
}

export function clearSessionCookie(secure: boolean): string {
  return serializeCookie(AUTH_SESSION_COOKIE, "", {
    maxAge: 0,
    path: "/",
    secure,
  });
}

export function cookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [candidate, ...value] = part.trim().split("=");
    if (candidate === name) return decodeURIComponent(value.join("="));
  }
  return undefined;
}

export async function hashSessionToken(token: string): Promise<string> {
  return sha256Base64Url(token);
}

export function newSessionToken(): string {
  return randomToken(48);
}

export async function stableExternalUserId(
  provider: OAuthProvider,
  providerUserId: string,
): Promise<string> {
  const digest = await sha256Base64Url(`${provider}:${providerUserId}`);
  return `oauth_${digest.slice(0, 32)}`;
}

function serializeCookie(
  name: string,
  value: string,
  options: { maxAge: number; path: string; secure: boolean },
): string {
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (options.secure) attributes.push("Secure");
  return attributes.join("; ");
}

function randomToken(bytes: number): string {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return encodeBytes(value);
}

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return encodeBytes(new Uint8Array(signature));
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return encodeBytes(new Uint8Array(digest));
}

function encodeText(value: string): string {
  return encodeBytes(new TextEncoder().encode(value));
}

function decodeText(value: string): string {
  return new TextDecoder().decode(decodeBytes(value));
}

function encodeBytes(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function decodeBytes(value: string): Uint8Array {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function constantTimeEqual(left: string, right: string): boolean {
  const maxLength = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let index = 0; index < maxLength; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return difference === 0;
}

function isProvider(value: unknown): value is OAuthProvider {
  return value === "google" || value === "github" || value === "linkedin";
}
