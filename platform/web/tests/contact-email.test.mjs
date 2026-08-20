import assert from "node:assert/strict";
import test from "node:test";

import { POST } from "../app/api/contact/route.ts";

test("contact forms deliver through the configured transactional inbox", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalEnvironment = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FEEDBACK_TO: process.env.EMAIL_FEEDBACK_TO,
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    for (const [name, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  process.env.RESEND_API_KEY = "test-key";
  process.env.EMAIL_FROM = "InterviewThread <notifications@send.interviewthreadai.com>";
  process.env.EMAIL_FEEDBACK_TO = "feedback@interviewthreadai.com";

  let delivery;
  globalThis.fetch = async (input, init) => {
    delivery = { input: String(input), init };
    return Response.json({ id: "email_123" });
  };

  const response = await POST(
    new Request("https://interviewthreadai.com/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: "feedback",
        name: "Test Candidate",
        email: "candidate@example.com",
        topic: "Interview question quality",
        message: "The next question should reflect the previous answer.",
        locale: "en",
        sourceUrl: "https://interviewthreadai.com/en/contact",
      }),
    }),
  );

  assert.equal(response.status, 201);
  assert.equal(delivery.input, "https://api.resend.com/emails");
  assert.equal(delivery.init.headers.authorization, "Bearer test-key");
  const body = JSON.parse(delivery.init.body);
  assert.deepEqual(body.to, ["feedback@interviewthreadai.com"]);
  assert.equal(body.reply_to, "candidate@example.com");
  assert.match(body.subject, /Interview question quality/);
  assert.match(body.text, /previous answer/);
});

test("contact forms reject invalid payloads before sending", async () => {
  const response = await POST(
    new Request("https://interviewthreadai.com/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: "feedback",
        name: "A",
        email: "not-an-email",
        topic: "",
        message: "short",
      }),
    }),
  );

  assert.equal(response.status, 400);
});
