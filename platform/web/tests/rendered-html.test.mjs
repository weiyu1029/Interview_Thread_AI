import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import {
  copyFor,
  LANGUAGES,
  localeToPath,
} from "../app/i18n.ts";
import { faqCopyFor } from "../app/faq-copy.ts";
import {
  accountCopyFor,
  accountIntroCopyFor,
  openSourceLabelFor,
} from "../app/account-copy.ts";
import {
  countryLabelFor,
  marketValueFor,
  regionLabelFor,
  timeRangeLabelFor,
} from "../app/market-localization.ts";
import {
  INTERVIEW_DEPTH_COUNT,
  interviewFlowCopyFor,
  localizedInterviewQuestion,
  pronunciationTextFor,
  questionOnly,
  speechLocaleFor,
} from "../app/interview-speech.ts";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`https://careerstorymap.example${path}`, { headers: { accept: "text/html", host: "careerstorymap.example" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the CareerStoryMap product experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /CareerStoryMap/);
  assert.match(
    html,
    /Turn one job description and your real experience into interview stories you can defend\./i,
  );
  assert.match(html, /Build my free evidence map/i);
  assert.match(html, /See a 2-minute example/i);
  assert.match(html, /Resume \+ JD/);
  assert.match(html, /Evidence Map/);
  assert.match(html, /3 Interview Stories/);
  assert.match(html, /Mock Interview/);
  assert.match(html, /Every suggestion links back to your evidence/i);
  assert.match(html, /No invented achievements/i);
  assert.match(html, /Interview Proof Pack/i);
  assert.match(html, /Keyword evidence matrix/i);
  assert.match(html, /Open source/i);
  assert.match(html, /Clear answers before you build your proof pack/i);
  assert.match(html, /Will CareerStoryMap invent achievements for me/i);
  assert.match(html, /FAQPage/);
  assert.match(html, /home-faq-list/);
  assert.match(html, /href="#questions"/);
  assert.match(html, /Market Insights/i);
  assert.match(html, /All features are free and open source/i);
  assert.doesNotMatch(html, /US\$|>Pro<|>Team<|>Enterprise</i);
  assert.match(html, /mobile-nav-button/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("localizes market filters while retaining canonical values", () => {
  assert.equal(regionLabelFor("zh-TW", "Europe"), "歐洲");
  assert.equal(countryLabelFor("zh-TW", "United Kingdom"), "英國");
  assert.equal(marketValueFor("zh-TW", "Healthcare"), "醫療保健");
  assert.equal(marketValueFor("zh-TW", "Analytics"), "資料分析");
  assert.match(timeRangeLabelFor("zh-TW", "Last 3 months"), /3/);

  for (const [locale] of LANGUAGES) {
    assert.notEqual(regionLabelFor(locale, "Europe"), "");
    assert.notEqual(countryLabelFor(locale, "United Kingdom"), "");
    assert.notEqual(marketValueFor(locale, "Healthcare"), "");
    assert.notEqual(timeRangeLabelFor(locale, "Last 3 months"), "");
  }
});

test("ships product metadata, multilingual speech, account auth, and a social card", async () => {
  const [layout, page, i18n, speech, seoPage, auth, brandMark, mobileNav, readme, strategy, brandGuide] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/interview-speech.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/SeoLandingPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/chatgpt-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/BrandMark.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/MobileNav.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../../README.md", import.meta.url), "utf8"),
    readFile(new URL("../../../docs/product_strategy.md", import.meta.url), "utf8"),
    readFile(new URL("../../../docs/brand.md", import.meta.url), "utf8"),
  ]);
  await access(new URL("../public/og-careerstorymap.png", import.meta.url));
  assert.match(layout, /openGraph/);
  assert.match(layout, /twitter/);
  assert.match(layout, /\/og-careerstorymap\.png/);
  assert.match(layout, /application\/ld\+json/);
  assert.match(layout, /Build interview stories you can defend/);
  assert.match(page, /Strongest role-match evidence/);
  assert.match(page, /Real gaps/);
  assert.match(page, /Defensible interview stories/);
  assert.match(page, /10 likely follow-up questions/);
  assert.match(page, /30-minute interview preparation/);
  assert.doesNotMatch(page, /hero-panel|proof-pack-card/);
  const heroSource = page.match(
    /<section className="hero"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(heroSource);
  assert.doesNotMatch(
    heroSource,
    /Explore global demand|Automatic application|Team|Enterprise|40 languages/i,
  );
  assert.match(page, /Ollama/);
  assert.match(page, /OpenAI-compatible/);
  assert.match(page, /parseDocuments/);
  assert.match(page, /Test connection/);
  assert.match(page, /PDF · DOCX · PPTX · XLSX/);
  assert.match(page, /Nothing is submitted automatically/);
  assert.match(page, /\/api\/jobs/);
  assert.match(page, /\/api\/feedback/);
  assert.match(page, /Feedback is open to everyone/i);
  assert.match(page, /Every submission enters the same community queue/i);
  assert.match(page, /Proof-to-Role Radar/i);
  assert.match(page, /Story Signal alerts/i);
  assert.match(page, /aptograph-story-radar-settings/i);
  assert.match(page, /zero unsupported must-haves/i);
  assert.match(page, /CareerStoryMap ProofLoop/i);
  assert.match(page, /HR screening/i);
  assert.match(page, /Hiring manager/i);
  assert.match(page, /Case breakdown/i);
  assert.match(page, /SpeechRecognition/i);
  assert.match(page, /recognition\.continuous = true/);
  assert.match(page, /recognition\.interimResults = true/);
  assert.match(page, /recognition\.maxAlternatives = 3/);
  assert.match(page, /event\.resultIndex/);
  assert.match(page, /bestSpeechVoice/);
  assert.match(page, /questionOnly/);
  assert.match(page, /version: 2/);
  assert.match(page, /interviewTopicIndex/);
  assert.match(page, /addNextInterviewQuestion/);
  assert.match(page, /autoReadInterviewQuestions/);
  assert.match(page, /interview-progress/);
  assert.match(page, /keepListeningRef/);
  assert.match(page, /voice-live-transcript/);
  assert.match(page, /function openWorkspace/);
  assert.match(page, /const flowViews/);
  assert.match(page, /workspace-next-step/);
  assert.match(page, /workflow-prerequisite/);
  assert.match(page, /openWorkspace\(nextView\.id\)/);
  assert.match(page, /href=\{localizedPath\(locale, "account"\)\}/);
  assert.doesNotMatch(page, /plan=(?:pro|team)|US\$15|US\$35/);
  assert.match(page, /disabled=\{!company\.trim\(\) \|\| !role\.trim\(\)\}/);
  assert.match(page, /disabled=\{tracker\.some\(\(item\) => item\.id === job\.id\)\}/);
  assert.doesNotMatch(page, /github\.com\/weiyu1029\/careerproof-agent/);
  assert.match(page, /Evidence before polish/i);
  assert.match(page, /Connect an employer job board/i);
  assert.match(page, /Greenhouse/i);
  assert.match(page, /Lever EU/i);
  assert.match(page, /Ashby/i);
  assert.match(page, /No page scraping and no automatic application/i);
  assert.doesNotMatch(page, /🎯|💬|📋|🧭|📊/u);
  assert.equal(i18n.match(/\["[^"]+",\s*"[^"]+"\]/g)?.length, 40);
  assert.match(i18n, /RTL_LOCALES.*ar.*he.*ur.*fa/);
  const speechLocaleBlock = speech.match(
    /export const SPEECH_LOCALES[\s\S]*?\n};/,
  )?.[0];
  assert.ok(speechLocaleBlock);
  assert.equal(
    speechLocaleBlock.match(/^\s{2}(?:"[^"]+"|[a-z]+):/gmu)?.length,
    40,
  );
  assert.match(speech, /"zh-TW": "zh-TW"/);
  assert.match(speech, /no: "nb-NO"/);
  assert.match(speech, /請用你最有力/);
  assert.match(speech, /最も強い/);
  assert.match(speech, /حدّثني/);
  assert.match(speech, /सबसे मजबूत/);
  assert.match(speech, /เล่าตัวอย่าง/);
  assert.match(speech, /Nieleze/);
  assert.doesNotMatch(seoPage, /next\/link|<Link\b/);
  assert.match(seoPage, /const workspaceHref/);
  assert.match(seoPage, /seo-workflow-nav/);
  assert.match(seoPage, /href=\{workspaceHref\}/);
  assert.doesNotMatch(seoPage, /github\.com\/weiyu1029\/careerproof-agent/);
  assert.match(auth, /oai-authenticated-user-id/);
  assert.match(auth, /oai-authenticated-user-email/);
  assert.match(auth, /safeRelativeReturnPath/);
  assert.match(auth, /value\.startsWith\("\/\/"\)/);
  assert.match(brandMark, /brand-mark-orbit/);
  assert.match(brandMark, /brand-mark-letter/);
  assert.match(brandMark, /brand-mark-node-start/);
  assert.match(brandMark, /brand-mark-node-end/);
  assert.doesNotMatch(page, />CS<\/span>/);
  assert.match(mobileNav, /aria-expanded=\{open\}/);
  assert.match(mobileNav, /pointerdown/);
  assert.match(mobileNav, /Escape/);
  for (const publicSurface of [layout, page, readme, strategy, brandGuide]) {
    assert.doesNotMatch(publicSurface, /CareerProof/);
  }
});

test("keeps interview questions, speech, and progression locked to all 40 locales", () => {
  assert.equal(INTERVIEW_DEPTH_COUNT, 5);
  assert.match(
    localizedInterviewQuestion("en", 0, "SQL", "experimentation"),
    /Walk me through your strongest SQL example/i,
  );
  assert.match(
    localizedInterviewQuestion("zh-TW", 0, "SQL", "實驗設計"),
    /請用你最有力的「SQL」經驗/,
  );
  assert.match(
    localizedInterviewQuestion("zh-TW", 4, "SQL", "實驗設計"),
    /前九十天/,
  );

  const chineseQuestion =
    "目前最強：證據 80/100。\n\n請用你最有力的「SQL」經驗帶我走過一次：你負責什麼問題、做了什麼關鍵判斷，最後帶來什麼改變？";
  assert.match(questionOnly(chineseQuestion), /^請用你最有力/);
  const spokenChinese = pronunciationTextFor(chineseQuestion, "zh-TW");
  assert.match(spokenChinese, /^請用你最有力/);
  assert.match(spokenChinese, /S Q L/);
  assert.doesNotMatch(spokenChinese, /^S Q L$/);

  for (const [locale] of LANGUAGES) {
    assert.ok(speechLocaleFor(locale), locale);
    const flow = interviewFlowCopyFor(locale);
    assert.equal(flow.stages.length, INTERVIEW_DEPTH_COUNT, locale);
    assert.ok(flow.nextQuestion, locale);
    assert.ok(flow.newTopic, locale);
    assert.ok(flow.autoRead, locale);
    assert.ok(flow.languageLocked, locale);
    for (let turn = 0; turn < INTERVIEW_DEPTH_COUNT; turn += 1) {
      assert.ok(
        localizedInterviewQuestion(locale, turn, "SQL", "experimentation"),
        `${locale}:${turn}`,
      );
    }
  }
});

test("renders a localized registration page for free open-source access", async () => {
  const examples = [
    ["/en/account", openSourceLabelFor("en"), accountCopyFor("en")],
    ["/zh-tw/account", openSourceLabelFor("zh-TW"), accountCopyFor("zh-TW")],
    ["/ja/account", openSourceLabelFor("ja"), accountCopyFor("ja")],
  ];

  for (const [path, plan, labels] of examples) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    const intro = accountIntroCopyFor(path.includes("zh-tw") ? "zh-TW" : path.includes("ja") ? "ja" : "en");
    assert.ok(html.includes(labels.account), path);
    assert.ok(html.includes(labels.signIn), path);
    assert.ok(html.includes(intro.title), path);
    assert.ok(html.includes(intro.skipSignIn), path);
    assert.ok(html.includes(labels.noCharge), path);
    assert.ok(html.includes(labels.privacy), path);
    assert.ok(html.includes(plan), path);
    assert.match(html, /\/signin-with-chatgpt\?return_to=/, path);
    assert.match(html, /name="robots" content="noindex, nofollow"/, path);
    assert.doesNotMatch(html, /account-steps|account-plan-grid|account-plans/, path);
    assert.doesNotMatch(html, /type="password"|card number|A-number|US\$|>Pro<|>Team</i, path);
  }
});

