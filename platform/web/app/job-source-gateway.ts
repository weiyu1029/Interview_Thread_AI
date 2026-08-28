import {
  enrichJobSearchMetadata,
  type JobSearchCandidate,
} from "./job-search.ts";

export type ApprovedJobProvider =
  | "greenhouse"
  | "lever"
  | "lever-eu"
  | "ashby";

export type ApprovedJobSource = {
  id: ApprovedJobProvider;
  name: string;
  docsUrl: string;
  access: string;
};

export type JobSourceSnapshot = {
  source: ApprovedJobSource & {
    account: string;
    employer: string;
    retrievedAt: string;
    coverage: string;
    detailCoverage: string;
  };
  jobs: JobSearchCandidate[];
  completeSnapshot: boolean;
};

export const APPROVED_JOB_SOURCES: Record<ApprovedJobProvider, ApprovedJobSource> = {
  greenhouse: {
    id: "greenhouse",
    name: "Greenhouse Job Board API",
    docsUrl: "https://developers.greenhouse.io/job-board.html",
    access: "Public GET API for employer-published jobs; no application submission.",
  },
  lever: {
    id: "lever",
    name: "Lever Postings API",
    docsUrl: "https://github.com/lever/postings-api",
    access: "Public Postings API for published jobs on Lever's global instance.",
  },
  "lever-eu": {
    id: "lever-eu",
    name: "Lever Postings API (EU)",
    docsUrl: "https://github.com/lever/postings-api",
    access: "Public Postings API for published jobs on Lever's EU instance.",
  },
  ashby: {
    id: "ashby",
    name: "Ashby Job Postings API",
    docsUrl: "https://developers.ashbyhq.com/docs/public-job-posting-api",
    access: "Public API for currently published and listed employer jobs.",
  },
};

const ACCOUNT_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,78}[A-Za-z0-9])?$/;
const MAX_RESPONSE_BYTES = 5_000_000;
const MAX_JOBS_PER_SOURCE = 500;
const LEVER_PAGE_SIZE = 100;

function cleanText(value: unknown): string {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function humanizeJobSourceAccount(account: string): string {
  return account
    .replace(/[-_.]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function safeHttpsUrl(value: unknown): string {
  const raw = cleanText(value);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function normalizedPublishedAt(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }
  const text = cleanText(value);
  if (!text) return "";
  if (/^\d{10,13}$/.test(text)) {
    const milliseconds = text.length === 10 ? Number(text) * 1_000 : Number(text);
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }
  const milliseconds = Date.parse(text);
  return Number.isNaN(milliseconds) ? "" : new Date(milliseconds).toISOString();
}

function countryName(value: unknown): string {
  const raw = cleanText(value);
  if (!raw) return "Unspecified";
  const names: Record<string, string> = {
    US: "United States", USA: "United States", GB: "United Kingdom",
    GBR: "United Kingdom", UK: "United Kingdom", CA: "Canada", CAN: "Canada",
    DE: "Germany", DEU: "Germany", FR: "France", FRA: "France",
    NL: "Netherlands", NLD: "Netherlands", ES: "Spain", ESP: "Spain",
    JP: "Japan", JPN: "Japan", KR: "South Korea", KOR: "South Korea",
    SG: "Singapore", SGP: "Singapore", TW: "Taiwan", TWN: "Taiwan",
    AU: "Australia", AUS: "Australia", IN: "India", IND: "India",
    BR: "Brazil", BRA: "Brazil", AR: "Argentina", ARG: "Argentina",
    CO: "Colombia", COL: "Colombia", MX: "Mexico", MEX: "Mexico",
    AE: "United Arab Emirates", ARE: "United Arab Emirates",
    SA: "Saudi Arabia", SAU: "Saudi Arabia", ZA: "South Africa",
    ZAF: "South Africa", KE: "Kenya", KEN: "Kenya",
  };
  return names[raw.toUpperCase()] || raw;
}

function inferCountry(location: string): string {
  const known = [
    "United States", "United Kingdom", "Canada", "Netherlands", "Spain",
    "Germany", "France", "Japan", "South Korea", "Singapore", "Taiwan",
    "Australia", "India", "Brazil", "Argentina", "Colombia", "Mexico",
    "United Arab Emirates", "Saudi Arabia", "South Africa", "Kenya",
  ];
  return known.find((item) => location.toLowerCase().includes(item.toLowerCase())) || "Unspecified";
}

function normalizeWorkStyle(value: unknown, fallback: string): string {
  const text = `${cleanText(value)} ${fallback}`.toLowerCase();
  if (text.includes("hybrid")) return "Hybrid";
  if (text.includes("remote")) return "Remote";
  if (text.includes("onsite") || text.includes("on-site") || text.includes("on site")) return "On-site";
  return "Unspecified";
}

export function parseJobSourceReference(
  provider: ApprovedJobProvider,
  rawReference: string,
): string {
  const reference = rawReference.trim();
  if (!reference) throw new Error("source_reference_required");
  if (ACCOUNT_PATTERN.test(reference)) return reference;

  let url: URL;
  try {
    url = new URL(reference);
  } catch {
    throw new Error("source_reference_invalid");
  }
  if (url.protocol !== "https:") throw new Error("source_reference_invalid");

  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);
  let account = "";
  if (provider === "greenhouse") {
    const allowed = new Set([
      "boards.greenhouse.io",
      "job-boards.greenhouse.io",
      "boards-api.greenhouse.io",
    ]);
    if (!allowed.has(host)) throw new Error("source_host_unapproved");
    account = host === "boards-api.greenhouse.io" ? parts[2] || "" : parts[0] || "";
  } else if (provider === "lever" || provider === "lever-eu") {
    const expected = provider === "lever"
      ? new Set(["jobs.lever.co", "api.lever.co"])
      : new Set(["jobs.eu.lever.co", "api.eu.lever.co"]);
    if (!expected.has(host)) throw new Error("source_host_unapproved");
    account = host.startsWith("api.") ? parts[2] || "" : parts[0] || "";
  } else {
    const allowed = new Set(["jobs.ashbyhq.com", "api.ashbyhq.com"]);
    if (!allowed.has(host)) throw new Error("source_host_unapproved");
    account = host === "api.ashbyhq.com" ? parts[2] || "" : parts[0] || "";
  }

  if (!ACCOUNT_PATTERN.test(account)) throw new Error("source_account_invalid");
  return account;
}

function sourceUrl(
  provider: ApprovedJobProvider,
  account: string,
  options: { includeGreenhouseContent?: boolean; leverSkip?: number } = {},
): string {
  const safe = encodeURIComponent(account);
  if (provider === "greenhouse") {
    return `https://boards-api.greenhouse.io/v1/boards/${safe}/jobs${
      options.includeGreenhouseContent === false ? "" : "?content=true"
    }`;
  }
  if (provider === "lever" || provider === "lever-eu") {
    const host = provider === "lever" ? "api.lever.co" : "api.eu.lever.co";
    return `https://${host}/v0/postings/${safe}?mode=json&limit=${LEVER_PAGE_SIZE}&skip=${options.leverSkip || 0}`;
  }
  return `https://api.ashbyhq.com/posting-api/job-board/${safe}?includeCompensation=true`;
}

async function fetchOfficialJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "InterviewThread approved-source gateway/2.0",
    },
    // The gateway constructs a fixed official HTTPS endpoint. Do not follow a
    // provider redirect to an unapproved host, even if a board identifier is
    // malformed or the upstream configuration changes.
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`provider_http_${response.status}`);
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > MAX_RESPONSE_BYTES) throw new Error("provider_response_too_large");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > MAX_RESPONSE_BYTES) throw new Error("provider_response_too_large");
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error("provider_invalid_json");
  }
}

