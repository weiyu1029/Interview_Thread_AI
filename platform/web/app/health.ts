import {
  createRequestId,
  elapsedMilliseconds,
  logObservability,
} from "./observability.ts";
import { PRODUCT_VERSION } from "./product-version.ts";

function releaseLabel() {
  return process.env.APP_RELEASE?.trim() || PRODUCT_VERSION;
}

export type HealthDatabase = {
  prepare(statement: string): {
    first<T>(): Promise<T | null>;
  };
};

const HEALTH_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

function healthResponse(
  status: "ok" | "unavailable",
  httpStatus: 200 | 503,
  requestId: string,
) {
  return Response.json(
    { status },
    {
      status: httpStatus,
      headers: {
        ...HEALTH_HEADERS,
        "X-Request-ID": requestId,
      },
    },
  );
}

export async function runHealthCheck(
  database: HealthDatabase | undefined,
  write?: (entry: string) => void,
) {
  const startedAt = Date.now();
  const requestId = createRequestId();
  let healthy = false;

  try {
    if (database) {
      const result = await database.prepare("SELECT 1 AS ok").first<{
        ok: number;
      }>();
      healthy = result?.ok === 1;
    }
  } catch {
    // The response and log deliberately omit raw database/provider errors.
    healthy = false;
  }

  const status = healthy ? 200 : 503;
  logObservability(
    {
      requestId,
      route: "api_healthz",
      outcome: healthy ? "ok" : "unavailable",
      status,
      durationMs: elapsedMilliseconds(startedAt),
      provider: "d1",
      release: releaseLabel(),
    },
    write,
  );

  return healthResponse(healthy ? "ok" : "unavailable", status, requestId);
}
