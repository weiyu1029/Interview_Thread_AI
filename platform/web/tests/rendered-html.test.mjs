import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("https://aptograph.example/", { headers: { accept: "text/html", host: "aptograph.example" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Aptograph product experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Aptograph/);
  assert.match(html, /Your evidence, mapped to what’s next/i);
  assert.match(html, /Keyword evidence matrix/i);
  assert.match(html, /Open source/i);
  assert.match(html, /Market Insights/i);
  assert.match(html, /US\$15 base/i);
  assert.match(html, /Enterprise/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships product metadata and a social card", async () => {
  const [layout, page, i18n] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n.ts", import.meta.url), "utf8"),
  ]);
  await access(new URL("../public/og.png", import.meta.url));
  assert.match(layout, /openGraph/);
  assert.match(layout, /twitter/);
  assert.match(layout, /\/og\.png/);
  assert.match(layout, /application\/ld\+json/);
  assert.match(page, /Ollama/);
  assert.match(page, /Hugging Face/);
  assert.match(page, /\/api\/jobs/);
  assert.match(page, /\/api\/region/);
  assert.match(page, /\/api\/feedback/);
  assert.match(page, /Feedback is open to every plan/i);
  assert.match(page, /Team · Priority/i);
  assert.match(page, /Enterprise · Highest priority/i);
  assert.match(page, /Connect an employer job board/i);
  assert.match(page, /Greenhouse/i);
  assert.match(page, /Lever EU/i);
  assert.match(page, /Ashby/i);
  assert.match(page, /No page scraping and no automatic application/i);
  assert.doesNotMatch(page, /🎯|💬|📋|🧭|📊/u);
  assert.equal(i18n.match(/\["[^"]+",\s*"[^"]+"\]/g)?.length, 40);
  assert.match(i18n, /RTL_LOCALES.*ar.*he.*ur.*fa/);
});
