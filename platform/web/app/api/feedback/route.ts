import { insertFeedback } from "../../../db";
import { getAppUser } from "../../auth";
import { PRODUCT_VERSION } from "../../product-version";
import { deliverInboxMessage } from "../../email-delivery.ts";
import {
  jsonRequestGuardResponse,
  readJsonBody,
  validateJsonRequest,
} from "../request-security.ts";

const CATEGORIES = new Set([
  "accuracy",
  "market",
  "usability",
  "language",
  "feature",
]);
const PLANS = new Set(["community"]);
const SURFACES = new Set([
  "general",
  "analysis",
  "interview",
  "tracker",
  "recommendations",
  "market",
  "account",
  "beta",
]);
const MAX_FEEDBACK_REQUEST_BYTES = 32 * 1024;

export async function POST(request: Request) {
  try {
    const unsafeRequest = jsonRequestGuardResponse(
      validateJsonRequest(request, MAX_FEEDBACK_REQUEST_BYTES),
    );
    if (unsafeRequest) return unsafeRequest;

    const user = await getAppUser();
    if (!user)
      return Response.json({ error: "Sign in is required." }, { status: 401 });

    const body = await readJsonBody<{
      category?: string;
      rating?: number;
      message?: string;
      plan?: string;
      locale?: string;
      website?: string;
      surface?: string;
    }>(request, MAX_FEEDBACK_REQUEST_BYTES);
    const invalidBody = jsonRequestGuardResponse(body);
    if (invalidBody) return invalidBody;
    const payload = body.payload;
    if (payload.website) return new Response(null, { status: 204 });

    const category = payload.category?.trim().toLowerCase() || "";
    const message = payload.message?.trim() || "";
    const plan = payload.plan?.trim().toLowerCase() || "community";
    const rating = Number(payload.rating);
    const locale = payload.locale?.trim().slice(0, 16) || "en";
    const surface = payload.surface?.trim().toLowerCase() || "general";

    if (!CATEGORIES.has(category))
      return Response.json({ error: "Invalid category." }, { status: 400 });
    if (!PLANS.has(plan))
      return Response.json({ error: "Invalid plan." }, { status: 400 });
    if (!SURFACES.has(surface))
      return Response.json({ error: "Invalid feedback surface." }, { status: 400 });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return Response.json({ error: "Rating must be 1–5." }, { status: 400 });
    if (message.length < 3 || message.length > 4000)
      return Response.json(
        { error: "Feedback must contain 3–4,000 characters." },
        { status: 400 },
      );

    const priority = 0;
    const id = crypto.randomUUID();
    await insertFeedback({
      id,
      userId: user.userId,
      category,
      rating,
      message,
      plan,
      priority,
      locale,
      createdAt: new Date().toISOString(),
      productVersion: PRODUCT_VERSION,
      surface,
    });

    const notification = await deliverInboxMessage(
      {
        kind: "feedback",
        name: user.displayName,
        replyTo: user.email || undefined,
        topic: `${category} · ${rating}/5`,
        message,
        locale,
        metadata: {
          "Product version": PRODUCT_VERSION,
          Surface: surface,
          Plan: plan,
          "Submission ID": id,
        },
      },
      `feedback-${id}`,
      "api_feedback",
    );
    if (!notification.delivered) {
      console.error("Feedback was stored but its inbox notification was not delivered");
    }

    return Response.json(
      { id, priority, inboxNotified: notification.delivered },
      { status: 201 },
    );
  } catch {
    // Raw provider/database exceptions may contain request or account details.
    return Response.json(
      { error: "Feedback is temporarily unavailable." },
      { status: 503 },
    );
  }
}
