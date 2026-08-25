import {
  recordUserActivity,
  USER_ACTIVITY_TYPES,
  listUserActivity,
  type UserActivityType,
} from "../../../db";
import { getAppUser } from "../../auth";
import {
  jsonRequestGuardResponse,
  readJsonBody,
  validateJsonRequest,
} from "../request-security.ts";

const ACTIVITY_TYPES = new Set<string>(USER_ACTIVITY_TYPES);
const MAX_ACTIVITY_REQUEST_BYTES = 4 * 1024;

export async function GET() {
  try {
    const user = await getAppUser();
    if (!user)
      return Response.json({ error: "Sign in is required." }, { status: 401 });

    const events = await listUserActivity(user.userId, 12);
    return Response.json({ events });
  } catch (error) {
    console.error("Activity history failed", error);
    return Response.json(
      { error: "Activity history is temporarily unavailable." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const unsafeRequest = jsonRequestGuardResponse(
      validateJsonRequest(request, MAX_ACTIVITY_REQUEST_BYTES),
    );
    if (unsafeRequest) return unsafeRequest;

    const user = await getAppUser();
    if (!user)
      return Response.json({ error: "Sign in is required." }, { status: 401 });

    const body = await readJsonBody<{
      eventType?: string;
      locale?: string;
    }>(request, MAX_ACTIVITY_REQUEST_BYTES);
    const invalidBody = jsonRequestGuardResponse(body);
    if (invalidBody) return invalidBody;
    const payload = body.payload;
    const eventType = payload.eventType?.trim() || "";
    const locale = payload.locale?.trim().slice(0, 16) || "en";
    if (!ACTIVITY_TYPES.has(eventType))
      return Response.json({ error: "Invalid activity type." }, { status: 400 });

    const createdAt = new Date().toISOString();
    await recordUserActivity({
      id: crypto.randomUUID(),
      userId: user.userId,
      eventType: eventType as UserActivityType,
      locale,
      createdAt,
    });

    return Response.json({ createdAt }, { status: 201 });
  } catch (error) {
    console.error("Activity recording failed", error);
    return Response.json(
      { error: "Activity history is temporarily unavailable." },
      { status: 503 },
    );
  }
}
