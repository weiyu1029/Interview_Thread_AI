"use client";

import { FormEvent, useMemo, useState } from "react";

type ContactFormKind = "feedback" | "partnerships";

const RECIPIENTS: Record<ContactFormKind, string> = {
  feedback: "feedback@interviewthreadai.com",
  partnerships: "partnerships@interviewthreadai.com",
};

function copyFor(locale: string) {
  if (locale === "zh-TW") {
    return {
      heading: "直接寫信給正確的團隊",
      intro: "填好表單後，網站會安全地將內容寄到正確的官方信箱；你不必再開啟郵件程式。",
      feedback: {
        eyebrow: "產品意見回饋",
        title: "告訴我們哪裡可以更好",
        description: "適合回報功能建議、操作問題、翻譯或準確度體驗。",
        subject: "InterviewThread 產品意見回饋",
        topicLabel: "回饋類型",
        topicPlaceholder: "例如：語音辨識、面試問題、介面或翻譯",
        messageLabel: "你的意見",
        messagePlaceholder: "請說明你原本想完成什麼、實際發生什麼，以及你希望如何改善。",
        button: "送出產品意見",
      },
      partnerships: {
        eyebrow: "合作洽詢",
        title: "一起讓面試準備更可信",
        description: "適合開源、教育、研究、社群、內容或機構合作。",
        subject: "InterviewThread 合作洽詢",
        topicLabel: "組織或合作方向",
        topicPlaceholder: "例如：大學職涯中心、研究合作或開源貢獻",
        messageLabel: "合作構想",
        messagePlaceholder: "請簡述你、你的組織、希望合作的方式，以及方便聯絡的時間。",
        button: "送出合作洽詢",
      },
      name: "姓名",
      email: "回覆信箱",
      optional: "選填",
      privacy: "請勿填入密碼、登入權杖、API 金鑰、完整履歷、面試逐字稿或其他敏感資料。",
      sending: "正在安全寄送…",
      sent: "已成功寄出；我們會透過你提供的信箱回覆。",
      error: "目前無法自動寄送，請使用下方官方信箱直接聯絡。",
      fallback: "若自動寄送失敗，請直接寄信至",
    };
  }

  return {
    heading: "Write to the right team",
    intro: "Complete a form and the website will securely deliver it to the right official inbox. You do not need to open an email app.",
    feedback: {
      eyebrow: "Product feedback",
      title: "Tell us what could work better",
      description: "Use this for feature ideas, usability problems, translation issues, or accuracy feedback.",
      subject: "InterviewThread product feedback",
      topicLabel: "Feedback area",
      topicPlaceholder: "For example: speech recognition, interview questions, interface, or translation",
      messageLabel: "Your feedback",
      messagePlaceholder: "Tell us what you were trying to do, what happened, and what would make the experience better.",
      button: "Send product feedback",
    },
    partnerships: {
      eyebrow: "Partnerships",
      title: "Build more trustworthy interview preparation with us",
      description: "Use this for open-source, education, research, community, content, or institutional collaboration.",
      subject: "InterviewThread partnership inquiry",
      topicLabel: "Organization or partnership area",
      topicPlaceholder: "For example: university career center, research, or open-source contribution",
      messageLabel: "Partnership idea",
      messagePlaceholder: "Briefly introduce yourself or your organization, the collaboration you have in mind, and a convenient time to connect.",
      button: "Send partnership inquiry",
    },
    name: "Name",
    email: "Reply-to email",
    optional: "Optional",
    privacy: "Do not include passwords, sign-in tokens, API keys, a full resume, interview transcripts, or other sensitive information.",
    sending: "Sending securely…",
    sent: "Sent successfully. We will reply to the email you provided.",
    error: "Automatic delivery is unavailable right now. Please use the official inbox below.",
    fallback: "If automatic delivery fails, email",
  };
}

function ContactInboxForm({
  kind,
  locale,
}: {
  kind: ContactFormKind;
  locale: string;
}) {
  const copy = useMemo(() => copyFor(locale), [locale]);
  const formCopy = copy[kind];
  const recipient = RECIPIENTS[kind];
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function sendEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const form = event.currentTarget;
    setSubmitting(true);
    setStatus(copy.sending);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind,
          name: data.get("name"),
          email: data.get("email"),
          topic: data.get("topic"),
          message: data.get("message"),
          website: data.get("website"),
          locale,
          sourceUrl: window.location.href,
        }),
      });
      if (!response.ok) throw new Error("Contact delivery failed");
      form.reset();
      setStatus(copy.sent);
    } catch {
      setStatus(copy.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="contact-inbox-form" onSubmit={sendEmail}>
      <div className="contact-inbox-form-heading">
        <p className="eyebrow">{formCopy.eyebrow}</p>
        <h3>{formCopy.title}</h3>
        <p>{formCopy.description}</p>
        <a href={`mailto:${recipient}`}>{recipient}</a>
      </div>
      <div className="contact-inbox-fields">
        <label className="feedback-honeypot" aria-hidden="true">
          <span>Website</span>
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <label>
          <span>{copy.name}</span>
          <input name="name" required autoComplete="name" maxLength={120} />
        </label>
        <label>
          <span>{copy.email}</span>
          <input name="email" type="email" autoComplete="email" maxLength={254} />
        </label>
        <label className="full">
          <span>{formCopy.topicLabel}</span>
          <input
            name="topic"
            required
            maxLength={160}
            placeholder={formCopy.topicPlaceholder}
          />
        </label>
        <label className="full">
          <span>{formCopy.messageLabel}</span>
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={4000}
            placeholder={formCopy.messagePlaceholder}
          />
        </label>
      </div>
      <p className="contact-inbox-privacy">{copy.privacy}</p>
      <div className="contact-inbox-actions">
        <button className="button primary" type="submit" disabled={submitting}>
          {submitting ? copy.sending : formCopy.button}
        </button>
        <p role="status">{status}</p>
      </div>
      <small>
        {copy.fallback} <a href={`mailto:${recipient}`}>{recipient}</a>
      </small>
    </form>
  );
}

export function ContactInboxForms({ locale }: { locale: string }) {
  const copy = copyFor(locale);
  return (
    <section className="contact-inbox-forms" aria-labelledby="contact-form-heading">
      <header>
        <p className="eyebrow">InterviewThread</p>
        <h2 id="contact-form-heading">{copy.heading}</h2>
        <p>{copy.intro}</p>
      </header>
      <div className="contact-inbox-form-grid">
        <ContactInboxForm kind="feedback" locale={locale} />
        <ContactInboxForm kind="partnerships" locale={locale} />
      </div>
    </section>
  );
}
