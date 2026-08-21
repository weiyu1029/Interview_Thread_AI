import assert from "node:assert/strict";
import test from "node:test";

import {
  filterAndRankJobs,
  JOB_SEARCH_INDUSTRIES,
  jobSearchCapabilities,
  tokenizeJobQuery,
} from "../app/job-search.ts";
import {
  allCountriesLabelFor,
  JOB_SEARCH_COPY_BY_LOCALE,
  JOB_SEARCH_COPY_KEYS,
  jobIndustryLabelFor,
} from "../app/job-search-copy.ts";

const NOW = "2026-08-21T12:00:00.000Z";

const JOBS = [
  {
    id: "senior-risk",
    title: "Senior Data Analyst",
    company: "Signal Bank",
    description: "Build SQL risk models and explain decisions to executives.",
    department: "Analytics",
    region: "North America",
    country: "United States",
    city: "New York",
    workStyle: "Remote",
    industry: "Financial services",
    employmentType: "Full-time",
    seniority: "Senior",
    salaryMin: 120_000,
    publishedAt: "2026-08-19T12:00:00.000Z",
    storyFit: 92,
    isLive: true,
  },
  {
    id: "health-ops",
    title: "Operations Analyst",
    company: "Atlas Health",
    description: "Improve patient operations and build Tableau dashboards.",
    department: "Business Operations",
    region: "North America",
    country: "United States",
    city: "Chicago",
    workStyle: "Hybrid",
    industry: "Healthcare",
    employmentType: "Contract",
    seniority: "Mid-level",
    salaryMin: 85_000,
    publishedAt: "2026-07-01T12:00:00.000Z",
    storyFit: 74,
    isLive: true,
  },
  {
    id: "example-product",
    title: "Product Analyst",
    company: "Example Commerce",
    description: "Use SQL and experimentation to improve product decisions.",
    department: "Product",
    region: "North America",
    country: "United States",
    city: "Austin",
    workStyle: "On-site",
    industry: "Consumer",
    employmentType: "Full-time",
    seniority: "Entry-level",
    salaryMin: 70_000,
    storyFit: 88,
    isLive: false,
  },
];

test("offers an explicit, broad, non-duplicated industry catalog", () => {
  assert.equal(JOB_SEARCH_INDUSTRIES[0], "All industries");
  assert.ok(
    JOB_SEARCH_INDUSTRIES.length >= 12,
    "job search should cover more than the original six broad industries",
  );
  assert.equal(
    new Set(JOB_SEARCH_INDUSTRIES).size,
    JOB_SEARCH_INDUSTRIES.length,
  );
});

test("ships complete job-search controls and taxonomy labels for all 40 locales", () => {
  assert.equal(Object.keys(JOB_SEARCH_COPY_BY_LOCALE).length, 40);
  Object.entries(JOB_SEARCH_COPY_BY_LOCALE).forEach(([locale, labels]) => {
    JOB_SEARCH_COPY_KEYS.forEach((key) => {
      assert.ok(String(labels[key]).trim(), `${locale}.${key} must not be empty`);
    });
    assert.ok(allCountriesLabelFor(locale).trim());
    JOB_SEARCH_INDUSTRIES.forEach((industry) => {
      assert.ok(jobIndustryLabelFor(locale, industry).trim());
    });
  });
  assert.equal(allCountriesLabelFor("zh-TW"), "所有國家與地區");
  assert.equal(jobIndustryLabelFor("ja", "Education"), "教育");
});

test("normalizes punctuation and searches tokens across title, description, and department", () => {
  assert.deepEqual(tokenizeJobQuery("  Senior, SQL / Analytics!  "), [
    "senior",
    "sql",
    "analytics",
  ]);

  const results = filterAndRankJobs(JOBS, {
    roleQuery: "senior sql analytics",
    now: NOW,
  });

  assert.deepEqual(results.map((job) => job.id), ["senior-risk"]);
  assert.deepEqual(
    filterAndRankJobs(JOBS, { roleQuery: "signal bank", now: NOW }).map(
      (job) => job.id,
    ),
    ["senior-risk"],
  );
});

test("ranks a title match ahead of a description-only match", () => {
  const results = filterAndRankJobs(
    [
      {
        ...JOBS[0],
        id: "title-match",
        title: "Product Analyst",
        description: "Own reporting and stakeholder communication.",
        storyFit: 80,
      },
      {
        ...JOBS[0],
        id: "description-match",
        title: "Business Analyst",
        description: "Partner closely with a product analyst on reporting.",
        storyFit: 95,
      },
    ],
    { roleQuery: "product analyst", now: NOW },
  );

  assert.deepEqual(results.map((job) => job.id), [
    "title-match",
    "description-match",
  ]);
});

test("applies supported metadata filters and a real date-posted boundary", () => {
  const results = filterAndRankJobs(JOBS, {
    country: "United States",
    workStyle: "Remote",
    industry: "Financial services",
    employmentType: "Full-time",
    seniority: "Senior",
    postedWithinDays: 7,
    minSalary: 100_000,
    now: NOW,
  });

  assert.deepEqual(results.map((job) => job.id), ["senior-risk"]);
});

