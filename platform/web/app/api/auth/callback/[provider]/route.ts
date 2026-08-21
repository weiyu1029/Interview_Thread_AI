import { safeReturnPath } from "../../../../auth-paths";
import type { LocaleCode } from "../../../../i18n";
import { localizedPath } from "../../../../intl-routing";
import {
  exchangeAuthorizationCode,
  oauthFailureDiagnostic,
  oauthFailurePublicCode,
} from "../../../../oauth-profile";
import {
  authSecret,
  callbackUrl,
  isOAuthProvider,
  oauthProviderConfig,
} from "../../../../oauth-providers";
import {
  clearStateCookie,
  cookieValue,
  hashSessionToken,
  newSessionToken,
  oauthStateCookieName,
  SESSION_MAX_AGE_SECONDS,
  sessionCookie,
  stableExternalUserId,
  verifyOAuthState,
} from "../../../../oauth-security";

type RouteContext = { params: Promise<{ provider: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { provider: providerName } = await context.params;
  const requestUrl = new URL(request.url);
  const secure = requestUrl.protocol === "https:";

  if (!isOAuthProvider(providerName)) {
    return accountErrorRedirect(request, "/", "unknown_provider", "en");
  }

  const secret = authSecret();
  const config = oauthProviderConfig(providerName);
  const statePayload = secret
    ? await verifyOAuthState(
        cookieValue(
          request.headers.get("cookie"),
          oauthStateCookieName(providerName),
        ),
        secret,
      )
    : null;
  const returnTo = safeReturnPath(statePayload?.returnTo);
  const locale = statePayload?.locale || "en";

  if (
    !secret ||
    !config ||
    !statePayload ||
    statePayload.provider !== providerName ||
    statePayload.state !== requestUrl.searchParams.get("state")
  ) {
    return accountErrorRedirect(request, returnTo, "invalid_state", locale, providerName);
  }
  if (requestUrl.searchParams.has("error")) {
    return accountErrorRedirect(request, returnTo, "provider_cancelled", locale, providerName);
  }
  const code = requestUrl.searchParams.get("code");
  if (!code) {
    return accountErrorRedirect(request, returnTo, "missing_code", locale, providerName);
  }

  let failureStage: "provider" | "storage" = "provider";
  try {
    const profile = await exchangeAuthorizationCode({
      provider: providerName,
      config,
      code,
      verifier: statePayload.verifier,
      redirectUri: callbackUrl(request, providerName),
    });
    failureStage = "storage";
    const { createAuthSession, upsertOAuthUser } = await import(
      "../../../../../db"
    );
    const userId = await stableExternalUserId(
      providerName,
      profile.providerUserId,
    );
    await upsertOAuthUser({
      id: userId,
      provider: providerName,
      providerUserId: profile.providerUserId,
      email: profile.email,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      providerUsername: profile.providerUsername,
      providerProfileUrl: profile.providerProfileUrl,
    });

    const sessionToken = newSessionToken();
    await createAuthSession({
      sessionHash: await hashSessionToken(sessionToken),
      userId,
      expiresAt: new Date(
        Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
      ).toISOString(),
    });

    const response = mutableRedirect(new URL(returnTo, request.url));
    response.headers.append("Set-Cookie", sessionCookie(sessionToken, secure));
    response.headers.append(
      "Set-Cookie",
      clearStateCookie(providerName, secure),
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    const diagnostic = oauthFailureDiagnostic(error, failureStage);
    console.error("OAuth callback failed", {
      event: "oauth_callback_failed",
      provider: providerName,
      stage: diagnostic.stage,
      providerStatus: diagnostic.providerStatus,
      providerCode: diagnostic.providerCode,
    });
    return accountErrorRedirect(
      request,
      returnTo,
      oauthFailurePublicCode(error, failureStage),
      locale,
      providerName,
    );
  }
}

function accountErrorRedirect(
  request: Request,
  returnTo: string,
  error: string,
  locale: LocaleCode,
  provider?: string,
) {
  const url = new URL(localizedPath(locale, "account"), request.url);
  url.searchParams.set("return_to", safeReturnPath(returnTo));
  url.searchParams.set("auth_error", error);
  if (provider) url.searchParams.set("provider", provider);
  const response = mutableRedirect(url);
  if (provider && isOAuthProvider(provider)) {
    response.headers.append(
      "Set-Cookie",
      clearStateCookie(provider, new URL(request.url).protocol === "https:"),
    );
  }
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function mutableRedirect(destination: URL) {
  return new Response(null, {
    status: 302,
    headers: { Location: destination.toString(), "Cache-Control": "no-store" },
  });
}
