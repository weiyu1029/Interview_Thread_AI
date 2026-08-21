import assert from "node:assert/strict";
import test from "node:test";
import { exchangeAuthorizationCode } from "../app/oauth-profile.ts";

function providerConfig(overrides = {}) {
  return {
    id: "linkedin",
    label: "LinkedIn",
    clientId: "linkedin-client",
    clientSecret: "linkedin-secret",
    authorizationEndpoint: "https://www.linkedin.com/oauth/v2/authorization",
    tokenEndpoint: "https://www.linkedin.com/oauth/v2/accessToken",
    userInfoEndpoint: "https://api.linkedin.com/v2/userinfo",
    scope: "openid profile email",
    usesPkce: false,
    ...overrides,
  };
}

test("uses LinkedIn's confidential web flow without native-app PKCE", async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, init = {}) => {
    requests.push({ url: String(url), init });
    if (String(url).includes("accessToken")) {
      return Response.json({ access_token: "test-access-token" });
    }
    return Response.json({
      sub: "linkedin-user-1",
      email: "candidate@example.com",
      email_verified: true,
      name: "Candidate",
    });
  };

  try {
    const profile = await exchangeAuthorizationCode({
      provider: "linkedin",
      config: providerConfig(),
      code: "authorization-code",
      verifier: "must-not-be-sent",
      redirectUri: "https://interviewthreadai.com/auth/linkedin/callback",
    });

    assert.equal(profile.providerUserId, "linkedin-user-1");
    assert.equal(requests.length, 2);
    const tokenBody = new URLSearchParams(String(requests[0].init.body));
    assert.equal(tokenBody.get("client_id"), "linkedin-client");
    assert.equal(tokenBody.get("client_secret"), "linkedin-secret");
    assert.equal(tokenBody.get("code"), "authorization-code");
    assert.equal(tokenBody.get("grant_type"), "authorization_code");
    assert.equal(
      tokenBody.get("redirect_uri"),
      "https://interviewthreadai.com/auth/linkedin/callback",
    );
    assert.equal(tokenBody.has("code_verifier"), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("retains PKCE for providers configured to use it", async () => {
  const originalFetch = globalThis.fetch;
  let tokenBody;
  globalThis.fetch = async (url, init = {}) => {
    if (!tokenBody) {
      tokenBody = new URLSearchParams(String(init.body));
      return Response.json({ access_token: "test-access-token" });
    }
    return Response.json({ sub: "google-user-1", name: "Candidate" });
  };

  try {
    await exchangeAuthorizationCode({
      provider: "google",
      config: providerConfig({
        id: "google",
        label: "Google",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
        userInfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
        scope: "openid email profile",
        usesPkce: true,
      }),
      code: "authorization-code",
      verifier: "google-pkce-verifier",
      redirectUri: "https://interviewthreadai.com/api/auth/callback/google",
    });
    assert.equal(tokenBody.get("code_verifier"), "google-pkce-verifier");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
