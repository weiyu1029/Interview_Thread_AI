import assert from "node:assert/strict";
import test from "node:test";

import {
  fetchJobSourceSnapshot,
  parseJobSourceReference,
} from "../app/job-source-gateway.ts";

function leverJob(id) {
  return {
    id,
    text: `Role ${id}`,
    descriptionPlain: `Description for ${id}`,
    hostedUrl: `https://jobs.lever.co/example/${id}`,
    applyUrl: `https://jobs.lever.co/example/${id}/apply`,
    categories: {
      location: "Remote - United States",
      department: "Engineering",
    },
    workplaceType: "remote",
  };
}

test("Lever snapshots paginate until the first short page and remain complete", async (t) => {
  const originalFetch = globalThis.fetch;
  const requestedSkips = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    const skip = Number(url.searchParams.get("skip"));
    requestedSkips.push(skip);
    const count = skip === 0 ? 100 : 25;
    return Response.json(
      Array.from({ length: count }, (_, index) => leverJob(`job-${skip + index}`)),
    );
  };

  const snapshot = await fetchJobSourceSnapshot("lever", "example");

  assert.deepEqual(requestedSkips, [0, 100]);
  assert.equal(snapshot.jobs.length, 125);
  assert.equal(snapshot.completeSnapshot, true);
  assert.equal(new Set(snapshot.jobs.map((job) => job.id)).size, 125);
});

test("Lever millisecond timestamps become valid ISO dates", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () => Response.json([{
    ...leverJob("dated"),
    createdAt: 1_725_000_000_000,
  }]);

  const snapshot = await fetchJobSourceSnapshot("lever", "example");
  assert.equal(snapshot.jobs[0].publishedAt, new Date(1_725_000_000_000).toISOString());
  assert.equal(Number.isNaN(Date.parse(snapshot.jobs[0].publishedAt)), false);
});

test("Lever snapshots stop safely at 500 jobs and explicitly report incompleteness", async (t) => {
  const originalFetch = globalThis.fetch;
  const requestedSkips = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    const skip = Number(url.searchParams.get("skip"));
    requestedSkips.push(skip);
    return Response.json(
      Array.from({ length: 100 }, (_, index) => leverJob(`job-${skip + index}`)),
    );
  };

  const snapshot = await fetchJobSourceSnapshot("lever", "example");

  assert.deepEqual(requestedSkips, [0, 100, 200, 300, 400]);
  assert.equal(snapshot.jobs.length, 500);
  assert.equal(snapshot.completeSnapshot, false);
});

test("approved-source references use exact HTTPS host allowlists", async (t) => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return Response.json({});
  };

  assert.equal(
    parseJobSourceReference(
      "greenhouse",
      "https://job-boards.greenhouse.io/interviewthread/jobs/123",
    ),
    "interviewthread",
  );
  assert.equal(
    parseJobSourceReference("lever", "https://jobs.lever.co/interviewthread/123"),
    "interviewthread",
  );
  assert.equal(
    parseJobSourceReference("ashby", "https://jobs.ashbyhq.com/interviewthread/123"),
    "interviewthread",
  );

  await assert.rejects(
    fetchJobSourceSnapshot(
      "greenhouse",
      "https://boards.greenhouse.io.attacker.example/interviewthread",
    ),
    /source_host_unapproved/,
  );
  await assert.rejects(
    fetchJobSourceSnapshot(
      "lever-eu",
      "https://jobs.lever.co/interviewthread",
    ),
    /source_host_unapproved/,
  );
  await assert.rejects(
    fetchJobSourceSnapshot(
      "ashby",
      "http://jobs.ashbyhq.com/interviewthread",
    ),
    /source_reference_invalid/,
  );
  assert.equal(fetchCalls, 0, "unapproved references must fail before network access");
});

test("provider selection rejects inherited object-property names", async () => {
  await assert.rejects(
    fetchJobSourceSnapshot("toString", "example"),
    /source_provider_invalid/,
  );
  await assert.rejects(
    fetchJobSourceSnapshot("__proto__", "example"),
    /source_provider_invalid/,
  );
});

test("the gateway enforces the actual response-body limit without Content-Length", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () => new Response(new Uint8Array(5_000_001), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

  await assert.rejects(
    fetchJobSourceSnapshot("lever", "example"),
    /provider_response_too_large/,
  );
});
