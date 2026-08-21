export const OBSERVABILITY_KEYS = [
  "requestId",
  "route",
  "outcome",
  "status",
  "durationMs",
  "provider",
  "release",
] as const;

export const OBSERVABILITY_ROUTES = [
  "home",
  "api_healthz",
  "api_activity",
  "api_auth",
  "api_beta",
  "api_contact",
  "api_feedback",
  "api_jobs",
  "api_region",
  "api_speech",
  "api_transcribe",
  "other",
] as const;

export const OBSERVABILITY_OUTCOMES = [
  "ok",
  "degraded",
  "invalid",
  "unauthorized",
  "forbidden",
  "rate_limited",
  "timeout",
  "unavailable",
  "error",
] as const;

export const OBSERVABILITY_PROVIDERS = [
  "internal",
  "d1",
  "google",
  "github",
  "linkedin",
  "azure_speech",
  "resend",
  "greenhouse",
  "lever",
  "lever_eu",
  "ashby",
  "workable",
  "recruitee",
] as const;

export type ObservabilityRoute = (typeof OBSERVABILITY_ROUTES)[number];
export type ObservabilityOutcome = (typeof OBSERVABILITY_OUTCOMES)[number];
export type ObservabilityProvider = (typeof OBSERVABILITY_PROVIDERS)[number];

export type ObservabilityEvent = Readonly<{
  requestId?: string;
  route?: ObservabilityRoute;
  outcome?: ObservabilityOutcome;
  status?: number;
  durationMs?: number;
  provider?: ObservabilityProvider;
  release?: string;
}>;

const ROUTES = new Set<string>(OBSERVABILITY_ROUTES);
const OUTCOMES = new Set<string>(OBSERVABILITY_OUTCOMES);
const PROVIDERS = new Set<string>(OBSERVABILITY_PROVIDERS);
const REQUEST_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RELEASE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const MAX_DURATION_MS = 10 * 60 * 1_000;

function recordFrom(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

/**
 * Converts an untrusted event into the only production-safe fields that may be
 * logged. Request bodies, URLs, query strings, headers, IP addresses, user
 * agents, identities, career evidence, audio, transcripts, and raw errors are
 * intentionally not accepted by this boundary.
 */
export function sanitizeObservabilityEvent(value: unknown): ObservabilityEvent {
  const input = recordFrom(value);
  const event: {
    requestId?: string;
    route?: ObservabilityRoute;
    outcome?: ObservabilityOutcome;
    status?: number;
    durationMs?: number;
    provider?: ObservabilityProvider;
    release?: string;
  } = {};

  if (
    typeof input.requestId === "string" &&
    REQUEST_ID_PATTERN.test(input.requestId)
  ) {
    event.requestId = input.requestId;
  }
  if (typeof input.route === "string" && ROUTES.has(input.route)) {
    event.route = input.route as ObservabilityRoute;
  }
  if (typeof input.outcome === "string" && OUTCOMES.has(input.outcome)) {
    event.outcome = input.outcome as ObservabilityOutcome;
  }
  if (
    typeof input.status === "number" &&
    Number.isInteger(input.status) &&
    input.status >= 100 &&
    input.status <= 599
  ) {
    event.status = input.status;
  }
  if (
    typeof input.durationMs === "number" &&
    Number.isFinite(input.durationMs) &&
    input.durationMs >= 0
  ) {
    event.durationMs = Math.min(
      MAX_DURATION_MS,
      Math.round(input.durationMs),
    );
  }
  if (typeof input.provider === "string" && PROVIDERS.has(input.provider)) {
    event.provider = input.provider as ObservabilityProvider;
  }
  if (
    typeof input.release === "string" &&
    RELEASE_PATTERN.test(input.release)
  ) {
    event.release = input.release;
  }

  return Object.freeze(event);
}

export function createRequestId() {
  return crypto.randomUUID();
}

export function elapsedMilliseconds(startedAt: number) {
  return Math.max(0, Date.now() - startedAt);
}

export function logObservability(
  value: unknown,
  write: (entry: string) => void = console.info,
) {
  const event = sanitizeObservabilityEvent(value);
  write(JSON.stringify(event));
  return event;
}
