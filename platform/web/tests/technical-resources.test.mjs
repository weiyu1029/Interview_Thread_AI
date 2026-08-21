import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  TECHNICAL_RESOURCES,
  TECHNICAL_RESOURCE_TAGS,
  technicalResourcesForPersona,
} from "../app/technical-resources.ts";

const PERSONA_RESOURCE_TAGS = {
  hr: ["behavioral"],
  recruiter: ["behavioral"],
  "hiring-manager": ["behavioral"],
  "functional-lead": ["behavioral"],
  technical: ["coding", "data-sql", "frontend"],
  "system-design": ["system-design", "ml-ai", "security"],
  portfolio: ["frontend", "behavioral"],
  coo: ["behavioral", "system-design"],
  ceo: ["behavioral"],
  peer: ["behavioral"],
  "cross-functional": ["behavioral"],
  customer: ["behavioral"],
  values: ["behavioral"],
  case: ["data-sql", "behavioral"],
  panel: ["behavioral", "coding", "system-design"],
};

const REQUIRED_TECHNICAL_DOMAINS = [
  "coding",
  "system-design",
  "frontend",
  "backend",
  "data-sql",
  "data-science",
  "ml-ai",
  "security",
  "devops-cloud",
  "mobile",
  "qa-testing",
];

const ACCESS_LEVELS = new Set(["free", "freemium", "mixed", "paid"]);
const RESOURCE_FORMATS = new Set([
  "challenge",
  "community",
  "course",
  "guide",
  "handbook",
  "lab",
  "platform",
  "practice",
  "reference",
  "repository",
]);
const PROVIDER_TYPES = new Set(["official", "community"]);

function normalizedUrl(href) {
  const parsed = new URL(href);
  parsed.hash = "";
  parsed.searchParams.delete("utm_campaign");
  parsed.searchParams.delete("utm_content");
  parsed.searchParams.delete("utm_medium");
  parsed.searchParams.delete("utm_source");
  parsed.searchParams.delete("utm_term");
  return parsed.toString().replace(/\/$/, "");
}

test("bundles a broad, uniquely addressable Technical Round resource library", () => {
  assert.ok(
    TECHNICAL_RESOURCES.length >= 24,
    `expected at least 24 reviewed resources, received ${TECHNICAL_RESOURCES.length}`,
  );
  assert.ok(
    TECHNICAL_RESOURCE_TAGS.length >= 10,
    "the resource taxonomy should cover more than the original seven categories",
  );
  assert.equal(
    new Set(TECHNICAL_RESOURCE_TAGS).size,
    TECHNICAL_RESOURCE_TAGS.length,
    "resource tags must be unique",
  );

  for (const tag of REQUIRED_TECHNICAL_DOMAINS) {
    assert.ok(
      TECHNICAL_RESOURCE_TAGS.includes(tag),
      `missing technical domain: ${tag}`,
    );
    assert.ok(
      TECHNICAL_RESOURCES.some((resource) => resource.tags.includes(tag)),
      `${tag} has no practice resource`,
    );
  }

  const ids = new Set();
  const urls = new Set();
  for (const resource of TECHNICAL_RESOURCES) {
    assert.match(
      resource.id,
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      `${resource.name} needs a stable slug id`,
    );
    assert.ok(!ids.has(resource.id), `duplicate resource id: ${resource.id}`);
    ids.add(resource.id);

    const parsed = new URL(resource.href);
    assert.equal(parsed.protocol, "https:", `${resource.id} must use HTTPS`);
    assert.ok(parsed.hostname, `${resource.id} needs a valid hostname`);
    assert.notEqual(parsed.hostname, "localhost", resource.id);
    assert.notEqual(parsed.hostname, "127.0.0.1", resource.id);
    assert.ok(
      ![...parsed.searchParams.keys()].some((key) => key.startsWith("utm_")),
      `${resource.id} must not ship tracking parameters`,
    );
    const urlKey = normalizedUrl(resource.href);
    assert.ok(!urls.has(urlKey), `duplicate resource URL: ${resource.href}`);
    urls.add(urlKey);

    assert.ok(resource.name.trim(), `${resource.id} needs a name`);
    assert.ok(
      resource.name.length <= 64 && !/(?:\.\.\.|…)/.test(resource.name),
      `${resource.id} needs a complete, responsive-safe display name`,
    );
    assert.ok(resource.bestFor.trim(), `${resource.id} needs a best-for summary`);
    assert.ok(
      resource.sourceNote.trim(),
      `${resource.id} needs a provenance note`,
    );
    assert.ok(
      Array.isArray(resource.tags) && resource.tags.length > 0,
      `${resource.id} needs at least one category`,
    );
    assert.ok(
      resource.tags.every((tag) => TECHNICAL_RESOURCE_TAGS.includes(tag)),
      `${resource.id} uses an undeclared category`,
    );
    assert.ok(
      ACCESS_LEVELS.has(resource.access),
      `${resource.id} has an unstable access value: ${resource.access}`,
    );
    assert.ok(
      RESOURCE_FORMATS.has(resource.format),
      `${resource.id} has an unstable format value: ${resource.format}`,
    );
    assert.ok(
      PROVIDER_TYPES.has(resource.provider),
      `${resource.id} has an unstable provider value: ${resource.provider}`,
    );
    assert.equal(
      typeof resource.license,
      "string",
      `${resource.id} must explicitly declare a license or an empty value`,
    );
    if (resource.provider === "community")
      assert.ok(
        resource.license.trim(),
        `${resource.id} is community-maintained and needs an explicit license`,
      );
  }
});

