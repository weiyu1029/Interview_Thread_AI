import { env } from "cloudflare:workers";
import { getAppUser } from "../../../auth.ts";
import {
  deactivateJobSubscription,
  updateJobSubscription,
} from "../../../../db/job-tracking.ts";
import {
  hasSameOrigin,
  jsonRequestGuardResponse,
  readJsonBody,
  validateJsonRequest,
} from "../../request-security.ts";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const unsafe = jsonRequestGuardResponse(validateJsonRequest(request, 4 * 1024));
  if (unsafe) return unsafe;
  const user = await getAppUser();
  if (!user) return Response.json({ error: "sign_in_required" }, { status: 401 });
  const body = await readJsonBody<Record<string, unknown>>(request, 4 * 1024);
  const invalid = jsonRequestGuardResponse(body);
  if (invalid) return invalid;
  const { id } = await context.params;
  const updated = await updateJobSubscription(env.DB, {
    userId: user.userId,
    subscriptionId: id,
    alertsEnabled: body.payload.alertsEnabled !== false,
    locale: String(body.payload.locale || "en"),
  });
  return Response.json(
    updated ? { ok: true } : { error: "subscription_not_found" },
    { status: updated ? 200 : 404, headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!hasSameOrigin(request)) {
    return Response.json({ error: "invalid_origin" }, { status: 403 });
  }
  const user = await getAppUser();
  if (!user) return Response.json({ error: "sign_in_required" }, { status: 401 });
  const { id } = await context.params;
  const removed = await deactivateJobSubscription(env.DB, user.userId, id);
  return Response.json(
    removed ? { ok: true } : { error: "subscription_not_found" },
    { status: removed ? 200 : 404, headers: { "Cache-Control": "private, no-store" } },
  );
}
