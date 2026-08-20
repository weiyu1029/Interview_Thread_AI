import type { OAuthProvider, OAuthProviderConfig } from "./oauth-providers";

type TokenResponse = {
  access_token?: string;
  error?: string;
};

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
  const tokenResponse = await fetch(input.config.tokenEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: input.config.clientId,
      client_secret: input.config.clientSecret,
      code: input.code,
      code_verifier: input.verifier,
      grant_type: "authorization_code",
      redirect_uri: input.redirectUri,
    }),
  });
  if (!tokenResponse.ok) throw new Error("OAuth token exchange failed.");
  const token = (await tokenResponse.json()) as TokenResponse;
  if (!token.access_token || token.error) {
    throw new Error("OAuth provider did not return an access token.");
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
  const response = await fetch(config.userInfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("OAuth profile request failed.");
  const profile = (await response.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    given_name?: string;
    picture?: string;
  };
  if (!profile.sub) throw new Error("OAuth profile is missing a stable ID.");
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
  const response = await fetch(config.userInfoEndpoint, { headers });
  if (!response.ok) throw new Error("GitHub profile request failed.");
  const profile = (await response.json()) as {
    id?: number;
    login?: string;
    name?: string;
    email?: string;
    avatar_url?: string;
    html_url?: string;
  };
  if (typeof profile.id !== "number") {
    throw new Error("GitHub profile is missing a stable ID.");
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
