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
      intro: "填好表單後，我們會開啟你的郵件程式並整理好內容。請確認後按下寄送；網站不會在背景保存這封信。",
      feedback: {
        eyebrow: "產品意見回饋",
        title: "告訴我們哪裡可以更好",
        description: "適合回報功能建議、操作問題、翻譯或準確度體驗。",
        subject: "InterviewThread 產品意見回饋",
        topicLabel: "回饋類型",
        topicPlaceholder: "例如：語音辨識、面試問題、介面或翻譯",
        messageLabel: "你的意見",
        messagePlaceholder: "請說明你原本想完成什麼、實際發生什麼，以及你希望如何改善。",
        button: "用郵件寄出意見",
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
        button: "用郵件提出合作",
      },
      name: "姓名",
      email: "回覆信箱",
      optional: "選填",
      privacy: "請勿填入密碼、登入權杖、API 金鑰、完整履歷、面試逐字稿或其他敏感資料。",
      opening: "正在開啟你的郵件程式。請檢查內容後按下寄送。",
      fallback: "沒有自動開啟？直接寄信至",
    };
  }

  return {
    heading: "Write to the right team",
    intro: "Complete a form and we will open your email app with a structured message. Review it and press send; the website does not store this email in the background.",
    feedback: {
      eyebrow: "Product feedback",
      title: "Tell us what could work better",
      description: "Use this for feature ideas, usability problems, translation issues, or accuracy feedback.",
      subject: "InterviewThread product feedback",
      topicLabel: "Feedback area",
      topicPlaceholder: "For example: speech recognition, interview questions, interface, or translation",
      messageLabel: "Your feedback",
      messagePlaceholder: "Tell us what you were trying to do, what happened, and what would make the experience better.",
      button: "Email product feedback",
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
      button: "Email a partnership inquiry",
    },
    name: "Name",
    email: "Reply-to email",
    optional: "Optional",
    privacy: "Do not include passwords, sign-in tokens, API keys, a full resume, interview transcripts, or other sensitive information.",
    opening: "Opening your email app. Review the message, then press send.",
    fallback: "Did not open? Email",
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

  function openEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const replyTo = String(data.get("email") || "").trim();
    const topic = String(data.get("topic") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = topic ? `${formCopy.subject}: ${topic}` : formCopy.subject;
    const body = [
      `${copy.name}: ${name}`,
      `${copy.email}: ${replyTo || copy.optional}`,
      `${formCopy.topicLabel}: ${topic}`,
      "",
      message,
      "",
      `Sent from: ${window.location.href}`,
    ].join("\n");

    setStatus(copy.opening);
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="contact-inbox-form" onSubmit={openEmail}>
      <div className="contact-inbox-form-heading">
        <p className="eyebrow">{formCopy.eyebrow}</p>
        <h3>{formCopy.title}</h3>
        <p>{formCopy.description}</p>
        <a href={`mailto:${recipient}`}>{recipient}</a>
      </div>
      <div className="contact-inbox-fields">
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
        <button className="button primary" type="submit">
          {formCopy.button}
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
