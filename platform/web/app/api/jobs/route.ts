import {
  APPROVED_JOB_SOURCES,
  fetchJobSourceSnapshot,
  jobSourceErrorCode,
  type ApprovedJobProvider,
} from "../../job-source-gateway.ts";

const PUBLIC_ERROR_MESSAGES: Record<string, string> = {
  source_reference_required: "Enter an employer job-board URL or board identifier.",
  source_reference_invalid: "Use a valid HTTPS employer board URL or its short board identifier.",
  source_host_unapproved: "That URL is not an official board for the selected provider.",
  source_account_invalid: "The job-board identifier in that URL is invalid.",
  source_provider_invalid: "Choose Greenhouse, Lever, Lever EU, or Ashby.",
  provider_response_too_large: "The provider response is too large to process safely.",
  provider_invalid_json: "The provider returned an invalid response.",
  provider_invalid_shape: "The provider returned an unexpected response.",
  provider_unavailable: "The approved source could not be loaded.",
};
const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider") as ApprovedJobProvider | null;
  const reference = url.searchParams.get("reference") || "";
  if (!provider || !(provider in APPROVED_JOB_SOURCES)) {
    return Response.json(
      { error: PUBLIC_ERROR_MESSAGES.source_provider_invalid },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const snapshot = await fetchJobSourceSnapshot(provider, reference);
    const retrievedAt = snapshot.source.retrievedAt;
    return Response.json(
      {
        source: snapshot.source,
        jobs: snapshot.jobs,
        count: snapshot.jobs.length,
        completeSnapshot: snapshot.completeSnapshot,
        retrievedAt,
        freshness: {
          retrievedAt,
          updateMode: "on-demand",
          sourceKind: "official-employer-board",
          cached: false,
          completeSnapshot: snapshot.completeSnapshot,
        },
      },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    const code = jobSourceErrorCode(error);
    const clientError = code.startsWith("source_");
    const providerHttp = /^provider_http_(\d{3})$/.exec(code);
    const message = providerHttp
      ? `The provider returned ${providerHttp[1]}. Check the board URL and try again.`
      : code === "source_host_unapproved"
        ? `That URL is not an official ${APPROVED_JOB_SOURCES[provider].name.replace(/ (Job Board|Postings|Job Postings) API(?: \(EU\))?$/, "")} job board.`
      : PUBLIC_ERROR_MESSAGES[code] || PUBLIC_ERROR_MESSAGES.provider_unavailable;
    return Response.json(
      { error: message, code },
      { status: clientError ? 400 : 502, headers: NO_STORE_HEADERS },
    );
  }
}
