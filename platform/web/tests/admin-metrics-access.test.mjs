import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { isAdminEmail } from "../app/admin-access.ts";

test("admin access uses an exact, case-insensitive email allowlist", () => {
  const configured = "contact@interviewthreadai.com, Owner@Example.com";

  assert.equal(isAdminEmail("contact@interviewthreadai.com", configured), true);
  assert.equal(isAdminEmail("owner@example.com", configured), true);
  assert.equal(isAdminEmail("OWNER@EXAMPLE.COM", configured), true);
  assert.equal(isAdminEmail("attacker@example.com", configured), false);
  assert.equal(isAdminEmail(null, configured), false);
});

test("admin access does not support wildcards or partial domain matches", () => {
  assert.equal(isAdminEmail("owner@example.com", "*@example.com"), false);
  assert.equal(
    isAdminEmail("owner@interviewthreadai.com.evil.test", "@interviewthreadai.com"),
    false,
  );
  assert.equal(isAdminEmail("owner@example.com", ""), false);
});

test("operator dashboard explicitly excludes career content and personal identifiers", async () => {
  const page = await readFile(
    new URL("../app/[locale]/admin/page.tsx", import.meta.url),
    "utf8",
  );
  const route = await readFile(
    new URL("../app/api/admin/metrics/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(page, /Aggregate only/i);
  assert.match(page, /never displays resumes, job descriptions/i);
  assert.match(page, /IP addresses/i);
  assert.match(route, /private, no-store/i);
  assert.match(route, /isAdminEmail/);
  assert.doesNotMatch(route, /message|avatar|displayName|providerProfile/i);
});

