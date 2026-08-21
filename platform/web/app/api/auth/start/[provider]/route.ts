import {
  authSecret,
  callbackUrl,
  isOAuthProvider,
  oauthProviderConfig,
  oauthReadiness,
} from "../../../../oauth-providers";
import {
  createOAuthState,
  stateCookie,
} from "../../../../oauth-security";
import {
  safeReturnPath,
} from "../../../../auth-paths";
import { localeFromPath, type LocaleCode } from "../../../../i18n";
import { localizedPath } from "../../../../intl-routing";

type RouteContext = { params: Promise<{ provider: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { provider: providerName } = await context.params;
  const requestUrl = new URL(request.url);
  const returnTo = safeReturnPath(requestUrl.searchParams.get("return_to"));
  const locale = localeFromPath(requestUrl.searchParams.get("locale") || "en") || "en";

  if (!isOAuthProvider(providerName)) {
    return accountErrorRedirect(request, returnTo, "unknown_provider", locale);
  }

  const secret = authSecret();
  const config = oauthProviderConfig(providerName);
  if (!secret || !config || !oauthReadiness(providerName)) {
    return accountErrorRedirect(
      request,
      returnTo,
      "provider_not_configured",
      locale,
      providerName,
    );
  }

  const oauthState = await createOAuthState(providerName, returnTo, locale, secret);
  const authorizationUrl = new URL(config.authorizationEndpoint);
  const authorizationParameters = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl(request, providerName),
    response_type: "code",
    scope: config.scope,
    state: oauthState.payload.state,
  });
  if (config.usesPkce) {
    authorizationParameters.set("code_challenge", oauthState.challenge);
    authorizationParameters.set("code_challenge_method", "S256");
  }
  authorizationUrl.search = authorizationParameters.toString();
  if (providerName === "google") {
    authorizationUrl.searchParams.set("prompt", "select_account");
  }

  const response = mutableRedirect(authorizationUrl);
  response.headers.append(
    "Set-Cookie",
    stateCookie(
      providerName,
      oauthState.cookieValue,
      requestUrl.protocol === "https:",
    ),
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function accountErrorRedirect(
  request: Request,
  returnTo: string,
  error: string,
  locale: LocaleCode,
  provider?: string,
) {
  const destination = localizedPath(locale, "account");
  const url = new URL(destination, request.url);
  url.searchParams.set("return_to", returnTo);
  url.searchParams.set("auth_error", error);
  if (provider) url.searchParams.set("provider", provider);
  return mutableRedirect(url);
}

function mutableRedirect(destination: URL) {
  return new Response(null, {
    status: 302,
    headers: { Location: destination.toString(), "Cache-Control": "no-store" },
  });
}
