import assert from "node:assert/strict";
import test from "node:test";
import { authCopyFor } from "../app/auth-copy.ts";
import { LANGUAGES, localeToPath } from "../app/i18n.ts";

const ERROR_REFERENCES = {
  token_invalid_client: "IT-AUTH-101",
  token_invalid_grant: "IT-AUTH-102",
  scope_denied: "IT-AUTH-103",
  token_exchange_failed: "IT-AUTH-104",
  profile_failed: "IT-AUTH-105",
  storage_failed: "IT-AUTH-106",
  invalid_state: "IT-AUTH-107",
  provider_cancelled: "IT-AUTH-108",
  missing_code: "IT-AUTH-109",
  provider_failed: "IT-AUTH-110",
};

let workerPromise;

async function renderAccount(locale, query) {
  workerPromise ||= import(
    new URL(
      `../dist/server/index.js?account-auth-errors=${process.pid}-${Date.now()}`,
      import.meta.url,
    ).href
  );
  const { default: worker } = await workerPromise;
  const path = `/${localeToPath(locale)}/account?${new URLSearchParams(query)}`;
  const response = await worker.fetch(
    new Request(`https://interviewthread.example${path}`, {
      headers: { accept: "text/html", host: "interviewthread.example" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200);
  return response.text();
}

function alertText(html) {
  const match = html.match(
    /<p class="account-auth-error" role="alert">([\s\S]*?)<\/p>/,
  );
  assert.ok(match, "account page should render a visible authentication alert");
  return match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

test("maps every supported OAuth failure to a provider and stable safe reference", async () => {
  for (const [error, reference] of Object.entries(ERROR_REFERENCES)) {
    const html = await renderAccount("en", {
      auth_error: error,
      provider: "linkedin",
    });
    const alert = alertText(html);
    assert.match(alert, /^LinkedIn\s*:/, error);
    assert.match(alert, /Sign-in could not be completed\. Please try again\./, error);
    assert.match(alert, new RegExp(`${reference}$`), error);
    assert.doesNotMatch(alert, new RegExp(error), error);
  }
});

test("preserves localized generic guidance in every supported locale", async () => {
  for (const [locale] of LANGUAGES) {
    const html = await renderAccount(locale, {
      auth_error: "profile_failed",
      provider: "google",
    });
    const alert = alertText(html);
    assert.match(alert, /^Google\s*:/, locale);
    assert.ok(alert.includes(authCopyFor(locale).signInFailed), locale);
    assert.match(alert, /IT-AUTH-105$/, locale);
  }
});

test("keeps setup and unknown failures actionable without reflecting raw input", async () => {
  const setupHtml = await renderAccount("zh-TW", {
    auth_error: "provider_not_configured",
    provider: "github",
  });
  const setupAlert = alertText(setupHtml);
  assert.match(setupAlert, /^GitHub\s*:/);
  assert.ok(setupAlert.includes(authCopyFor("zh-TW").setupNeeded));
  assert.match(setupAlert, /IT-AUTH-100$/);

  const unsafeError = "<script>provider details</script>";
  const unknownHtml = await renderAccount("en", {
    auth_error: unsafeError,
    provider: "untrusted-provider",
  });
  const unknownAlert = alertText(unknownHtml);
  assert.match(unknownAlert, /^Account\s*:/);
  assert.match(unknownAlert, /IT-AUTH-199$/);
  assert.doesNotMatch(unknownAlert, /script|provider details|untrusted-provider/i);
});