function normalizeGreenhouse(payload: unknown, account: string) {
  const items = Array.isArray((payload as { jobs?: unknown[] })?.jobs)
    ? (payload as { jobs: Record<string, unknown>[] }).jobs
    : [];
  const company = humanizeJobSourceAccount(account);
  return items.slice(0, MAX_JOBS_PER_SOURCE).map((item) => {
    const location = cleanText((item.location as Record<string, unknown> | undefined)?.name);
    const departments = Array.isArray(item.departments) ? item.departments as Record<string, unknown>[] : [];
    const department = cleanText(departments[0]?.name) || "Other";
    const description = cleanText(item.content).slice(0, 32_000);
    const url = safeHttpsUrl(item.absolute_url);
    return enrichJobSearchMetadata({
      id: `greenhouse:${account}:${cleanText(item.id)}`,
      source: "Greenhouse",
      title: cleanText(item.title).slice(0, 500) || "Untitled role",
      company,
      description,
      department,
      industry: department,
      country: inferCountry(location),
      city: location.slice(0, 500) || "Location not specified",
      region: "Worldwide",
      workStyle: normalizeWorkStyle("", `${location} ${description.slice(0, 500)}`),
      sourceUrl: url,
      applyUrl: url,
      publishedAt: normalizedPublishedAt(item.updated_at),
    });
  });
}

function normalizeLever(
  items: Record<string, unknown>[],
  account: string,
  provider: ApprovedJobProvider,
) {
  const company = humanizeJobSourceAccount(account);
  return items.slice(0, MAX_JOBS_PER_SOURCE).map((item) => {
    const categories = (item.categories || {}) as Record<string, unknown>;
    const location = cleanText(categories.location);
    const department = cleanText(categories.department || categories.team) || "Other";
    const description = cleanText(item.descriptionPlain || item.description).slice(0, 32_000);
    return enrichJobSearchMetadata({
      id: `${provider}:${account}:${cleanText(item.id)}`,
      source: provider === "lever-eu" ? "Lever EU" : "Lever",
      title: cleanText(item.text).slice(0, 500) || "Untitled role",
      company,
      description,
      department,
      industry: department,
      country: countryName(item.country) === "Unspecified" ? inferCountry(location) : countryName(item.country),
      city: location.slice(0, 500) || "Location not specified",
      region: "Worldwide",
      workStyle: normalizeWorkStyle(item.workplaceType, `${location} ${description.slice(0, 500)}`),
      sourceUrl: safeHttpsUrl(item.hostedUrl),
      applyUrl: safeHttpsUrl(item.applyUrl),
      publishedAt: normalizedPublishedAt(item.createdAt || item.updatedAt),
    });
  });
}

