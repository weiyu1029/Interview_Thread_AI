import { insertFeedback } from "../../../db";

const CATEGORIES = new Set([
  "accuracy",
  "market",
  "usability",
  "language",
  "feature",
]);
const PLANS = new Set(["community", "pro", "team", "enterprise"]);

function priorityForPlan(plan: string) {
  if (plan === "enterprise") return 2;
  if (plan === "team") return 1;
  return 0;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      category?: string;
      rating?: number;
      message?: string;
      plan?: string;
      locale?: string;
      website?: string;
    };
    if (payload.website) return new Response(null, { status: 204 });

    const category = payload.category?.trim().toLowerCase() || "";
    const message = payload.message?.trim() || "";
    const plan = payload.plan?.trim().toLowerCase() || "community";
    const rating = Number(payload.rating);
    const locale = payload.locale?.trim().slice(0, 16) || "en";

    if (!CATEGORIES.has(category))
      return Response.json({ error: "Invalid category." }, { status: 400 });
    if (!PLANS.has(plan))
      return Response.json({ error: "Invalid plan." }, { status: 400 });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return Response.json({ error: "Rating must be 1–5." }, { status: 400 });
    if (message.length < 3 || message.length > 4000)
      return Response.json(
        { error: "Feedback must contain 3–4,000 characters." },
        { status: 400 },
      );

    const priority = priorityForPlan(plan);
    const id = crypto.randomUUID();
    await insertFeedback({
      id,
      category,
      rating,
      message,
      plan,
      priority,
      locale,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ id, priority }, { status: 201 });
  } catch (error) {
    console.error("Feedback submission failed", error);
    return Response.json(
      { error: "Feedback is temporarily unavailable." },
      { status: 503 },
    );
  }
}
