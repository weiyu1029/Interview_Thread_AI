import {
  recordUserActivity,
  USER_ACTIVITY_TYPES,
  listUserActivity,
  type UserActivityType,
} from "../../../db";
import { getAppUser } from "../../auth";

const ACTIVITY_TYPES = new Set<string>(USER_ACTIVITY_TYPES);

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
    const user = await getAppUser();
    if (!user)
      return Response.json({ error: "Sign in is required." }, { status: 401 });

    const payload = (await request.json()) as {
      eventType?: string;
      locale?: string;
    };
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
