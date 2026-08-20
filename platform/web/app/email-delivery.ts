const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";

export type InboxKind = "feedback" | "partnerships";

export type InboxMessage = {
  kind: InboxKind;
  name: string;
  replyTo?: string;
  topic: string;
  message: string;
  locale: string;
  sourceUrl?: string;
  metadata?: Record<string, string | number | undefined>;
};

export type DeliveryResult =
  | { delivered: true; providerId: string | null }
  | { delivered: false; reason: "not_configured" | "provider_error" };

const DEFAULT_RECIPIENTS: Record<InboxKind, string> = {
  feedback: "feedback@interviewthreadai.com",
  partnerships: "partnerships@interviewthreadai.com",
};

function emailEnvironment() {
  return process.env as Record<string, string | undefined>;
}

function recipientFor(kind: InboxKind) {
  const environment = emailEnvironment();
  const configured =
    kind === "feedback"
      ? environment.EMAIL_FEEDBACK_TO
      : environment.EMAIL_PARTNERSHIPS_TO;
  return configured?.trim() || DEFAULT_RECIPIENTS[kind];
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return replacements[character];
  });
}

function labelFor(kind: InboxKind) {
  return kind === "feedback" ? "Product feedback" : "Partnership inquiry";
}

function contentFor(input: InboxMessage) {
  const metadata = Object.entries(input.metadata || {}).filter(
    ([, value]) => value !== undefined && value !== "",
  );
  const lines = [
    `Type: ${labelFor(input.kind)}`,
    `Name: ${input.name}`,
    `Reply-to: ${input.replyTo || "Not provided"}`,
    `Topic: ${input.topic}`,
    `Locale: ${input.locale}`,
    ...(input.sourceUrl ? [`Source: ${input.sourceUrl}`] : []),
    ...metadata.map(([key, value]) => `${key}: ${String(value)}`),
    "",
    input.message,
  ];
  const htmlMetadata = [
    ["Type", labelFor(input.kind)],
    ["Name", input.name],
    ["Reply-to", input.replyTo || "Not provided"],
    ["Topic", input.topic],
    ["Locale", input.locale],
    ...(input.sourceUrl ? [["Source", input.sourceUrl]] : []),
    ...metadata.map(([key, value]) => [key, String(value)]),
  ];

  return {
    text: lines.join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2933;max-width:680px">
        <h1 style="font-size:22px;margin:0 0 20px">${escapeHtml(labelFor(input.kind))}</h1>
        <table style="border-collapse:collapse;width:100%;margin-bottom:24px">
          ${htmlMetadata
            .map(
              ([label, value]) =>
                `<tr><th style="text-align:left;vertical-align:top;padding:6px 16px 6px 0;color:#52606d">${escapeHtml(label)}</th><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`,
            )
            .join("")}
        </table>
        <div style="white-space:pre-wrap;border-top:1px solid #d9e2ec;padding-top:20px">${escapeHtml(input.message)}</div>
      </div>
    `,
  };
}

export async function deliverInboxMessage(
  input: InboxMessage,
  idempotencyKey: string,
): Promise<DeliveryResult> {
  const environment = emailEnvironment();
  const apiKey = environment.RESEND_API_KEY?.trim();
  const from = environment.EMAIL_FROM?.trim();
  if (!apiKey || !from) return { delivered: false, reason: "not_configured" };

  const content = contentFor(input);
  const response = await fetch(RESEND_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "idempotency-key": idempotencyKey.slice(0, 256),
    },
    body: JSON.stringify({
      from,
      to: [recipientFor(input.kind)],
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      subject: `[InterviewThread] ${labelFor(input.kind)}: ${input.topic}`,
      text: content.text,
      html: content.html,
      tags: [
        { name: "source", value: "website" },
        { name: "kind", value: input.kind },
      ],
    }),
  });

  if (!response.ok) {
    console.error("Email delivery provider returned an error", response.status);
    return { delivered: false, reason: "provider_error" };
  }

  const payload = (await response.json().catch(() => null)) as {
    id?: string;
  } | null;
  return { delivered: true, providerId: payload?.id || null };
}

export function validReplyTo(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}