test("provides complete account safety copy in every supported language", () => {
  assert.equal(accountCopyFor("en").signIn, "Continue securely");
  assert.equal(accountCopyFor("zh-TW").signIn, "安全地繼續");

  for (const [locale] of LANGUAGES) {
    const labels = accountCopyFor(locale);
    assert.ok(labels.account, locale);
    assert.ok(labels.signIn, locale);
    assert.ok(labels.signOut, locale);
    assert.ok(labels.selected, locale);
    assert.ok(labels.noCharge, locale);
    assert.ok(labels.privacy, locale);
    assert.doesNotMatch(labels.signIn, /ChatGPT/i, locale);
    assert.ok(accountIntroCopyFor(locale).title, locale);
    assert.ok(accountIntroCopyFor(locale).description, locale);
    assert.ok(accountIntroCopyFor(locale).skipSignIn, locale);
    assert.ok(openSourceLabelFor(locale), locale);
  }
});

test("provides a complete, product-specific FAQ in every supported language", () => {
  for (const [locale] of LANGUAGES) {
    const faq = faqCopyFor(locale);
    assert.ok(faq.eyebrow, locale);
    assert.ok(faq.title, locale);
    assert.ok(faq.intro, locale);
    assert.equal(faq.items.length, 7, locale);
    for (const item of faq.items) {
      assert.ok(item.question, locale);
      assert.ok(item.answer, locale);
      assert.doesNotMatch(item.question, /JobOps/i, locale);
      assert.doesNotMatch(item.answer, /JobOps/i, locale);
    }
  }
});

