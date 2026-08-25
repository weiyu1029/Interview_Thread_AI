import {
  deliverInboxMessage,
  type InboxKind,
  validReplyTo,
} from "../../email-delivery.ts";
import {
  jsonRequestGuardResponse,
  readJsonBody,
  validateJsonRequest,
} from "../request-security.ts";

const KINDS = new Set<InboxKind>(["feedback", "partnerships"]);
const MAX_CONTACT_REQUEST_BYTES = 32 * 1024;

function text(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function sameOriginSource(request: Request, value: string) {
  if (!value) return "";
  try {
    const source = new URL(value);
    return source.origin === new URL(request.url).origin ? source.href : "";
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const unsafeRequest = jsonRequestGuardResponse(
      validateJsonRequest(request, MAX_CONTACT_REQUEST_BYTES),
    );
    if (unsafeRequest) return unsafeRequest;

    const body = await readJsonBody<Record<string, unknown>>(
      request,
      MAX_CONTACT_REQUEST_BYTES,
    );
    const invalidBody = jsonRequestGuardResponse(body);
    if (invalidBody) return invalidBody;
    const payload = body.payload;
    if (text(payload.website, 200)) return new Response(null, { status: 204 });

    const kind = text(payload.kind, 32) as InboxKind;
    const name = text(payload.name, 120);
    const replyTo = text(payload.email, 254);
    const topic = text(payload.topic, 160);
    const message = text(payload.message, 4000);
    const locale = text(payload.locale, 16) || "en";
    const sourceUrl = sameOriginSource(request, text(payload.sourceUrl, 500));

    if (!KINDS.has(kind))
      return Response.json({ error: "Invalid contact channel." }, { status: 400 });
    if (name.length < 2)
      return Response.json({ error: "Please enter your name." }, { status: 400 });
    if (replyTo && !validReplyTo(replyTo))
      return Response.json({ error: "Please enter a valid reply-to email." }, { status: 400 });
    if (kind === "partnerships" && !replyTo)
      return Response.json(
        { error: "Please enter an email so the partnerships team can reply." },
        { status: 400 },
      );
    if (topic.length < 2)
      return Response.json({ error: "Please add a topic." }, { status: 400 });
    if (message.length < 10)
      return Response.json({ error: "Please add a little more detail." }, { status: 400 });

    const submissionId = crypto.randomUUID();
    const result = await deliverInboxMessage(
      { kind, name, replyTo: replyTo || undefined, topic, message, locale, sourceUrl },
      `contact-${submissionId}`,
      "api_contact",
    );
    if (!result.delivered) {
      return Response.json(
        { error: "Automatic email delivery is temporarily unavailable." },
        { status: 503 },
      );
    }

    return Response.json({ id: submissionId }, { status: 201 });
  } catch {
    // Raw provider/database exceptions may contain request or account details.
    return Response.json(
      { error: "Automatic email delivery is temporarily unavailable." },
      { status: 503 },
    );
  }
}
