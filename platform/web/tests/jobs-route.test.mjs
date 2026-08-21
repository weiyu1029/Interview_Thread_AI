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

test("Workable public careers pages are normalized without private credentials", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async (input) => {
    calls.push(String(input));
    return Response.json({
      name: "Example Labs",
      jobs: [
        {
          shortcode: "A1",
          title: "Data Analyst",
          country: "United States",
          city: "Chicago",
          department: "Analytics",
          telecommuting: true,
          workplace_type: "remote",
          published_on: "2026-08-20",
          application_url: "https://apply.workable.com/example-labs/j/A1/",
          url: "https://apply.workable.com/example-labs/j/A1/apply/",
          description: "Use SQL to improve product decisions.",
          employment_type: "full_time",
        },
      ],
    });
  };

  const response = await GET(
    new Request(
      "https://interviewthread.example/api/jobs?provider=workable&reference=https%3A%2F%2Fapply.workable.com%2Fexample-labs",
    ),
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.match(calls[0], /www\.workable\.com\/api\/accounts\/example-labs\?details=true/);
  assert.equal(payload.source.employer, "Example Labs");
  assert.equal(payload.jobs[0].employmentType, "Full-time");
  assert.equal(payload.jobs[0].workStyle, "Remote");
  assert.equal(payload.source.isComplete, true);
});

test("Recruitee careers-site offers are normalized from the official public feed", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async (input) => {
    calls.push(String(input));
    return Response.json({
      offers: [
        {
          id: 7,
          title: "Customer Success Manager",
          department: "Customer Success",
          locations: [
            { name: "Amsterdam", city: "Amsterdam", country: "Netherlands" },
          ],
          remote: false,
          hybrid: true,
          description: "Lead customer onboarding and retention.",
          careers_url: "https://example.recruitee.com/o/customer-success-manager",
          careers_apply_url: "https://example.recruitee.com/o/customer-success-manager/c/new",
          published_at: "2026-08-20T09:00:00Z",
          employment_type_code: "fulltime",
        },
      ],
    });
  };

  const response = await GET(
    new Request(
      "https://interviewthread.example/api/jobs?provider=recruitee&reference=https%3A%2F%2Fexample.recruitee.com%2Fo%2Fcustomer-success-manager",
    ),
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(calls[0], "https://example.recruitee.com/api/offers/");
  assert.equal(payload.jobs[0].country, "Netherlands");
  assert.equal(payload.jobs[0].workStyle, "Hybrid");
  assert.equal(payload.jobs[0].employmentType, "Full-time");
  assert.match(payload.jobs[0].applyUrl, /\/c\/new$/);
});
