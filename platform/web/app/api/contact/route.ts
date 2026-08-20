import {
  deliverInboxMessage,
  type InboxKind,
  validReplyTo,
} from "../../email-delivery.ts";

const KINDS = new Set<InboxKind>(["feedback", "partnerships"]);

function text(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    if (text(payload.website, 200)) return new Response(null, { status: 204 });

    const kind = text(payload.kind, 32) as InboxKind;
    const name = text(payload.name, 120);
    const replyTo = text(payload.email, 254);
    const topic = text(payload.topic, 160);
    const message = text(payload.message, 4000);
    const locale = text(payload.locale, 16) || "en";
    const sourceUrl = text(payload.sourceUrl, 500);

    if (!KINDS.has(kind))
      return Response.json({ error: "Invalid contact channel." }, { status: 400 });
    if (name.length < 2)
      return Response.json({ error: "Please enter your name." }, { status: 400 });
    if (replyTo && !validReplyTo(replyTo))
      return Response.json({ error: "Please enter a valid reply-to email." }, { status: 400 });
    if (topic.length < 2)
      return Response.json({ error: "Please add a topic." }, { status: 400 });
    if (message.length < 10)
      return Response.json({ error: "Please add a little more detail." }, { status: 400 });

    const submissionId = crypto.randomUUID();
    const result = await deliverInboxMessage(
      { kind, name, replyTo: replyTo || undefined, topic, message, locale, sourceUrl },
      `contact-${submissionId}`,
    );
    if (!result.delivered) {
      return Response.json(
        { error: "Automatic email delivery is temporarily unavailable." },
        { status: 503 },
      );
    }

    return Response.json({ id: submissionId }, { status: 201 });
  } catch (error) {
    console.error("Contact form submission failed", error);
    return Response.json(
      { error: "Automatic email delivery is temporarily unavailable." },
      { status: 503 },
    );
  }
}
