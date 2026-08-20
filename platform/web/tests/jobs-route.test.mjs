import assert from "node:assert/strict";
import test from "node:test";

import { GET } from "../app/api/jobs/route.ts";

test("large Greenhouse boards fall back to the official lightweight listing", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (input) => {
    calls.push(String(input));
    if (calls.length === 1) {
      return new Response("{}", {
        status: 200,
        headers: {
          "content-length": "5000001",
          "content-type": "application/json",
        },
      });
    }
    return Response.json({
      jobs: [
        {
          id: 42,
          title: "Product Analyst",
          absolute_url: "https://boards.greenhouse.io/example/jobs/42",
          updated_at: "2026-08-20T00:00:00Z",
          location: { name: "Remote - United States" },
          departments: [{ name: "Data" }],
        },
      ],
    });
  };

  const response = await GET(
    new Request(
      "https://interviewthread.example/api/jobs?provider=greenhouse&reference=example",
    ),
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(calls.length, 2);
  assert.match(calls[0], /content=true/);
  assert.doesNotMatch(calls[1], /content=true/);
  assert.equal(payload.count, 1);
  assert.equal(payload.jobs[0].title, "Product Analyst");
  assert.match(payload.source.detailCoverage, /descriptions were omitted/i);
});

test("the approved-source gateway rejects unapproved hosts before fetching", async (t) => {
  const originalFetch = globalThis.fetch;
  let fetched = false;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () => {
    fetched = true;
    return Response.json({});
  };

  const response = await GET(
    new Request(
      "https://interviewthread.example/api/jobs?provider=greenhouse&reference=https%3A%2F%2Fexample.com%2Fjobs",
    ),
  );
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(fetched, false);
  assert.match(payload.error, /not an official Greenhouse/i);
});
