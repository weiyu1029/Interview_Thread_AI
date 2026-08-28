import { env } from "cloudflare:workers";
import { getAppUser } from "../../auth.ts";
import {
  assertJobSourceCapacity,
  findActiveOwnedJobSource,
  jobTrackingSnapshotForUser,
  upsertJobSourceAndSubscription,
} from "../../../db/job-tracking.ts";
import {
  APPROVED_JOB_SOURCES,
  fetchJobSourceSnapshot,
  jobSourceErrorCode,
  parseJobSourceReference,
  type ApprovedJobProvider,
} from "../../job-source-gateway.ts";
import { syncJobSource } from "../../job-tracking-sync.ts";
import {
  jsonRequestGuardResponse,
  readJsonBody,
  validateJsonRequest,
} from "../request-security.ts";

const MAX_SOURCE_REQUEST_BYTES = 8 * 1024;

function privateJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "private, no-store");
  return Response.json(body, { ...init, headers });
}

export async function GET(request: Request) {
  try {
    const user = await getAppUser();
    if (!user) return privateJson({ error: "sign_in_required" }, { status: 401 });
    const rawCursor = new URL(request.url).searchParams.get("after") || "0";
    if (!/^\d{1,15}$/.test(rawCursor)) {
      return privateJson({ error: "cursor_invalid" }, { status: 400 });
    }
    const url = new URL(request.url);
    const includeJobs = url.searchParams.get("include_jobs") !== "0";
    const knownJobsVersion = (url.searchParams.get("jobs_version") || "").slice(0, 120);
    return privateJson(await jobTrackingSnapshotForUser(env.DB, user.userId, Number(rawCursor), {
      includeJobs,
      knownJobsVersion,
    }));
  } catch (error) {
    console.error("Job source list failed", error);
    return privateJson({ error: "job_tracking_unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const unsafe = jsonRequestGuardResponse(validateJsonRequest(request, MAX_SOURCE_REQUEST_BYTES));
    if (unsafe) return unsafe;
    const user = await getAppUser();
    if (!user) return privateJson({ error: "sign_in_required" }, { status: 401 });
    const body = await readJsonBody<Record<string, unknown>>(request, MAX_SOURCE_REQUEST_BYTES);
    const invalid = jsonRequestGuardResponse(body);
    if (invalid) return invalid;
    const provider = String(body.payload.provider || "") as ApprovedJobProvider;
    const reference = String(body.payload.reference || "").trim();
    const locale = String(body.payload.locale || "en").slice(0, 16);
    if (!Object.hasOwn(APPROVED_JOB_SOURCES, provider)) {
      return privateJson({ error: "source_provider_invalid" }, { status: 400 });
    }
    if (!reference || reference.length > 2_048) {
      return privateJson({ error: "source_reference_invalid" }, { status: 400 });
    }

    // Parse and enforce the per-account source quota before any provider
    // request. The write path repeats the check to close concurrent races.
    const account = parseJobSourceReference(provider, reference);
    const activeSubscription = await findActiveOwnedJobSource(
      env.DB,
      user.userId,
      provider,
      account,
    );
    if (activeSubscription) {
      const payload = await jobTrackingSnapshotForUser(env.DB, user.userId, 0);
      return privateJson({
        ...payload,
        subscriptionId: activeSubscription.subscription_id,
        alreadyTracked: true,
      });
    }
    await assertJobSourceCapacity(env.DB, user.userId, provider, account);

    // Fetch before writing so a failed or unapproved source cannot create
    // persistent D1 rows. Only a signed-in user can create a subscription.
    const snapshot = await fetchJobSourceSnapshot(provider, reference);
    const { source, subscription } = await upsertJobSourceAndSubscription(env.DB, {
      userId: user.userId,
      provider,
      account: snapshot.source.account,
      employer: snapshot.source.employer,
      locale,
    });
    await syncJobSource(env.DB, source, snapshot);
    const payload = await jobTrackingSnapshotForUser(env.DB, user.userId, 0);
    return privateJson({ ...payload, subscriptionId: subscription.id }, { status: 201 });
  } catch (error) {
    const code = jobSourceErrorCode(error);
    const clientError = code.startsWith("source_") || code === "source_limit_reached";
    console.error("Job source connection failed", { code });
    return privateJson(
      { error: code === "provider_unavailable" ? "job_tracking_unavailable" : code },
      { status: clientError ? 400 : 502 },
    );
  }
}
