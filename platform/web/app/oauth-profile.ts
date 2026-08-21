import type { OAuthProvider, OAuthProviderConfig } from "./oauth-providers";

type TokenResponse = {
  access_token?: string;
  error?: string;
};

export type OAuthFailureStage =
  | "token_exchange"
  | "token_response"
  | "profile_fetch"
  | "profile_response";

export class OAuthFlowError extends Error {
  readonly stage: OAuthFailureStage;
  readonly providerStatus?: number;
  readonly providerCode?: string;

  constructor(
    stage: OAuthFailureStage,
    providerStatus?: number,
    providerCode?: string,
  ) {
    super(`OAuth ${stage} failed.`);
    this.name = "OAuthFlowError";
    this.stage = stage;
    this.providerStatus = providerStatus;
    this.providerCode = providerCode;
  }
}

export type OAuthFailureDiagnostic = {
  stage: OAuthFailureStage | "storage" | "provider";
  providerStatus?: number;
  providerCode?: string;
};

export function oauthFailureDiagnostic(
  error: unknown,
  fallbackStage: "storage" | "provider" = "provider",
): OAuthFailureDiagnostic {
  if (error instanceof OAuthFlowError) {
    return {
      stage: error.stage,
      providerStatus: error.providerStatus,
      providerCode: error.providerCode,
    };
  }
  return { stage: fallbackStage };
}

export function oauthFailurePublicCode(
  error: unknown,
  fallbackStage: "storage" | "provider" = "provider",
) {
  const diagnostic = oauthFailureDiagnostic(error, fallbackStage);
  if (diagnostic.providerCode === "invalid_client") {
    return "token_invalid_client";
  }
  if (diagnostic.providerCode === "invalid_grant") {
    return "token_invalid_grant";
  }
  if (
    diagnostic.providerCode === "invalid_scope" ||
    diagnostic.providerCode === "unauthorized_scope_error" ||
    diagnostic.providerCode === "insufficient_scope"
  ) {
    return "scope_denied";
  }
  if (diagnostic.stage === "storage") return "storage_failed";
  if (
    diagnostic.stage === "profile_fetch" ||
    diagnostic.stage === "profile_response"
  ) {
    return "profile_failed";
  }
  if (
    diagnostic.stage === "token_exchange" ||
    diagnostic.stage === "token_response"
  ) {
    return "token_exchange_failed";
  }
  return "provider_failed";
}

export type OAuthProfile = {
  provider: OAuthProvider;
  providerUserId: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  providerUsername: string | null;
  providerProfileUrl: string | null;
};

export async function exchangeAuthorizationCode(input: {
  provider: OAuthProvider;
  config: OAuthProviderConfig;
  code: string;
  verifier: string;
  redirectUri: string;
}): Promise<OAuthProfile> {
  const tokenParameters = new URLSearchParams({
    client_id: input.config.clientId,
    client_secret: input.config.clientSecret,
    code: input.code,
    grant_type: "authorization_code",
    redirect_uri: input.redirectUri,
  });
  if (input.config.usesPkce) {
    tokenParameters.set("code_verifier", input.verifier);
  }
  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(input.config.tokenEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParameters,
    });
  } catch {
    throw new OAuthFlowError("token_exchange");
  }
  if (!tokenResponse.ok) {
    throw new OAuthFlowError(
      "token_exchange",
      tokenResponse.status,
      await safeProviderErrorCode(tokenResponse),
    );
  }
  let token: TokenResponse;
  try {
    token = (await tokenResponse.json()) as TokenResponse;
  } catch {
    throw new OAuthFlowError("token_response", tokenResponse.status);
  }
  if (!token.access_token || token.error) {
    throw new OAuthFlowError(
      "token_response",
      tokenResponse.status,
      safeProviderCode(token.error),
    );
  }

  if (input.provider === "github") {
    return fetchGitHubProfile(input.config, token.access_token);
  }
  return fetchOpenIdProfile(input.provider, input.config, token.access_token);
}

async function fetchOpenIdProfile(
  provider: "google" | "linkedin",
  config: OAuthProviderConfig,
  accessToken: string,
): Promise<OAuthProfile> {
  let response: Response;
  try {
    response = await fetch(config.userInfoEndpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    throw new OAuthFlowError("profile_fetch");
  }
  if (!response.ok) {
    throw new OAuthFlowError(
      "profile_fetch",
      response.status,
      await safeProviderErrorCode(response),
    );
  }
  let profile: {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    given_name?: string;
    picture?: string;
  };
  try {
    profile = (await response.json()) as typeof profile;
  } catch {
    throw new OAuthFlowError("profile_response", response.status);
  }
  if (!profile.sub) throw new OAuthFlowError("profile_response");
  const email =
    profile.email && profile.email_verified !== false ? profile.email : null;
  return {
    provider,
    providerUserId: profile.sub,
    email,
    displayName:
      profile.name?.trim() ||
      profile.given_name?.trim() ||
      email ||
      `${provider} user`,
    avatarUrl: safeHttpsUrl(profile.picture),
    providerUsername: null,
    providerProfileUrl: null,
  };
}

async function fetchGitHubProfile(
  config: OAuthProviderConfig,
  accessToken: string,
): Promise<OAuthProfile> {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${accessToken}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "InterviewThread",
  };
  let response: Response;
  try {
    response = await fetch(config.userInfoEndpoint, { headers });
  } catch {
    throw new OAuthFlowError("profile_fetch");
  }
  if (!response.ok) {
    throw new OAuthFlowError(
      "profile_fetch",
      response.status,
      await safeProviderErrorCode(response),
    );
  }
  let profile: {
    id?: number;
    login?: string;
    name?: string;
    email?: string;
    avatar_url?: string;
    html_url?: string;
  };
  try {
    profile = (await response.json()) as typeof profile;
  } catch {
    throw new OAuthFlowError("profile_response", response.status);
  }
  if (typeof profile.id !== "number") {
    throw new OAuthFlowError("profile_response");
  }

  let email = profile.email?.trim() || null;
  if (!email) {
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers,
    });
    if (emailsResponse.ok) {
      const emails = (await emailsResponse.json()) as Array<{
        email?: string;
        primary?: boolean;
        verified?: boolean;
      }>;
      email =
        emails.find((candidate) => candidate.primary && candidate.verified)
          ?.email ||
        emails.find((candidate) => candidate.verified)?.email ||
        null;
    }
  }

  return {
    provider: "github",
    providerUserId: String(profile.id),
    email,
    displayName:
      profile.name?.trim() || profile.login?.trim() || email || "GitHub user",
    avatarUrl: safeHttpsUrl(profile.avatar_url),
    providerUsername: profile.login?.trim() || null,
    providerProfileUrl: safeHttpsUrl(profile.html_url),
  };
}

function safeHttpsUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

const SAFE_PROVIDER_CODES = new Set([
  "invalid_client",
  "invalid_grant",
  "invalid_scope",
  "unauthorized_scope_error",
  "insufficient_scope",
  "temporarily_unavailable",
]);

function safeProviderCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  return SAFE_PROVIDER_CODES.has(normalized) ? normalized : undefined;
}

async function safeProviderErrorCode(response: Response) {
  try {
    const payload = (await response.clone().json()) as {
      error?: unknown;
      code?: unknown;
    };
    return safeProviderCode(payload.error) || safeProviderCode(payload.code);
  } catch {
    return undefined;
  }
}
