type ProviderId = "greenhouse" | "lever" | "lever-eu" | "ashby";

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
    MX: "Mexico",
    MEX: "Mexico",
  };
  return names[normalized] || raw;
}

function inferCountry(location: string): string {
  const known = [
    "United States",
    "United Kingdom",
    "Canada",
    "Germany",
    "France",
    "Japan",
    "South Korea",
    "Singapore",
    "Taiwan",
    "Australia",
    "India",
    "Brazil",
    "Mexico",
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
  } else {
    const allowed = new Set(["jobs.ashbyhq.com", "api.ashbyhq.com"]);
    if (!allowed.has(host)) throw new Error("That URL is not an official Ashby job board.");
    account = host === "api.ashbyhq.com" ? parts[2] || "" : parts[0] || "";
  }

  if (!ACCOUNT_PATTERN.test(account)) throw new Error("The job-board identifier in that URL is invalid.");
  return account;
}

function sourceUrl(provider: ProviderId, account: string): string {
  const safe = encodeURIComponent(account);
  if (provider === "greenhouse") {
    return `https://boards-api.greenhouse.io/v1/boards/${safe}/jobs?content=true`;
  }
  if (provider === "lever") {
    return `https://api.lever.co/v0/postings/${safe}?mode=json&limit=${MAX_JOBS}`;
  }
  if (provider === "lever-eu") {
    return `https://api.eu.lever.co/v0/postings/${safe}?mode=json&limit=${MAX_JOBS}`;
  }
  return `https://api.ashbyhq.com/posting-api/job-board/${safe}?includeCompensation=true`;
}

async function fetchOfficialJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "CareerProof approved-source gateway/1.0",
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
    return {
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
    };
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
    return {
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
    };
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
      return {
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
      };
    });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider") as ProviderId | null;
  const reference = url.searchParams.get("reference") || "";
  if (!provider || !(provider in SOURCES)) {
    return Response.json(
      { error: "Choose Greenhouse, Lever, Lever EU, or Ashby." },
      { status: 400 },
    );
  }

  try {
    const account = parseReference(provider, reference);
    const payload = await fetchOfficialJson(sourceUrl(provider, account));
    const jobs =
      provider === "greenhouse"
        ? normalizeGreenhouse(payload, account)
        : provider === "ashby"
          ? normalizeAshby(payload, account)
          : normalizeLever(payload, account, provider);
    const retrievedAt = new Date().toISOString();
    return Response.json(
      {
        source: {
          ...SOURCES[provider],
          account,
          employer: humanizeAccount(account),
          retrievedAt,
          coverage: "One employer's published public job board",
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
