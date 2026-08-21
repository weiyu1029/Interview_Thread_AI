import { enrichJobSearchMetadata } from "../../job-search.ts";

type ProviderId =
  | "greenhouse"
  | "lever"
  | "lever-eu"
  | "ashby"
  | "workable"
  | "recruitee";

type SourceDefinition = {
  id: ProviderId;
  name: string;
  docsUrl: string;
  access: string;
};

const SOURCES: Record<ProviderId, SourceDefinition> = {
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
  workable: {
    id: "workable",
    name: "Workable Public Jobs API",
    docsUrl: "https://workable.readme.io/reference/jobs-1",
    access: "Public GET API for employer-published jobs; no candidate data or application submission.",
  },
  recruitee: {
    id: "recruitee",
    name: "Recruitee Careers Site API",
    docsUrl: "https://docs.recruitee.com/reference/offers",
    access: "Public careers-site GET API for published offers; no candidate submission.",
  },
};

const ACCOUNT_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,78}[A-Za-z0-9])?$/;
const MAX_RESPONSE_BYTES = 5_000_000;
const MAX_JOBS = 100;

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

function humanizeAccount(account: string): string {
  return account
    .replace(/[-_.]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function countryName(value: unknown): string {
  const raw = cleanText(value);
  if (!raw) return "Unspecified";
  const normalized = raw.toUpperCase();
  const names: Record<string, string> = {
    US: "United States",
    USA: "United States",
    GB: "United Kingdom",
    GBR: "United Kingdom",
    UK: "United Kingdom",
    CA: "Canada",
    CAN: "Canada",
    DE: "Germany",
    DEU: "Germany",
    FR: "France",
    FRA: "France",
    NL: "Netherlands",
    NLD: "Netherlands",
    ES: "Spain",
    ESP: "Spain",
    JP: "Japan",
    JPN: "Japan",
    KR: "South Korea",
    KOR: "South Korea",
    SG: "Singapore",
    SGP: "Singapore",
    TW: "Taiwan",
    TWN: "Taiwan",
    AU: "Australia",
    AUS: "Australia",
    IN: "India",
    IND: "India",
    BR: "Brazil",
    BRA: "Brazil",
    AR: "Argentina",
    ARG: "Argentina",
    CO: "Colombia",
    COL: "Colombia",
    MX: "Mexico",
    MEX: "Mexico",
    AE: "United Arab Emirates",
    ARE: "United Arab Emirates",
    SA: "Saudi Arabia",
    SAU: "Saudi Arabia",
    ZA: "South Africa",
    ZAF: "South Africa",
    KE: "Kenya",
    KEN: "Kenya",
  };
  return names[normalized] || raw;
}

function inferCountry(location: string): string {
  const known = [
    "United States",
    "United Kingdom",
    "Canada",
    "Netherlands",
    "Spain",
    "Germany",
    "France",
    "Japan",
    "South Korea",
    "Singapore",
    "Taiwan",
    "Australia",
    "India",
    "Brazil",
    "Argentina",
    "Colombia",
    "Mexico",
    "United Arab Emirates",
    "Saudi Arabia",
    "South Africa",
    "Kenya",
  ];
  return known.find((item) => location.toLowerCase().includes(item.toLowerCase())) || "Unspecified";
}

function normalizeWorkStyle(value: unknown, fallback: string): string {
  const text = `${cleanText(value)} ${fallback}`.toLowerCase().replace(/_/g, " ");
  if (text.includes("hybrid")) return "Hybrid";
  if (text.includes("remote")) return "Remote";
  if (text.includes("onsite") || text.includes("on-site") || text.includes("on site")) return "On-site";
  return "Unspecified";
}

function normalizeEmploymentType(value: unknown): string | undefined {
  const text = cleanText(value).toLowerCase().replace(/[_-]+/g, " ");
  if (!text) return undefined;
  if (text.includes("full time") || text.includes("fulltime")) return "Full-time";
  if (text.includes("part time") || text.includes("parttime")) return "Part-time";
  if (text.includes("intern")) return "Internship";
  if (text.includes("contract") || text.includes("freelance")) return "Contract";
  if (text.includes("temporary") || text.includes("seasonal")) return "Temporary";
  return undefined;
}

function parseReference(provider: ProviderId, rawReference: string): string {
  const reference = rawReference.trim();
  if (!reference) throw new Error("Enter an employer job-board URL or board identifier.");
  if (ACCOUNT_PATTERN.test(reference)) return reference;

  let url: URL;
  try {
    url = new URL(reference);
  } catch {
    throw new Error("Use a valid employer board URL or its short board identifier.");
  }

  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);
  let account = "";
  if (provider === "greenhouse") {
    const allowed = new Set([
      "boards.greenhouse.io",
      "job-boards.greenhouse.io",
      "boards-api.greenhouse.io",
    ]);
    if (!allowed.has(host)) throw new Error("That URL is not an official Greenhouse job board.");
    account = host === "boards-api.greenhouse.io" ? parts[2] || "" : parts[0] || "";
  } else if (provider === "lever" || provider === "lever-eu") {
    const expectedHosts =
      provider === "lever"
        ? new Set(["jobs.lever.co", "api.lever.co"])
        : new Set(["jobs.eu.lever.co", "api.eu.lever.co"]);
    if (!expectedHosts.has(host)) throw new Error("That URL is not on the selected official Lever instance.");
    account = host.startsWith("api.") ? parts[2] || "" : parts[0] || "";
  } else if (provider === "ashby") {
    const allowed = new Set(["jobs.ashbyhq.com", "api.ashbyhq.com"]);
    if (!allowed.has(host)) throw new Error("That URL is not an official Ashby job board.");
    account = host === "api.ashbyhq.com" ? parts[2] || "" : parts[0] || "";
  } else if (provider === "workable") {
    if (!host.endsWith(".workable.com") && host !== "workable.com") {
      throw new Error("That URL is not an official Workable careers page.");
    }
    if (host === "www.workable.com" || host === "workable.com") {
      account = parts[0] === "api" && parts[1] === "accounts" ? parts[2] || "" : parts[0] || "";
    } else if (host === "apply.workable.com") {
      account = parts[0] || "";
    } else {
      account = host.split(".")[0] || "";
    }
  } else {
    if (!host.endsWith(".recruitee.com")) {
      throw new Error("That URL is not an official Recruitee careers site.");
    }
    account = host.split(".")[0] || "";
  }

  if (!ACCOUNT_PATTERN.test(account)) throw new Error("The job-board identifier in that URL is invalid.");
  return account;
}

function sourceUrl(
  provider: ProviderId,
  account: string,
  includeGreenhouseContent = true,
): string {
  const safe = encodeURIComponent(account);
  if (provider === "greenhouse") {
    return `https://boards-api.greenhouse.io/v1/boards/${safe}/jobs${
      includeGreenhouseContent ? "?content=true" : ""
    }`;
  }
  if (provider === "lever") {
    return `https://api.lever.co/v0/postings/${safe}?mode=json&limit=${MAX_JOBS}`;
  }
  if (provider === "lever-eu") {
    return `https://api.eu.lever.co/v0/postings/${safe}?mode=json&limit=${MAX_JOBS}`;
  }
  if (provider === "ashby") {
    return `https://api.ashbyhq.com/posting-api/job-board/${safe}?includeCompensation=true`;
  }
  if (provider === "workable") {
    return `https://www.workable.com/api/accounts/${safe}?details=true`;
  }
  return `https://${account}.recruitee.com/api/offers/`;
}

async function fetchOfficialJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "InterviewThread approved-source gateway/1.0",
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`The provider returned ${response.status}. Check the board URL and try again.`);
  }
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_RESPONSE_BYTES) throw new Error("The provider response is too large to process safely.");
  return response.json();
}

