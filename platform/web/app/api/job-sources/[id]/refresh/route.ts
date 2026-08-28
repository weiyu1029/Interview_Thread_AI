import { env } from "cloudflare:workers";
import { getAppUser } from "../../../../auth.ts";
import { getOwnedJobSource } from "../../../../../db/job-tracking.ts";
import { syncJobSource } from "../../../../job-tracking-sync.ts";
import { hasSameOrigin } from "../../../request-security.ts";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!hasSameOrigin(request)) return Response.json({ error: "invalid_origin" }, { status: 403 });
  const user = await getAppUser();
  if (!user) return Response.json({ error: "sign_in_required" }, { status: 401 });
  const { id } = await context.params;
  const source = await getOwnedJobSource(env.DB, user.userId, id);
  if (!source) return Response.json({ error: "subscription_not_found" }, { status: 404 });
  if (source.last_sync_at && Date.now() - Date.parse(source.last_sync_at) < 60_000) {
    return Response.json(
      { error: "refresh_rate_limited" },
      { status: 429, headers: { "Retry-After": "60", "Cache-Control": "private, no-store" } },
    );
  }
  try {
    const result = await syncJobSource(env.DB, source);
    return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json(
      { error: "source_refresh_failed" },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
