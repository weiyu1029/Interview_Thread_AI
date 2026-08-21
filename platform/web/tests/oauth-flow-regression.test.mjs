import assert from "node:assert/strict";
import test from "node:test";
import { exchangeAuthorizationCode } from "../app/oauth-profile.ts";
import {
  callbackPath,
  oauthProviderConfig,
} from "../app/oauth-providers.ts";

const OAUTH_ENVIRONMENT = {
  AUTH_SECRET: "test-only-auth-secret-with-at-least-32-characters",
  APP_BASE_URL: "https://interviewthread.example",
  GOOGLE_CLIENT_ID: "google-client",
  GOOGLE_CLIENT_SECRET: "google-secret",
  GITHUB_CLIENT_ID: "github-client",
  GITHUB_CLIENT_SECRET: "github-secret",
  LINKEDIN_CLIENT_ID: "linkedin-client",
  LINKEDIN_CLIENT_SECRET: "linkedin-secret",
};

async function withOAuthEnvironment(run) {
  const previous = Object.fromEntries(
    Object.keys(OAUTH_ENVIRONMENT).map((name) => [name, process.env[name]]),
  );
  Object.assign(process.env, OAUTH_ENVIRONMENT);
  try {
    return await run();
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

async function requestBuiltApp(path) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("oauth-regression", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`https://interviewthread.example${path}`, {
      headers: { accept: "text/html", host: "interviewthread.example" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("keeps provider-specific scopes, callbacks, and PKCE policy", async () => {
  await withOAuthEnvironment(async () => {
    const cases = [
      {
        provider: "linkedin",
        origin: "https://www.linkedin.com",
        scope: "openid profile email",
        callback: "/auth/linkedin/callback",
        usesPkce: false,
      },
      {
        provider: "google",
        origin: "https://accounts.google.com",
        scope: "openid email profile",
        callback: "/api/auth/callback/google",
        usesPkce: true,
      },
      {
        provider: "github",
        origin: "https://github.com",
        scope: "read:user user:email",
        callback: "/api/auth/callback/github",
        usesPkce: true,
      },
    ];

    for (const expected of cases) {
      const config = oauthProviderConfig(expected.provider);
      assert.ok(config, `${expected.provider} should be configured`);
      assert.equal(config.scope, expected.scope);
      assert.equal(config.usesPkce, expected.usesPkce);
      assert.equal(callbackPath(expected.provider), expected.callback);

      const response = await requestBuiltApp(
        `/api/auth/start/${expected.provider}?locale=en&return_to=${encodeURIComponent("/en#workspace")}`,
      );
      assert.equal(response.status, 302, expected.provider);
      const authorizationUrl = new URL(response.headers.get("location"));
      assert.equal(authorizationUrl.origin, expected.origin);
      assert.equal(authorizationUrl.searchParams.get("client_id"), config.clientId);
      assert.equal(authorizationUrl.searchParams.get("scope"), expected.scope);
      assert.equal(
        authorizationUrl.searchParams.get("redirect_uri"),
        `https://interviewthread.example${expected.callback}`,
      );
      assert.equal(
        authorizationUrl.searchParams.has("code_challenge"),
        expected.usesPkce,
      );
      assert.equal(
        authorizationUrl.searchParams.has("code_challenge_method"),
        expected.usesPkce,
      );
      if (expected.usesPkce) {
        assert.equal(
          authorizationUrl.searchParams.get("code_challenge_method"),
          "S256",
        );
      }
    }
  });
});

test("omits LinkedIn verifier while preserving Google and GitHub token exchange", async () => {
  await withOAuthEnvironment(async () => {
    const originalFetch = globalThis.fetch;
    const tokenBodies = new Map();
    globalThis.fetch = async (url, init = {}) => {
      const requestUrl = String(url);
      if (init.method === "POST") {
        const body = new URLSearchParams(String(init.body));
        tokenBodies.set(requestUrl, body);
        return Response.json({ access_token: `token-${body.get("client_id")}` });
      }
      if (requestUrl === "https://api.github.com/user") {
        return Response.json({
          id: 42,
          login: "candidate",
          name: "Candidate",
          email: "candidate@example.com",
          avatar_url: "https://avatars.githubusercontent.com/u/42",
          html_url: "https://github.com/candidate",
        });
      }
      return Response.json({
        sub: requestUrl.includes("linkedin") ? "linkedin-user" : "google-user",
        name: "Candidate",
        email: "candidate@example.com",
        email_verified: true,
      });
    };

    try {
      for (const provider of ["linkedin", "google", "github"]) {
        const config = oauthProviderConfig(provider);
        assert.ok(config);
        await exchangeAuthorizationCode({
          provider,
          config,
          code: `${provider}-authorization-code`,
          verifier: `${provider}-verifier`,
          redirectUri: `https://interviewthread.example${callbackPath(provider)}`,
        });
      }

      const linkedInBody = tokenBodies.get(
        "https://www.linkedin.com/oauth/v2/accessToken",
      );
      assert.ok(linkedInBody);
      assert.equal(linkedInBody.get("client_secret"), "linkedin-secret");
      assert.equal(linkedInBody.has("code_verifier"), false);

      const googleBody = tokenBodies.get("https://oauth2.googleapis.com/token");
      assert.ok(googleBody);
      assert.equal(googleBody.get("code_verifier"), "google-verifier");
      assert.equal(
        googleBody.get("redirect_uri"),
        "https://interviewthread.example/api/auth/callback/google",
      );

      const githubBody = tokenBodies.get(
        "https://github.com/login/oauth/access_token",
      );
      assert.ok(githubBody);
      assert.equal(githubBody.get("code_verifier"), "github-verifier");
      assert.equal(
        githubBody.get("redirect_uri"),
        "https://interviewthread.example/api/auth/callback/github",
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