function normalizeAshby(payload: unknown, account: string) {
  const items = Array.isArray((payload as { jobs?: unknown[] })?.jobs)
    ? (payload as { jobs: Record<string, unknown>[] }).jobs
    : [];
  const company = humanizeJobSourceAccount(account);
  return items
    .filter((item) => item.isListed !== false)
    .slice(0, MAX_JOBS_PER_SOURCE)
    .map((item, index) => {
      const location = cleanText(item.location);
      const postal = ((item.address as Record<string, unknown> | undefined)?.postalAddress || {}) as Record<string, unknown>;
      const department = cleanText(item.department || item.team) || "Other";
      const description = cleanText(item.descriptionPlain || item.descriptionHtml).slice(0, 32_000);
      const jobUrl = safeHttpsUrl(item.jobUrl);
      const applyUrl = safeHttpsUrl(item.applyUrl);
      const compensation = (item.compensation || {}) as Record<string, unknown>;
      const stableId = cleanText(item.id || item.jobId || jobUrl || `${cleanText(item.title)}-${index}`);
      return enrichJobSearchMetadata({
        id: `ashby:${account}:${stableId}`,
        source: "Ashby",
        title: cleanText(item.title).slice(0, 500) || "Untitled role",
        company,
        description,
        department,
        industry: department,
        country: countryName(postal.addressCountry) === "Unspecified" ? inferCountry(location) : countryName(postal.addressCountry),
        city: cleanText(postal.addressLocality).slice(0, 500) || location.slice(0, 500) || "Location not specified",
        region: "Worldwide",
        workStyle: normalizeWorkStyle(item.workplaceType, `${location} ${description.slice(0, 500)}`),
        sourceUrl: jobUrl,
        applyUrl,
        publishedAt: normalizedPublishedAt(item.publishedAt),
        compensation: cleanText(compensation.compensationTierSummary).slice(0, 1_000),
      });
    });
}

async function fetchLeverSnapshot(provider: ApprovedJobProvider, account: string) {
  const all: Record<string, unknown>[] = [];
  let completeSnapshot = true;
  for (let skip = 0; skip < MAX_JOBS_PER_SOURCE; skip += LEVER_PAGE_SIZE) {
    const payload = await fetchOfficialJson(sourceUrl(provider, account, { leverSkip: skip }));
    if (!Array.isArray(payload)) throw new Error("provider_invalid_shape");
    const page = payload as Record<string, unknown>[];
    all.push(...page);
    if (page.length < LEVER_PAGE_SIZE) break;
    if (all.length >= MAX_JOBS_PER_SOURCE) completeSnapshot = false;
  }
  return { jobs: normalizeLever(all, account, provider), completeSnapshot };
}

export async function fetchJobSourceSnapshot(
  provider: ApprovedJobProvider,
  rawReference: string,
): Promise<JobSourceSnapshot> {
  if (!Object.hasOwn(APPROVED_JOB_SOURCES, provider)) throw new Error("source_provider_invalid");
  const account = parseJobSourceReference(provider, rawReference);
  let detailCoverage = "Full posting descriptions where the provider exposes them.";
  let jobs: JobSearchCandidate[];
  let completeSnapshot = true;

  if (provider === "lever" || provider === "lever-eu") {
    ({ jobs, completeSnapshot } = await fetchLeverSnapshot(provider, account));
  } else {
    let payload: unknown;
    try {
      payload = await fetchOfficialJson(sourceUrl(provider, account));
    } catch (error) {
      if (provider !== "greenhouse" || (error as Error).message !== "provider_response_too_large") throw error;
      payload = await fetchOfficialJson(sourceUrl(provider, account, { includeGreenhouseContent: false }));
      detailCoverage = "Titles, locations, departments, and official links. Posting descriptions were omitted because the employer board exceeded the safe response limit.";
    }
    const rawCount = Array.isArray((payload as { jobs?: unknown[] })?.jobs)
      ? (payload as { jobs: unknown[] }).jobs.length
      : 0;
    completeSnapshot = rawCount <= MAX_JOBS_PER_SOURCE;
    jobs = provider === "greenhouse"
      ? normalizeGreenhouse(payload, account)
      : normalizeAshby(payload, account);
  }

  return {
    source: {
      ...APPROVED_JOB_SOURCES[provider],
      account,
      employer: humanizeJobSourceAccount(account),
      retrievedAt: new Date().toISOString(),
      coverage: "One employer's published public job board",
      detailCoverage,
    },
    jobs,
    completeSnapshot,
  };
}

export function jobSourceErrorCode(error: unknown): string {
  const code = error instanceof Error ? error.message : "provider_unavailable";
  return /^(source_|provider_)/.test(code) ? code.slice(0, 80) : "provider_unavailable";
}