test("does not claim radius filtering when listings have no coordinates", () => {
  const withoutCoordinates = jobSearchCapabilities(JOBS);
  assert.equal(withoutCoordinates.radius, false);

  const withCoordinates = jobSearchCapabilities([
    ...JOBS,
    { ...JOBS[0], id: "geo-job", latitude: 40.7128, longitude: -74.006 },
  ]);
  assert.equal(withCoordinates.radius, true);
});

test("derives region from canonical country when a provider only says Worldwide", () => {
  const results = filterAndRankJobs(
    [{ ...JOBS[0], region: "Worldwide" }],
    { region: "North America", now: NOW },
  );

  assert.deepEqual(results.map((job) => job.id), ["senior-risk"]);
});

test("only exposes filters backed by listing metadata", () => {
  const capabilities = jobSearchCapabilities(JOBS);
  assert.equal(capabilities.employmentType, true);
  assert.equal(capabilities.seniority, true);
  assert.equal(capabilities.datePosted, true);
  assert.equal(capabilities.salary, true);

  const sparse = jobSearchCapabilities(
    JOBS.map((job) => {
      const sparseJob = { ...job };
      delete sparseJob.employmentType;
      delete sparseJob.seniority;
      delete sparseJob.salaryMin;
      delete sparseJob.publishedAt;
      return sparseJob;
    }),
  );
  assert.equal(sparse.employmentType, false);
  assert.equal(sparse.seniority, false);
  assert.equal(sparse.datePosted, false);
  assert.equal(sparse.salary, false);
});

test("keeps unknown optional metadata visible until a user selects that filter", () => {
  const unknownMetadata = {
    ...JOBS[0],
    id: "unknown-metadata",
    employmentType: undefined,
    seniority: undefined,
    salaryMin: undefined,
    publishedAt: undefined,
  };

  assert.deepEqual(
    filterAndRankJobs([unknownMetadata], { now: NOW }).map((job) => job.id),
    ["unknown-metadata"],
  );
  assert.deepEqual(
    filterAndRankJobs([unknownMetadata], {
      employmentType: "Full-time",
      now: NOW,
    }),
    [],
  );
});

test("can exclude examples from live results and keeps story-fit ordering", () => {
  const liveResults = filterAndRankJobs(JOBS, {
    sourceKind: "live",
    now: NOW,
  });

  assert.deepEqual(liveResults.map((job) => job.id), [
    "senior-risk",
    "health-ops",
  ]);
  assert.ok(liveResults.every((job) => job.isLive));
  assert.ok(liveResults[0].storyFit >= liveResults[1].storyFit);
});

test("deduplicates canonical application URLs and retains the richer newer record", () => {
  const results = filterAndRankJobs(
    [
      {
        ...JOBS[0],
        id: "older-thin-copy",
        description: "SQL role.",
        source: "Greenhouse",
        sourceUrl: "https://boards.example/jobs/42?gh_src=campaign",
        applyUrl: "https://boards.example/jobs/42?gh_src=campaign",
        publishedAt: "2026-08-18T12:00:00.000Z",
      },
      {
        ...JOBS[0],
        id: "newer-rich-copy",
        description:
          "Build SQL risk models, validate the outputs, and present recommendations to executives.",
        source: "Ashby",
        sourceUrl: "https://boards.example/jobs/42",
        applyUrl: "https://boards.example/jobs/42",
        publishedAt: "2026-08-20T12:00:00.000Z",
      },
    ],
    { now: NOW },
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].id, "newer-rich-copy");
  assert.equal(results[0].source, "Ashby");
});

test("uses deterministic evidence tie-breakers after story fit", () => {
  const results = filterAndRankJobs(
    [
      {
        ...JOBS[0],
        id: "more-required-gaps",
        storyFit: 90,
        requiredGapCount: 2,
        proofCount: 4,
      },
      {
        ...JOBS[0],
        id: "fewer-proofs",
        storyFit: 90,
        requiredGapCount: 0,
        proofCount: 2,
        publishedAt: "2026-08-19T12:00:00.000Z",
      },
      {
        ...JOBS[0],
        id: "more-proofs",
        storyFit: 90,
        requiredGapCount: 0,
        proofCount: 3,
        publishedAt: "2026-08-18T12:00:00.000Z",
      },
    ],
    { now: NOW },
  );

  assert.deepEqual(results.map((job) => job.id), [
    "more-proofs",
    "fewer-proofs",
    "more-required-gaps",
  ]);
});

test("does not present a description-free listing as an evidence-ranked match", () => {
  const results = filterAndRankJobs(
    [{ ...JOBS[0], id: "thin-listing", description: "", storyFit: 99 }],
    { requireEvidenceDescription: true, now: NOW },
  );

  assert.deepEqual(results, []);
});

test("returns no matches rather than silently weakening active filters", () => {
  const results = filterAndRankJobs(JOBS, {
    roleQuery: "staff machine learning platform",
    workStyle: "Remote",
    industry: "Healthcare",
    now: NOW,
  });

  assert.deepEqual(results, []);
});
