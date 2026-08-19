import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("https://careerproof.example/", { headers: { accept: "text/html", host: "careerproof.example" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the CareerProof product experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /CareerProof/);
  assert.match(html, /Evidence-first career intelligence/i);
  assert.match(html, /Keyword evidence matrix/i);
  assert.match(html, /Open source/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships product metadata and a social card", async () => {
  const [layout, page] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  await access(new URL("../public/og.png", import.meta.url));
  assert.match(layout, /openGraph/);
  assert.match(layout, /twitter/);
  assert.match(layout, /\/og\.png/);
  assert.match(page, /Ollama/);
  assert.match(page, /Hugging Face/);
  assert.doesNotMatch(page, /🎯|💬|📋|🧭|📊/u);
});
