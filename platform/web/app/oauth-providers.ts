export const OAUTH_PROVIDERS = ["google", "github", "linkedin"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

type AuthEnvironment = {
  AUTH_SECRET?: string;
  APP_BASE_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  LINKEDIN_CLIENT_ID?: string;
  LINKEDIN_CLIENT_SECRET?: string;
};

export type OAuthProviderConfig = {
  id: OAuthProvider;
  label: string;
  clientId: string;
  clientSecret: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  scope: string;
};

export function authEnvironment(): AuthEnvironment {
  return process.env as AuthEnvironment;
}

export function isOAuthProvider(value: string): value is OAuthProvider {
  return OAUTH_PROVIDERS.includes(value as OAuthProvider);
}

export function oauthProviderConfig(
  provider: OAuthProvider,
): OAuthProviderConfig | null {
  const runtime = authEnvironment();
  const common = providerMetadata[provider];
  const credentials = providerCredentials(provider, runtime);
  if (!credentials.clientId || !credentials.clientSecret) return null;
  return { ...common, ...credentials };
}

export function oauthReadiness(provider: OAuthProvider): boolean {
  const runtime = authEnvironment();
  return Boolean(
    runtime.AUTH_SECRET &&
      runtime.AUTH_SECRET.length >= 32 &&
      oauthProviderConfig(provider),
  );
}

export function authSecret(): string | null {
  const secret = authEnvironment().AUTH_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}

export function callbackUrl(request: Request, provider: OAuthProvider): string {
  const configuredOrigin = authEnvironment().APP_BASE_URL?.trim();
  const origin = configuredOrigin
    ? new URL(configuredOrigin).origin
    : new URL(request.url).origin;
  return `${origin}/api/auth/callback/${provider}`;
}

const providerMetadata = {
  google: {
    id: "google",
    label: "Google",
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    userInfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
    scope: "openid email profile",
  },
  github: {
    id: "github",
    label: "GitHub",
    authorizationEndpoint: "https://github.com/login/oauth/authorize",
    tokenEndpoint: "https://github.com/login/oauth/access_token",
    userInfoEndpoint: "https://api.github.com/user",
    scope: "read:user user:email",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    authorizationEndpoint: "https://www.linkedin.com/oauth/v2/authorization",
    tokenEndpoint: "https://www.linkedin.com/oauth/v2/accessToken",
    userInfoEndpoint: "https://api.linkedin.com/v2/userinfo",
    scope: "openid profile email",
  },
} satisfies Record<OAuthProvider, Omit<OAuthProviderConfig, "clientId" | "clientSecret">>;

function providerCredentials(
  provider: OAuthProvider,
  runtime: AuthEnvironment,
) {
  if (provider === "google") {
    return {
      clientId: runtime.GOOGLE_CLIENT_ID?.trim() || "",
      clientSecret: runtime.GOOGLE_CLIENT_SECRET?.trim() || "",
    };
  }
  if (provider === "github") {
    return {
      clientId: runtime.GITHUB_CLIENT_ID?.trim() || "",
      clientSecret: runtime.GITHUB_CLIENT_SECRET?.trim() || "",
    };
  }
  return {
    clientId: runtime.LINKEDIN_CLIENT_ID?.trim() || "",
    clientSecret: runtime.LINKEDIN_CLIENT_SECRET?.trim() || "",
  };
}