function normalizeGreenhouse(payload: unknown, account: string) {
  const jobs = Array.isArray((payload as { jobs?: unknown[] })?.jobs)
    ? (payload as { jobs: Record<string, unknown>[] }).jobs
    : [];
  const company = humanizeAccount(account);
  return jobs.slice(0, MAX_JOBS).map((item) => {
    const location = cleanText((item.location as Record<string, unknown> | undefined)?.name);
    const departments = Array.isArray(item.departments) ? (item.departments as Record<string, unknown>[]) : [];
    const department = cleanText(departments[0]?.name) || "Other";
    const description = cleanText(item.content);
    const url = cleanText(item.absolute_url);
    return enrichJobSearchMetadata({
      id: `greenhouse:${account}:${cleanText(item.id)}`,
      source: "Greenhouse",
      title: cleanText(item.title) || "Untitled role",
      company,
      description,
      department,
      industry: department,
      country: inferCountry(location),
      city: location || "Location not specified",
      region: "Worldwide",
      workStyle: normalizeWorkStyle("", `${location} ${description.slice(0, 500)}`),
      sourceUrl: url,
      applyUrl: url,
      publishedAt: cleanText(item.updated_at),
    });
  });
}

function normalizeLever(payload: unknown, account: string, provider: ProviderId) {
  const jobs = Array.isArray(payload) ? (payload as Record<string, unknown>[]) : [];
  const company = humanizeAccount(account);
  return jobs.slice(0, MAX_JOBS).map((item) => {
    const categories = (item.categories || {}) as Record<string, unknown>;
    const location = cleanText(categories.location);
    const department = cleanText(categories.department || categories.team) || "Other";
    const description = cleanText(item.descriptionPlain || item.description);
    return enrichJobSearchMetadata({
      id: `${provider}:${account}:${cleanText(item.id)}`,
      source: provider === "lever-eu" ? "Lever EU" : "Lever",
      title: cleanText(item.text) || "Untitled role",
      company,
      description,
      department,
      industry: department,
      country: countryName(item.country) === "Unspecified" ? inferCountry(location) : countryName(item.country),
      city: location || "Location not specified",
      region: "Worldwide",
      workStyle: normalizeWorkStyle(item.workplaceType, `${location} ${description.slice(0, 500)}`),
      sourceUrl: cleanText(item.hostedUrl),
      applyUrl: cleanText(item.applyUrl),
      publishedAt: "",
    });
  });
}