test("server-renders every searchable CareerStoryMap page", async () => {
  const pages = [
    ["/en/resume-job-description-match", /Match your resume to a job description/i],
    ["/en/career-story-builder", /Build interview stories from work you can prove/i],
    ["/en/ai-mock-interview", /Practice the interview behind the interview/i],
    ["/en/resume-keyword-analyzer", /Find the keywords that matter/i],
    ["/en/job-match-recommendations", /job recommendations your story can actually support/i],
    ["/en/career-market-insights", /where career demand is moving/i],
  ];
  for (const [path, heading] of pages) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, heading, path);
    assert.match(html, /CareerStoryMap/i, path);
    assert.match(html, /application\/ld\+json/i, path);
  }
});

test("search pages emit route-specific metadata without the homepage social card", async () => {
  const examples = [
    ["/en/ai-mock-interview", "AI Mock Interview", "Rehearse with evidence-grounded AI interviewers"],
    ["/en/career-market-insights", "Market Insights", "Explore job openings, momentum"],
  ];
  for (const [path, title, description] of examples) {
    const response = await render(path);
    const html = await response.text();
    assert.match(html, new RegExp(`<title>${title} \\| CareerStoryMap<\\/title>`));
    assert.match(html, new RegExp(`name="description" content="${description}`));
    assert.match(html, new RegExp(`property="og:title" content="${title} \\| CareerStoryMap"`));
    assert.match(html, new RegExp(`name="twitter:title" content="${title} \\| CareerStoryMap"`));
    assert.doesNotMatch(html, /og-careerstorymap\.png/);
  }
});

