import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, "..");
const releasePath = resolve(
  projectDirectory,
  "app/question-bank-release.json",
);

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const outputPath = resolve(
  projectDirectory,
  args.get("--output") || "artifacts/question-bank-upstream-report.json",
);
const release = JSON.parse(readFileSync(releasePath, "utf8"));
const approvedSources = release.sources.filter(
  (source) => source.monitorUpstream && source.approvedRevision,
);

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "InterviewThread approved-question-source monitor/1.0",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN)
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function inspectSource(source) {
  const trackingRef = source.trackingRef || "HEAD";
  const endpoint = `https://api.github.com/repos/${source.repository}/commits/${encodeURIComponent(trackingRef)}`;
  try {
    const response = await fetch(endpoint, { headers: githubHeaders() });
    if (!response.ok) {
      return {
        id: source.id,
        repository: source.repository,
        trackingRef,
        approvedRevision: source.approvedRevision,
        observedRevision: null,
        status: "check-failed",
        error: `github_http_${response.status}`,
      };
    }
    const payload = await response.json();
    const observedRevision =
      typeof payload.sha === "string" ? payload.sha : null;
    if (!observedRevision) {
      return {
        id: source.id,
        repository: source.repository,
        trackingRef,
        approvedRevision: source.approvedRevision,
        observedRevision: null,
        status: "check-failed",
        error: "github_revision_missing",
      };
    }
    const changed = observedRevision !== source.approvedRevision;
    return {
      id: source.id,
      repository: source.repository,
      trackingRef,
      approvedRevision: source.approvedRevision,
      observedRevision,
      status: changed ? "candidate-revision-detected" : "approved-revision-current",
      candidateOnly: changed,
      compareUrl: changed
        ? `https://github.com/${source.repository}/compare/${source.approvedRevision}...${observedRevision}`
        : null,
    };
  } catch (error) {
    return {
      id: source.id,
      repository: source.repository,
      trackingRef,
      approvedRevision: source.approvedRevision,
      observedRevision: null,
      status: "check-failed",
      error: error instanceof Error ? error.message : "source_check_failed",
    };
  }
}

const sources = await Promise.all(approvedSources.map(inspectSource));
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  basedOnReleaseId: release.releaseId,
  policy: {
    candidateOnly: true,
    humanReviewRequired: true,
    automaticPublishing: false,
    unreviewedRealTimeCrawler: false,
  },
  summary: {
    sourcesChecked: sources.length,
    candidateRevisions: sources.filter(
      (source) => source.status === "candidate-revision-detected",
    ).length,
    failedChecks: sources.filter((source) => source.status === "check-failed")
      .length,
  },
  sources,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

if (report.summary.failedChecks > 0) process.exitCode = 1;