function normalizeAshby(payload: unknown, account: string) {
  const jobs = Array.isArray((payload as { jobs?: unknown[] })?.jobs)
    ? (payload as { jobs: Record<string, unknown>[] }).jobs
    : [];
  const company = humanizeAccount(account);
  return jobs
    .filter((item) => item.isListed !== false)
    .slice(0, MAX_JOBS)
    .map((item, index) => {
      const location = cleanText(item.location);
      const postal = ((item.address as Record<string, unknown> | undefined)?.postalAddress || {}) as Record<
        string,
        unknown
      >;
      const department = cleanText(item.department || item.team) || "Other";
      const description = cleanText(item.descriptionPlain || item.descriptionHtml);
      const jobUrl = cleanText(item.jobUrl);
      const compensation = (item.compensation || {}) as Record<string, unknown>;
      return enrichJobSearchMetadata({
        id: `ashby:${account}:${jobUrl || `${cleanText(item.title)}-${index}`}`,
        source: "Ashby",
        title: cleanText(item.title) || "Untitled role",
        company,
        description,
        department,
        industry: department,
        country: countryName(postal.addressCountry) === "Unspecified" ? inferCountry(location) : countryName(postal.addressCountry),
        city: cleanText(postal.addressLocality) || location || "Location not specified",
        region: "Worldwide",
        workStyle: normalizeWorkStyle(item.workplaceType, `${location} ${description.slice(0, 500)}`),
        sourceUrl: jobUrl,
        applyUrl: cleanText(item.applyUrl),
        publishedAt: cleanText(item.publishedAt),
        compensation: cleanText(compensation.compensationTierSummary),
      });
    });
}

function normalizeWorkable(payload: unknown, account: string) {
  const jobs = Array.isArray((payload as { jobs?: unknown[] })?.jobs)
    ? (payload as { jobs: Record<string, unknown>[] }).jobs
    : [];
  const company = cleanText((payload as { name?: unknown })?.name) || humanizeAccount(account);
  return jobs.slice(0, MAX_JOBS).map((item, index) => {
    const location = [item.city, item.state, item.country].map(cleanText).filter(Boolean).join(", ");
    const department = cleanText(item.department || item.function) || "Other";
    const description = cleanText(item.description);
    const postingUrl = cleanText(item.application_url || item.shortlink || item.url);
    return enrichJobSearchMetadata({
      id: `workable:${account}:${cleanText(item.shortcode || item.code) || index}`,
      source: "Workable",
      title: cleanText(item.title) || "Untitled role",
      company,
      description,
      department,
      industry: cleanText(item.industry) || department,
      country: countryName(item.country),
      city: cleanText(item.city) || location || "Location not specified",
      region: "Worldwide",
      workStyle: normalizeWorkStyle(
        item.workplace_type,
        `${item.telecommuting ? "remote" : ""} ${location} ${description.slice(0, 500)}`,
      ),
      sourceUrl: postingUrl,
      applyUrl: cleanText(item.url || item.application_url || item.shortlink),
      publishedAt: cleanText(item.published_on || item.created_at),
      employmentType: normalizeEmploymentType(item.employment_type),
    });
  });
}

