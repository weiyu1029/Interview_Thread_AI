import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import {
  copyFor,
  LANGUAGES,
  localeToPath,
  walkthroughLabelFor,
} from "../app/i18n.ts";
import {
  faqCopyFor,
  optionalCareerSourceCopyFor,
} from "../app/faq-copy.ts";
import {
  accountCopyFor,
  accountIntroCopyFor,
  openSourceLabelFor,
} from "../app/account-copy.ts";
import { authCopyFor } from "../app/auth-copy.ts";
import {
  INFORMATION_PAGE_KEYS,
  informationLabelsFor,
  informationPageCopyFor,
} from "../app/site-information.ts";
import {
  countryLabelFor,
  marketValueFor,
  regionLabelFor,
  timeRangeLabelFor,
  workStyleLabelFor,
} from "../app/market-localization.ts";
import {
  INTERVIEW_DEPTH_COUNT,
  interviewFlowCopyFor,
  localizedInterviewQuestion,
  localizedPersonaDetails,
  localizedPersonaLabel,
  pronunciationTextFor,
  questionOnly,
  speechLocaleFor,
} from "../app/interview-speech.ts";

async function render(path = "/", authenticated = false) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const headers = {
    accept: "text/html",
    host: "interviewthread.example",
    ...(authenticated
      ? {
          "oai-authenticated-user-id": "test-user",
          "oai-authenticated-user-email": "candidate@example.com",
        }
      : {}),
  };
  return worker.fetch(
    new Request(`https://interviewthread.example${path}`, { headers }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the InterviewThread product experience", async () => {
  const response = await render("/en", true);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /InterviewThread/);
  assert.match(
    html,
    /Practice the interview for the job you want\./i,
  );
  assert.match(html, /Start my free mock interview/i);
  assert.match(html, /Watch the 60-second walkthrough/i);
  assert.match(html, /Upload your resume/);
  assert.match(html, /Add the job post/);
  assert.match(html, /Get your interview plan/);
  assert.match(html, /Practice with AI/);
  assert.match(html, /Generic AI can write fast/i);
  assert.match(html, /Every suggestion links back to your evidence/i);
  assert.match(html, /No invented achievements/i);
  assert.match(html, /Interview plan/i);
  assert.match(html, /Add your resume and the job post/i);
  assert.match(html, /Add LinkedIn, portfolio, or another career source/i);
  assert.match(html, /A link labels the source/i);
  assert.match(html, /Create my interview plan/i);
  assert.match(html, /Open source/i);
  assert.match(html, /Simple answers before you start/i);
  assert.match(html, /Will InterviewThread invent achievements for me/i);
  assert.match(html, /FAQPage/);
  assert.match(html, /home-faq-list/);
  assert.match(html, /href="#questions"/);
  assert.match(html, /Market Insights/i);
  assert.match(html, /All features are free and open source/i);
  assert.match(html, /Terms of use/i);
  assert.match(html, /Privacy policy/i);
  assert.match(html, /href="\/en\/about"/i);
  assert.doesNotMatch(html, /US\$|>Pro<|>Team<|>Enterprise</i);
  assert.match(html, /mobile-nav-button/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("publishes truthful About, Contact, Terms, and Privacy pages", async () => {
  for (const page of INFORMATION_PAGE_KEYS) {
    const response = await render(`/en/${page}`);
    assert.equal(response.status, 200, page);
    const html = await response.text();
    assert.match(html, /InterviewThread/);
    assert.match(html, new RegExp(`href="/en/${page}"|${informationLabelsFor("en")[page]}`, "i"));
    assert.match(html, /\/en\/about/);
    assert.match(html, /\/en\/contact/);
    assert.match(html, /\/en\/terms/);
    assert.match(html, /\/en\/privacy/);
  }

  const about = await (await render("/en/about")).text();
  assert.match(about, /generic AI/i);
  assert.match(about, /second language/i);
  assert.match(about, /Truth before polish/i);

  const contact = await (await render("/en/contact")).text();
  assert.match(contact, /private report/i);
  assert.match(contact, /Never post a resume/i);

  const terms = await (await render("/en/terms")).text();
  assert.match(terms, /does not apply for jobs/i);
  assert.match(terms, /must not use InterviewThread to fabricate/i);

  const privacy = await (await render("/en/privacy")).text();
  assert.match(privacy, /not stored/i);
  assert.match(privacy, /does not store raw voice audio/i);
  assert.match(privacy, /do not contain the resume, job description, answer transcript/i);
  assert.match(privacy, /request access, correction, export, or deletion/i);

  const chinese = await (await render("/zh-tw/about")).text();
  assert.match(chinese, /我們的出發點/);
  assert.match(chinese, /真實優先於修飾/);
});

test("publishes an opt-in closed-beta lifecycle without blocking public tools", async () => {
  const publicResponse = await render("/en/beta");
  assert.equal(publicResponse.status, 200);
  const publicHtml = await publicResponse.text();
  assert.match(publicHtml, /Help test InterviewThread before wider release/i);
  assert.match(publicHtml, /Apply to a testing cohort/i);
  assert.match(publicHtml, /Sign in to apply/i);
  assert.match(publicHtml, /How this becomes a release/i);
  assert.match(publicHtml, /No invented achievement in the audited evaluation set/i);
  assert.doesNotMatch(publicHtml, /<form[^>]+beta-form/i);

  const signedInResponse = await render("/en/beta", true);
  assert.equal(signedInResponse.status, 200);
  const signedInHtml = await signedInResponse.text();
  assert.match(signedInHtml, /Apply for closed beta/i);

  const chinese = await (await render("/zh-tw/beta")).text();
  assert.match(chinese, /在全面開放前，一起把 InterviewThread 測好/);
  assert.match(chinese, /登入後申請/);

  const [route, application, database, migration, iteration] = await Promise.all([
    readFile(new URL("../app/api/beta/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/BetaApplication.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_lonely_vector.sql", import.meta.url), "utf8"),
    readFile(new URL("../../../docs/product_iteration.md", import.meta.url), "utf8"),
  ]);
  assert.match(route, /termsAccepted/);
  assert.match(route, /PRIVACY_VERSION/);
  assert.match(application, /name="termsAccepted"/);
  assert.match(application, /name="researchConsent"/);
  assert.match(application, /name="productUpdatesConsent"/);
  assert.match(database, /beta_participants/);
  assert.match(database, /feedback_context/);
  assert.match(database, /beta_application_withdrawn/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS `beta_participants`/);
  assert.match(iteration, /Closed beta/);
  assert.match(iteration, /Release gates/);
  assert.match(iteration, /S0 — Stop/);
});

test("localizes information navigation for all supported languages", () => {
  for (const [locale] of LANGUAGES) {
    const labels = informationLabelsFor(locale);
    assert.ok(labels.heading);
    for (const page of INFORMATION_PAGE_KEYS) {
      assert.ok(labels[page], `${locale} is missing ${page}`);
      assert.ok(informationPageCopyFor(locale, page).sections.length > 0);
    }
  }
});

test("keeps marketing public while requiring sign-in for every personal workflow", async () => {
  const publicResponse = await render("/en");
  assert.equal(publicResponse.status, 200);
  const publicHtml = await publicResponse.text();
  assert.match(publicHtml, /workspace-login-gate/);
  assert.match(publicHtml, /Sign in is required to use personal tools/i);
  assert.match(publicHtml, /\/en\/account\?return_to=/);
  assert.doesNotMatch(publicHtml, /\/signin-with-chatgpt\?return_to=/);
  assert.doesNotMatch(publicHtml, /class="workspace"/);

  const privateResponse = await render("/en", true);
  assert.equal(privateResponse.status, 200);
  const privateHtml = await privateResponse.text();
  assert.match(privateHtml, /class="workspace"/);
  assert.doesNotMatch(privateHtml, /workspace-login-gate/);

  const [feedbackRoute, activityRoute, db] = await Promise.all([
    readFile(new URL("../app/api/feedback/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/activity/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/index.ts", import.meta.url), "utf8"),
  ]);
  assert.match(feedbackRoute, /getAppUser/);
  assert.match(feedbackRoute, /status: 401/);
  assert.match(activityRoute, /getAppUser/);
  assert.match(activityRoute, /USER_ACTIVITY_TYPES/);
  assert.match(db, /feedback_owners/);
  assert.match(db, /user_activity_events/);
  assert.doesNotMatch(db, /resume|job_description|transcript|voice_recording/i);
});

test("keeps every social sign-in click inside a real route instead of returning 404", async () => {
  for (const provider of ["google", "github", "linkedin"]) {
    const response = await render(
      `/api/auth/start/${provider}?return_to=${encodeURIComponent("/en#workspace")}`,
    );
    assert.equal(response.status, 302, provider);
    const location = response.headers.get("location") || "";
    assert.match(location, /\/en\/account\?/, provider);
    assert.match(location, /auth_error=provider_not_configured/, provider);
    assert.match(location, new RegExp(`provider=${provider}`), provider);
  }

  const invalidCallback = await render("/api/auth/callback/google?state=invalid");
  assert.equal(invalidCallback.status, 302);
  assert.match(invalidCallback.headers.get("location") || "", /auth_error=invalid_state/);

  const previousAuthEnvironment = Object.fromEntries(
    ["AUTH_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "APP_BASE_URL"].map(
      (name) => [name, process.env[name]],
    ),
  );
  try {
    process.env.AUTH_SECRET = "test-only-auth-secret-with-at-least-32-characters";
    process.env.GOOGLE_CLIENT_ID = "test-google-client";
    process.env.GOOGLE_CLIENT_SECRET = "test-google-secret";
    process.env.APP_BASE_URL = "https://interviewthread.example";
    const configuredResponse = await render(
      `/api/auth/start/google?locale=zh-tw&return_to=${encodeURIComponent("/zh-tw#workspace")}`,
    );
    assert.equal(configuredResponse.status, 302);
    const providerLocation = new URL(configuredResponse.headers.get("location"));
    assert.equal(providerLocation.origin, "https://accounts.google.com");
    assert.equal(providerLocation.searchParams.get("code_challenge_method"), "S256");
    assert.equal(providerLocation.searchParams.get("scope"), "openid email profile");
    assert.equal(
      providerLocation.searchParams.get("redirect_uri"),
      "https://interviewthread.example/api/auth/callback/google",
    );
    const stateCookie = configuredResponse.headers.get("set-cookie") || "";
    assert.match(stateCookie, /interviewthread_oauth_google=/);
    assert.match(stateCookie, /HttpOnly/);
    assert.match(stateCookie, /SameSite=Lax/);
    assert.match(stateCookie, /Secure/);
  } finally {
    for (const [name, value] of Object.entries(previousAuthEnvironment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test("localizes the 60-second walkthrough CTA for every supported language", () => {
  const english = copyFor("en");
  for (const [locale] of LANGUAGES) {
    assert.notEqual(walkthroughLabelFor(locale), "");
    assert.match(walkthroughLabelFor(locale), /60|６０|৬০|۶۰/);
    if (locale !== "en") {
      assert.notEqual(
        copyFor(locale).interview,
        english.interview,
        `${locale} must not inherit the English Interview Studio label`,
      );
    }
  }
});

test("ships a web-ready 60-second walkthrough with captions and poster", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(pageSource, /interviewthread-60-second-walkthrough\.mp4/i);
  assert.match(pageSource, /interviewthread-walkthrough-en\.vtt/i);
  assert.match(pageSource, /interviewthread-walkthrough-zh-TW\.vtt/i);
  assert.match(pageSource, /interviewthread-walkthrough-poster\.png/i);
  assert.match(pageSource, /aria-modal="true"/i);
  assert.match(pageSource, /walkthroughVideoRef/);
  assert.match(pageSource, /walkthroughChapters/);
  assert.match(pageSource, /video\.currentTime = chapter\.time/);
  assert.match(pageSource, /Bilingual narration/);

  const video = await readFile(
    new URL("../public/interviewthread-60-second-walkthrough.mp4", import.meta.url),
  );
  assert.ok(video.length > 1_000_000);
  await access(new URL("../public/interviewthread-walkthrough-en.vtt", import.meta.url));
  const chineseCaptions = await readFile(
    new URL("../public/interviewthread-walkthrough-zh-TW.vtt", import.meta.url),
    "utf8",
  );
  assert.match(chineseCaptions, /用真實證據準備面試/);
  assert.match(chineseCaptions, /查看具體回饋/);
  const [builder, narration, validator] = await Promise.all([
    readFile(new URL("../scripts/build-walkthrough.swift", import.meta.url), "utf8"),
    readFile(new URL("../scripts/build-walkthrough-narration.sh", import.meta.url), "utf8"),
    readFile(new URL("../scripts/validate-walkthrough.swift", import.meta.url), "utf8"),
  ]);
  assert.match(builder, /makeFrame/);
  assert.match(builder, /rippleTime/);
  assert.match(builder, /scene\.highlight/);
  assert.match(narration, /Samantha/);
  assert.match(narration, /Meijia/);
  assert.match(validator, /audio_tracks|audioTracks/);
  await access(new URL("../public/interviewthread-walkthrough-poster.png", import.meta.url));
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
    assert.notEqual(workStyleLabelFor(locale, "Remote"), "");
  }
  assert.equal(workStyleLabelFor("ko", "Remote"), "원격");
});

test("ships product metadata, multilingual speech, account auth, and a social card", async () => {
  const [layout, page, globals, i18n, speech, seoPage, siteFooter, auth, appAuth, oauthSecurity, oauthCallback, brandMark, mobileNav, readme, strategy, brandGuide] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/interview-speech.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/SeoLandingPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SiteFooter.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/chatgpt-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/oauth-security.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/auth/callback/[provider]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/BrandMark.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/MobileNav.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../../README.md", import.meta.url), "utf8"),
    readFile(new URL("../../../docs/product_strategy.md", import.meta.url), "utf8"),
    readFile(new URL("../../../docs/brand.md", import.meta.url), "utf8"),
  ]);
  await access(new URL("../public/og-interviewthread.png", import.meta.url));
  assert.match(layout, /openGraph/);
  assert.match(layout, /twitter/);
  assert.match(layout, /\/og-interviewthread\.png/);
  assert.match(layout, /application\/ld\+json/);
  assert.match(layout, /Free AI mock interview practice/);
  assert.doesNotMatch(layout, /Geist_Mono|font-geist-mono/);
  assert.match(globals, /--font-serif-body/);
  assert.match(globals, /Noto Serif TC/);
  assert.match(globals, /Yu Mincho/);
  assert.match(globals, /Batang/);
  assert.doesNotMatch(globals, /ui-sans-serif|system-ui|sans-serif|font-geist-mono|monospace/);
  const progressLabelCss =
    globals.match(/\.workspace-progress li b\s*\{([^}]*)\}/s)?.[1] ?? "";
  const journeyLabelCss =
    globals.match(/\.journey-strip b\s*\{([^}]*)\}/s)?.[1] ?? "";
  assert.match(progressLabelCss, /white-space:\s*normal/);
  assert.match(progressLabelCss, /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(progressLabelCss, /ellipsis|overflow:\s*hidden/);
  assert.match(journeyLabelCss, /white-space:\s*normal/);
  assert.doesNotMatch(journeyLabelCss, /ellipsis|overflow:\s*hidden/);
  assert.match(page, /What you can prove/);
  assert.match(page, /What is missing/);
  assert.match(page, /Stories to practice/);
  assert.match(page, /Tell us about the interview \(optional\)/);
  assert.match(page, /type="date"/);
  assert.match(page, /type="time"/);
  assert.match(page, /Likely questions in the interview/);
  assert.match(page, /Questions we will prepare/);
  assert.match(page, /predictedPreparationCount/);
  assert.match(page, /preparation for a \$\{interviewDuration\}-minute interview/);
  assert.match(page, /Product Analyst applying to a new role/);
  assert.match(page, /Show this example/);
  assert.match(page, /not your information/);
  assert.match(page, /textarea-example-label/);
  assert.match(page, /exampleLabelFor/);
  assert.doesNotMatch(page, /For example: what this candidate has actually done/);
  assert.doesNotMatch(page, /For example: what this employer is looking for/);
  assert.match(page, /80–100/);
  assert.match(page, /45–79/);
  assert.match(page, /More important job requirements count more/i);
  assert.match(page, /item\.score/);
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
  assert.match(page, /Feedback is linked to your account/i);
  assert.match(page, /Signed-in users can submit feedback/i);
  assert.match(page, /Proof-to-Role Radar/i);
  assert.match(page, /Story Signal alerts/i);
  assert.match(page, /aptograph-story-radar-settings/i);
  assert.match(page, /zero unsupported must-haves/i);
  assert.match(page, /InterviewThread ProofLoop/i);
  assert.match(page, /HR screening/i);
  assert.match(page, /Hiring manager/i);
  assert.match(page, /Technical interviewer/i);
  assert.match(page, /System design interviewer/i);
  assert.match(page, /Cross-functional partner/i);
  assert.match(page, /Culture and values interviewer/i);
  assert.match(page, /Case breakdown/i);
  assert.match(page, /LeetCode Explore/i);
  assert.match(page, /Exercism/i);
  assert.match(page, /System Design Primer/i);
  assert.match(page, /not a coach and not an AI assistant/i);
  assert.match(page, /SpeechRecognition/i);
  assert.match(page, /SpeechRecognitionPhrase/i);
  assert.match(page, /recognition\.continuous = true/);
  assert.match(page, /recognition\.interimResults = true/);
  assert.match(page, /recognition\.maxAlternatives = 5/);
  assert.match(page, /recognitionAlternativeScore/);
  assert.match(page, /speechVocabularyFor/);
  assert.match(page, /event\.resultIndex/);
  assert.match(page, /bestSpeechVoice/);
  assert.match(page, /questionOnly/);
  assert.match(page, /version: 3/);
  assert.match(page, /See guidance and answer signals after every response/i);
  assert.match(page, /No hints or live scores/i);
  assert.match(page, /changeInterviewMode/);
  assert.match(page, /finishRealisticInterview/);
  assert.match(page, /interviewScoreHistory/);
  assert.match(page, /averageInterviewScores/);
  assert.match(page, /displayedInterviewScores/);
  assert.match(page, /realisticSessionActive/);
  assert.match(page, /realistic-session-panel/);
  assert.match(page, /End interview and review/i);
  assert.match(page, /questionOnly\(plannedOpening\)/);
  assert.match(page, /questionOnly\(nextQuestion\)/);
  assert.match(page, /interviewTopicIndex/);
  assert.match(page, /interviewTopicsFor/);
  assert.match(page, /gapTopicOpening/);
  assert.match(page, /nextInterviewTopic\.focusLabel/);
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
  assert.match(page, /github\.com\/weiyu1029\/careerproof-agent/);
  assert.match(page, /Evidence before polish/i);
  assert.match(page, /Connect an employer job board/i);
  assert.match(page, /Greenhouse/i);
  assert.match(page, /Lever EU/i);
  assert.match(page, /Ashby/i);
  assert.match(page, /No page scraping and no automatic application/i);
  const jobsRoute = await readFile(new URL("../app/api/jobs/route.ts", import.meta.url), "utf8");
  assert.match(jobsRoute, /includeGreenhouseContent/);
  assert.match(jobsRoute, /lightweight listing/);
  assert.match(jobsRoute, /detailCoverage/);
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
  assert.match(siteFooter, /github\.com\/weiyu1029\/careerproof-agent/);
  assert.match(auth, /oai-authenticated-user-id/);
  assert.match(auth, /oai-authenticated-user-email/);
  assert.match(auth, /safeRelativeReturnPath/);
  assert.match(auth, /value\.startsWith\("\/\/"\)/);
  assert.match(appAuth, /AUTH_SESSION_COOKIE/);
  assert.match(appAuth, /getChatGPTUser/);
  assert.match(oauthSecurity, /HttpOnly/);
  assert.match(oauthSecurity, /SameSite=Lax/);
  assert.match(oauthSecurity, /HMAC/);
  assert.match(oauthSecurity, /code_challenge|sha256Base64Url/);
  assert.match(oauthCallback, /statePayload\.state !==/);
  assert.doesNotMatch(oauthCallback, /access_token.*INSERT|INSERT.*access_token/is);
  assert.match(brandMark, /brand-mark-thread/);
  assert.doesNotMatch(brandMark, /brand-mark-letter/);
  assert.match(brandMark, /brand-mark-node-start/);
  assert.match(brandMark, /brand-mark-node-end/);
  assert.doesNotMatch(page, />CS<\/span>/);
  assert.match(mobileNav, /aria-expanded=\{open\}/);
  assert.match(mobileNav, /mobile-navigation-menu/);
  assert.doesNotMatch(mobileNav, /useId/);
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
  assert.equal(localizedPersonaLabel("zh-TW", "technical", "Technical interviewer"), "技術面試官");
  assert.equal(localizedPersonaLabel("ja", "system-design", "System design interviewer"), "システム設計面接官");
  assert.equal(localizedPersonaLabel("de", "values", "Culture and values interviewer"), "Kultur- und Werteinterview");

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

test("localizes every interviewer role and removes English interview-card fallbacks", () => {
  const personas = [
    ["hr", "HR screening"],
    ["recruiter", "Recruiter"],
    ["hiring-manager", "Hiring manager"],
    ["functional-lead", "Functional leader"],
    ["technical", "Technical interviewer"],
    ["system-design", "System design interviewer"],
    ["portfolio", "Portfolio reviewer"],
    ["coo", "COO"],
    ["ceo", "CEO"],
    ["peer", "Future teammate"],
    ["cross-functional", "Cross-functional partner"],
    ["customer", "Customer or user representative"],
    ["values", "Culture and values interviewer"],
    ["case", "Case breakdown"],
    ["panel", "Interview panel"],
  ];
  for (const [locale] of LANGUAGES) {
    for (const [id, englishLabel] of personas) {
      const label = localizedPersonaLabel(locale, id, englishLabel);
      assert.ok(label.trim(), `${locale}:${id} needs a visible role label`);
      const details = localizedPersonaDetails(locale, {
        id,
        label: englishLabel,
        round: "English round",
        focus: "Collaboration, conflict, feedback, and working style",
        pressure: "English pressure",
        decision: "English decision",
        answerPattern: "English answer pattern",
        redFlags: "English red flags",
        prepChecklist: ["English preparation"],
      });
      if (locale !== "en") {
        const visible = [
          details.round,
          details.focus,
          details.pressure,
          details.decision,
          details.answerPattern,
          details.redFlags,
          ...details.prepChecklist,
        ].join(" ");
        assert.doesNotMatch(
          visible,
          /Collaboration, conflict|English round|English pressure|English decision|English answer|English red flags|English preparation/i,
          `${locale}:${id} leaked English role guidance`,
        );
      }
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
    assert.ok(html.includes(intro.description), path);
    assert.ok(html.includes(labels.noCharge), path);
    assert.ok(html.includes(labels.privacy), path);
    assert.ok(html.includes(plan), path);
    assert.match(html, /oauth-provider-list/, path);
    assert.match(html, /\/api\/auth\/start\/google\?return_to=/, path);
    assert.match(html, /\/api\/auth\/start\/github\?return_to=/, path);
    assert.match(html, /\/api\/auth\/start\/linkedin\?return_to=/, path);
    assert.doesNotMatch(html, /\/signin-with-chatgpt\?return_to=/, path);
    assert.doesNotMatch(html, /Try it without signing in|不登入，直接試用|サインインせずに試す/, path);
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
    const auth = authCopyFor(locale);
    assert.ok(labels.account, locale);
    assert.ok(labels.signIn, locale);
    assert.ok(auth.identityNotice, locale);
    assert.ok(auth.evidenceNotice, locale);
    assert.ok(auth.setupNeeded, locale);
    assert.ok(auth.signInFailed, locale);
    assert.ok(labels.signOut, locale);
    assert.ok(labels.selected, locale);
    assert.ok(labels.noCharge, locale);
    assert.ok(labels.privacy, locale);
    assert.doesNotMatch(labels.signIn, /ChatGPT/i, locale);
    assert.ok(accountIntroCopyFor(locale).title, locale);
    assert.ok(accountIntroCopyFor(locale).description, locale);
    assert.ok(accountIntroCopyFor(locale).accessCta, locale);
    assert.ok(openSourceLabelFor(locale), locale);
  }
  assert.match(accountIntroCopyFor("en").description, /Sign in is required/i);
  assert.match(accountIntroCopyFor("zh-TW").description, /必須先登入/);
  assert.match(accountIntroCopyFor("ja").description, /サインインが必要/);
});

test("provides a complete, product-specific FAQ in every supported language", () => {
  for (const [locale] of LANGUAGES) {
    const faq = faqCopyFor(locale);
    assert.ok(faq.eyebrow, locale);
    assert.ok(faq.title, locale);
    assert.ok(faq.intro, locale);
    assert.equal(faq.items.length, 7, locale);
    const optionalSource = optionalCareerSourceCopyFor(locale);
    assert.ok(optionalSource.label, locale);
    assert.match(optionalSource.note, /LinkedIn/i, locale);
    assert.match(optionalSource.note, /GitHub/i, locale);
    assert.match(faq.items[1].answer, /LinkedIn/i, locale);
    assert.equal(faq.items[3].answer, accountIntroCopyFor(locale).description, locale);
    for (const item of faq.items) {
      assert.ok(item.question, locale);
      assert.ok(item.answer, locale);
      assert.doesNotMatch(item.question, /JobOps/i, locale);
      assert.doesNotMatch(item.answer, /JobOps/i, locale);
    }
  }
});

test("server-renders every searchable InterviewThread page", async () => {
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
    assert.match(html, /InterviewThread/i, path);
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
    assert.match(html, new RegExp(`<title>${title} \\| InterviewThread<\\/title>`));
    assert.match(html, new RegExp(`name="description" content="${description}`));
    assert.match(html, new RegExp(`property="og:title" content="${title} \\| InterviewThread"`));
    assert.match(html, new RegExp(`name="twitter:title" content="${title} \\| InterviewThread"`));
    assert.doesNotMatch(html, /og-careerstorymap\.png/);
  }
});

test("server-renders all 40 indexable language home pages", async () => {
  assert.equal(LANGUAGES.length, 40);
  for (const [locale] of LANGUAGES) {
    const response = await render(`/${localeToPath(locale)}`, true);
    assert.equal(response.status, 200, locale);
    const html = await response.text();
    assert.ok(
      html.includes(
        locale === "en"
          ? "Practice the interview for the job you want."
          : copyFor(locale).heroTitle,
      ),
      locale,
    );
    assert.ok(html.includes(`lang="${locale}"`), locale);
    assert.ok(html.includes(copyFor(locale).interview), `${locale}: interview label`);
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
      new RegExp(`<link rel="canonical" href="https://interviewthread\\.example${path}">`),
      path,
    );
    assert.match(html, new RegExp(`hreflang="${locale}"`), path);
    assert.match(html, /hreflang="en"/, path);
    assert.match(html, /hreflang="zh-TW"/, path);
    assert.match(html, /hreflang="x-default"/, path);
    assert.equal((html.match(/rel="alternate"/g) ?? []).length, 41, path);
  }
});

test("sitemap publishes every localized product and information page", async () => {
  const response = await render("/sitemap.xml");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /xml/i);
  const xml = await response.text();
  assert.equal((xml.match(/<url>/g) ?? []).length, LANGUAGES.length * 12);
  for (const [locale] of LANGUAGES) {
    const pathLocale = localeToPath(locale);
    assert.ok(
      xml.includes(`<loc>https://interviewthreadai.com/${pathLocale}</loc>`),
      locale,
    );
    assert.ok(
      xml.includes(
        `<loc>https://interviewthreadai.com/${pathLocale}/ai-mock-interview</loc>`,
      ),
      locale,
    );
    assert.ok(
      xml.includes(
        `<loc>https://interviewthreadai.com/${pathLocale}/privacy</loc>`,
      ),
      locale,
    );
    assert.ok(
      xml.includes(`<loc>https://interviewthreadai.com/${pathLocale}/beta</loc>`),
      locale,
    );
  }
  assert.match(xml, /hreflang="x-default" href="https:\/\/interviewthreadai\.com\/en\/ai-mock-interview"/);
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
