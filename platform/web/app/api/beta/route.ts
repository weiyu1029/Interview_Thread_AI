import {
  findBetaParticipant,
  recordUserActivity,
  upsertBetaParticipant,
  withdrawBetaParticipant,
} from "../../../db";
import { getAppUser } from "../../auth";
import {
  PRIVACY_VERSION,
  PRODUCT_VERSION,
  TERMS_VERSION,
} from "../../product-version";

const ROLE_FAMILIES = new Set([
  "product",
  "data",
  "engineering",
  "design",
  "operations",
  "marketing-sales",
  "finance",
  "other",
]);
const EXPERIENCE_LEVELS = new Set([
  "student",
  "early",
  "mid",
  "senior",
  "career-change",
]);
const INTERVIEW_TIMELINES = new Set([
  "interviewing",
  "30-days",
  "90-days",
  "exploring",
]);
const PRIMARY_GOALS = new Set([
  "evidence-match",
  "truthful-stories",
  "mock-interview",
  "speech-language",
  "accessibility",
  "other",
]);

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function GET() {
  try {
    const user = await getAppUser();
    if (!user)
      return Response.json({ error: "Sign in is required." }, { status: 401 });
    return Response.json({ participant: await findBetaParticipant(user.userId) });
  } catch (error) {
    console.error("Beta status lookup failed", error);
    return Response.json({ error: "Beta status is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request))
      return Response.json({ error: "Invalid request origin." }, { status: 403 });
    const user = await getAppUser();
    if (!user)
      return Response.json({ error: "Sign in is required." }, { status: 401 });
    if (!request.headers.get("content-type")?.includes("application/json"))
      return Response.json({ error: "JSON is required." }, { status: 415 });

    const payload = (await request.json()) as Record<string, unknown>;
    const roleFamily = String(payload.roleFamily || "");
    const experienceLevel = String(payload.experienceLevel || "");
    const interviewTimeline = String(payload.interviewTimeline || "");
    const primaryGoal = String(payload.primaryGoal || "");
    const locale = String(payload.locale || "en").slice(0, 16);

    if (!ROLE_FAMILIES.has(roleFamily))
      return Response.json({ error: "Choose a valid role family." }, { status: 400 });
    if (!EXPERIENCE_LEVELS.has(experienceLevel))
      return Response.json({ error: "Choose a valid experience level." }, { status: 400 });
    if (!INTERVIEW_TIMELINES.has(interviewTimeline))
      return Response.json({ error: "Choose a valid interview timeline." }, { status: 400 });
    if (!PRIMARY_GOALS.has(primaryGoal))
      return Response.json({ error: "Choose a valid primary goal." }, { status: 400 });
    if (payload.termsAccepted !== true)
      return Response.json({ error: "Beta terms and privacy acknowledgement are required." }, { status: 400 });

    const participant = await upsertBetaParticipant({
      userId: user.userId,
      roleFamily,
      experienceLevel,
      interviewTimeline,
      primaryGoal,
      locale,
      researchConsent: payload.researchConsent === true,
      productUpdatesConsent: payload.productUpdatesConsent === true,
      termsVersion: TERMS_VERSION,
      privacyVersion: PRIVACY_VERSION,
      productVersion: PRODUCT_VERSION,
    });
    await recordUserActivity({
      id: crypto.randomUUID(),
      userId: user.userId,
      eventType: "beta_application_submitted",
      locale,
      createdAt: new Date().toISOString(),
    });
    return Response.json({ participant }, { status: 201 });
  } catch (error) {
    console.error("Beta application failed", error);
    return Response.json({ error: "Beta applications are temporarily unavailable." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!sameOrigin(request))
      return Response.json({ error: "Invalid request origin." }, { status: 403 });
    const user = await getAppUser();
    if (!user)
      return Response.json({ error: "Sign in is required." }, { status: 401 });
    const participant = await withdrawBetaParticipant(user.userId);
    await recordUserActivity({
      id: crypto.randomUUID(),
      userId: user.userId,
      eventType: "beta_application_withdrawn",
      locale: participant?.locale || "en",
      createdAt: new Date().toISOString(),
    });
    return Response.json({ participant });
  } catch (error) {
    console.error("Beta withdrawal failed", error);
    return Response.json({ error: "Beta withdrawal is temporarily unavailable." }, { status: 503 });
  }
}