function normalizeRecruitee(payload: unknown, account: string) {
  const jobs = Array.isArray((payload as { offers?: unknown[] })?.offers)
    ? (payload as { offers: Record<string, unknown>[] }).offers
    : [];
  const company = humanizeAccount(account);
  return jobs.slice(0, MAX_JOBS).map((item, index) => {
    const locations = Array.isArray(item.locations)
      ? (item.locations as Record<string, unknown>[])
      : [];
    const primaryLocation = locations[0] || {};
    const location =
      cleanText(primaryLocation.name) ||
      [item.city, item.state, item.country].map(cleanText).filter(Boolean).join(", ") ||
      cleanText(item.location);
    const department = cleanText(item.department) || "Other";
    const description = cleanText(`${item.description || ""} ${item.requirements || ""}`);
    const sourceUrl = cleanText(item.careers_url || item.url);
    const remoteHint = item.remote ? "remote" : item.hybrid ? "hybrid" : item.on_site ? "on-site" : "";
    return enrichJobSearchMetadata({
      id: `recruitee:${account}:${cleanText(item.id || item.guid || item.slug) || index}`,
      source: "Recruitee",
      title: cleanText(item.title) || "Untitled role",
      company,
      description,
      department,
      industry: department,
      country: countryName(primaryLocation.country || item.country_code || item.country),
      city: cleanText(primaryLocation.city || item.city) || location || "Location not specified",
      region: "Worldwide",
      workStyle: normalizeWorkStyle(remoteHint, `${location} ${description.slice(0, 500)}`),
      sourceUrl,
      applyUrl: cleanText(item.careers_apply_url) || sourceUrl,
      publishedAt: cleanText(item.published_at || item.created_at),
      employmentType: normalizeEmploymentType(
        item.employment_type_code || item.employment_type,
      ),
    });
  });
}

function providerResultCount(provider: ProviderId, payload: unknown): number | null {
  if (provider === "lever" || provider === "lever-eu") {
    return Array.isArray(payload) ? payload.length : null;
  }
  const key = provider === "recruitee" ? "offers" : "jobs";
  const rows = (payload as Record<string, unknown> | null)?.[key];
  return Array.isArray(rows) ? rows.length : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider") as ProviderId | null;
  const reference = url.searchParams.get("reference") || "";
  if (!provider || !(provider in SOURCES)) {
    return Response.json(
      { error: "Choose Greenhouse, Lever, Lever EU, Ashby, Workable, or Recruitee." },
      { status: 400 },
    );
  }

  try {
    const account = parseReference(provider, reference);
    let detailCoverage =
      "Full posting descriptions where the provider exposes them.";
    let payload: unknown;
    try {
      payload = await fetchOfficialJson(sourceUrl(provider, account));
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (
        provider !== "greenhouse" ||
        message !== "The provider response is too large to process safely."
      ) {
        throw error;
      }
      // Greenhouse can return multi-megabyte HTML descriptions for large
      // employers. Keep the response-size guard, but fall back to the same
      // official API's lightweight listing instead of making the whole board
      // unusable.
      payload = await fetchOfficialJson(sourceUrl(provider, account, false));
      detailCoverage =
        "Titles, locations, departments, and official links. Posting descriptions were omitted because the employer board exceeded the safe response limit.";
    }
    const jobs =
      provider === "greenhouse"
        ? normalizeGreenhouse(payload, account)
        : provider === "ashby"
          ? normalizeAshby(payload, account)
          : provider === "workable"
            ? normalizeWorkable(payload, account)
            : provider === "recruitee"
              ? normalizeRecruitee(payload, account)
              : normalizeLever(payload, account, provider);
    const retrievedAt = new Date().toISOString();
    const providerCount = providerResultCount(provider, payload);
    const isComplete = providerCount !== null && providerCount < MAX_JOBS;
    return Response.json(
      {
        source: {
          ...SOURCES[provider],
          account,
          employer:
            provider === "workable"
              ? cleanText((payload as { name?: unknown })?.name) || humanizeAccount(account)
              : humanizeAccount(account),
          retrievedAt,
          coverage: "One employer's published public job board",
          detailCoverage,
          returnedCount: jobs.length,
          isComplete,
          lowerBound: isComplete ? undefined : jobs.length,
        },
        jobs,
        count: jobs.length,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=900",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "The approved source could not be loaded.";
    const clientError = /^(Enter|Use|That URL|The job-board identifier)/.test(message);
    return Response.json({ error: message }, { status: clientError ? 400 : 502 });
  }
}