test("server-renders all 40 indexable language home pages", async () => {
  assert.equal(LANGUAGES.length, 40);
  for (const [locale] of LANGUAGES) {
    const response = await render(`/${localeToPath(locale)}`);
    assert.equal(response.status, 200, locale);
    const html = await response.text();
    assert.ok(
      html.includes(
        locale === "en"
          ? "Turn one job description and your real experience into interview stories you can defend."
          : copyFor(locale).heroTitle,
      ),
      locale,
    );
    assert.ok(html.includes(`lang="${locale}"`), locale);
  }
});

test("localized search pages emit canonical and reciprocal hreflang links", async () => {
  const examples = [
    ["/zh-tw/ai-mock-interview", "AI 模擬面試", "zh-TW"],
    ["/ja/career-story-builder", "キャリアストーリー作成", "ja"],
    ["/de/resume-keyword-analyzer", "Lebenslauf-Keyword-Analyse", "de"],
    ["/ar/job-match-recommendations", copyFor("ar").recommendations, "ar"],
  ];

  for (const [path, title, locale] of examples) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.ok(html.includes(title), path);
    assert.match(
      html,
      new RegExp(`<link rel="canonical" href="https://careerstorymap\\.example${path}">`),
      path,
    );
    assert.match(html, new RegExp(`hreflang="${locale}"`), path);
    assert.match(html, /hreflang="en"/, path);
    assert.match(html, /hreflang="zh-TW"/, path);
    assert.match(html, /hreflang="x-default"/, path);
    assert.equal((html.match(/rel="alternate"/g) ?? []).length, 41, path);
  }
});

test("sitemap publishes all 280 localized canonical pages and their alternates", async () => {
  const response = await render("/sitemap.xml");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /xml/i);
  const xml = await response.text();
  assert.equal((xml.match(/<url>/g) ?? []).length, LANGUAGES.length * 7);
  for (const [locale] of LANGUAGES) {
    const pathLocale = localeToPath(locale);
    assert.ok(
      xml.includes(`<loc>https://careerstorymap.com/${pathLocale}</loc>`),
      locale,
    );
    assert.ok(
      xml.includes(
        `<loc>https://careerstorymap.com/${pathLocale}/ai-mock-interview</loc>`,
      ),
      locale,
    );
  }
  assert.match(xml, /hreflang="x-default" href="https:\/\/careerstorymap\.com\/en\/ai-mock-interview"/);
  assert.doesNotMatch(
    xml,
    /<loc>https:\/\/careerstorymap\.com\/ai-mock-interview<\/loc>/,
  );
});

test("legacy unprefixed search pages redirect to English canonicals", async () => {
  const response = await render("/ai-mock-interview");
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "/en/ai-mock-interview");
});
