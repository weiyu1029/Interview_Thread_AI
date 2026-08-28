import { env } from "cloudflare:workers";
import { getAppUser } from "../../auth.ts";
import { updateJobNotificationDestination } from "../../../db/job-tracking.ts";
import {
  jsonRequestGuardResponse,
  readJsonBody,
  validateJsonRequest,
} from "../request-security.ts";

export async function PUT(request: Request) {
  const unsafe = jsonRequestGuardResponse(validateJsonRequest(request, 4 * 1024));
  if (unsafe) return unsafe;
  const user = await getAppUser();
  if (!user) return Response.json({ error: "sign_in_required" }, { status: 401 });
  const body = await readJsonBody<Record<string, unknown>>(request, 4 * 1024);
  const invalid = jsonRequestGuardResponse(body);
  if (invalid) return invalid;
  const enabled = body.payload.emailEnabled === true;
  if (!user.email) {
    return Response.json({ error: "verified_email_unavailable" }, { status: 400 });
  }
  await updateJobNotificationDestination(env.DB, {
    userId: user.userId,
    email: user.email,
    enabled,
    locale: String(body.payload.locale || "en"),
  });
  return Response.json(
    { email: user.email, emailEnabled: enabled },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