test("returns five deterministic, tag-relevant resources for every interviewer persona", () => {
  const before = JSON.stringify(TECHNICAL_RESOURCES);

  for (const [persona, tags] of Object.entries(PERSONA_RESOURCE_TAGS)) {
    const recommended = technicalResourcesForPersona(tags, 5);
    const repeated = technicalResourcesForPersona(tags, 5);

    assert.equal(
      recommended.length,
      5,
      `${persona} should receive five useful Technical Round resources`,
    );
    assert.equal(
      new Set(recommended.map((resource) => resource.id)).size,
      recommended.length,
      `${persona} recommendations contain duplicates`,
    );
    assert.deepEqual(
      repeated.map((resource) => resource.id),
      recommended.map((resource) => resource.id),
      `${persona} recommendations are not deterministic`,
    );
    assert.ok(
      recommended.every((resource) =>
        resource.tags.some((tag) => tags.includes(tag)),
      ),
      `${persona} received a resource unrelated to its configured tags`,
    );
  }

  assert.equal(
    JSON.stringify(TECHNICAL_RESOURCES),
    before,
    "recommendation must not mutate the resource library",
  );
});

test("honors limits and ranks stronger tag overlap before a one-tag match", () => {
  const requestedTags = ["coding", "system-design", "security"];
  const recommended = technicalResourcesForPersona(requestedTags, 8);

  assert.ok(recommended.length > 0);
  assert.ok(recommended.length <= 8);

  const overlap = recommended.map(
    (resource) =>
      resource.tags.filter((tag) => requestedTags.includes(tag)).length,
  );
  assert.deepEqual(
    overlap,
    [...overlap].sort((left, right) => right - left),
    "resources with stronger persona overlap should rank first",
  );
  assert.deepEqual(technicalResourcesForPersona(requestedTags, 0), []);
});

test("Technical Round cards do not reuse the global job-demand action", () => {
  const pageSource = readFileSync(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const sectionStart = pageSource.indexOf(
    'className={`technical-round-library',
  );
  const sectionEnd = pageSource.indexOf(
    'className="interview-stage"',
    sectionStart,
  );

  assert.ok(sectionStart >= 0, "Technical Round library section is missing");
  assert.ok(sectionEnd > sectionStart, "Technical Round section boundary changed");

  const sectionSource = pageSource.slice(sectionStart, sectionEnd);
  assert.doesNotMatch(
    sectionSource,
    /detail\.explore|global (?:hiring )?demand|全球(?:招聘|招募)需求/i,
    "practice resources must not use a job-market exploration action",
  );
  assert.match(
    sectionSource,
    /resourceAction|practice resource/i,
    "resource cards need a dedicated practice-resource action",
  );
});
