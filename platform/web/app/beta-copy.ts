import type { LocaleCode } from "./i18n";

type Option = readonly [string, string];
export type BetaCopy = {
  label: string;
  title: string;
  description: string;
  notice: string;
  stages: readonly Option[];
  formTitle: string;
  formDescription: string;
  signIn: string;
  roleFamily: string;
  experienceLevel: string;
  interviewTimeline: string;
  primaryGoal: string;
  choose: string;
  roleOptions: readonly Option[];
  experienceOptions: readonly Option[];
  timelineOptions: readonly Option[];
  goalOptions: readonly Option[];
  acknowledgement: string;
  researchConsent: string;
  updatesConsent: string;
  submit: string;
  saving: string;
  statusTitle: string;
  statusLabels: Record<"applied" | "invited" | "active" | "paused" | "withdrawn", string>;
  statusHelp: string;
  withdraw: string;
  reapply: string;
  error: string;
  loading: string;
  releaseTitle: string;
  releaseSteps: readonly Option[];
  gatesTitle: string;
  gates: readonly string[];
  fallbackNotice: string;
};

const en: BetaCopy = {
  label: "Closed beta",
  title: "Help test InterviewThread before wider release.",
  description: "Join a small, consent-based test group. Use the real workflow, tell us where it fails, and help us decide what is safe and useful enough to release next.",
  notice: "Applying does not guarantee immediate access. The current public tools stay available while cohorts are reviewed.",
  stages: [
    ["Apply", "Tell us your role, timing, and main interview-prep need."],
    ["Invite", "We choose a balanced cohort across roles, experience, language, and accessibility needs."],
    ["Test", "Complete two or three guided sessions with real resume and job-description evidence."],
    ["Review", "We connect feedback to a release, fix regressions, and publish what changed."],
  ] as const,
  formTitle: "Apply to a testing cohort",
  formDescription: "We collect only structured selections here—no resume, job description, or free-text career history.",
  signIn: "Sign in to apply",
  roleFamily: "Role family",
  experienceLevel: "Experience level",
  interviewTimeline: "Interview timing",
  primaryGoal: "What needs the most improvement?",
  choose: "Choose one",
  roleOptions: [
    ["product", "Product"], ["data", "Data and analytics"], ["engineering", "Engineering"],
    ["design", "Design"], ["operations", "Operations"], ["marketing-sales", "Marketing or sales"],
    ["finance", "Finance"], ["other", "Other"],
  ] as const,
  experienceOptions: [
    ["student", "Student or new graduate"], ["early", "Early career"], ["mid", "Mid-career"],
    ["senior", "Senior or executive"], ["career-change", "Career changer"],
  ] as const,
  timelineOptions: [
    ["interviewing", "Interview already scheduled"], ["30-days", "Applying within 30 days"],
    ["90-days", "Applying within 90 days"], ["exploring", "Exploring for later"],
  ] as const,
  goalOptions: [
    ["evidence-match", "Understand my fit and evidence gaps"], ["truthful-stories", "Build truthful interview stories"],
    ["mock-interview", "Practice realistic follow-up questions"], ["speech-language", "Improve speech or language support"],
    ["accessibility", "Improve accessibility"], ["other", "Something else"],
  ] as const,
  acknowledgement: "I have read the beta notice, Terms, and Privacy Policy and agree to this voluntary test.",
  researchConsent: "You may contact me about an optional product-research session.",
  updatesConsent: "Send me cohort and release updates.",
  submit: "Apply for closed beta",
  saving: "Saving application…",
  statusTitle: "Your beta status",
  statusLabels: {
    applied: "Application received",
    invited: "Invited",
    active: "Active tester",
    paused: "Participation paused",
    withdrawn: "Withdrawn",
  },
  statusHelp: "Your status and consent version are saved to your account. We will not use your application to train a public model.",
  withdraw: "Withdraw from beta",
  reapply: "Update or reapply",
  error: "We could not update your beta application. Please try again.",
  loading: "Loading beta status…",
  releaseTitle: "How this becomes a release",
  releaseSteps: [
    ["Observe", "Tag feedback by product version, surface, cohort, and severity."],
    ["Decide", "Prioritize accuracy, privacy, accessibility, and blocked-task failures first."],
    ["Validate", "Run regression tests and human review against an evidence-grounded evaluation set."],
    ["Graduate", "Expand access only after the release gates pass; otherwise roll back or keep testing."],
  ] as const,
  gatesTitle: "Release gates",
  gates: [
    "No invented achievement in the audited evaluation set.",
    "At least 95% of generated claims link to source evidence.",
    "Fewer than 2% repeated interview questions in tested sessions.",
    "At least 90% completion of the core resume-to-interview flow.",
    "Privacy, deletion, accessibility, and rollback checks completed.",
  ] as const,
  fallbackNotice: "This beta notice is currently provided in English while its reviewed local-language version is prepared.",
};

const zhTW: BetaCopy = {
  ...en,
  label: "封閉測試",
  title: "在全面開放前，一起把 InterviewThread 測好。",
  description: "加入人數有限、明確同意的測試群組。實際走完流程、指出失敗之處，並協助我們判斷哪些功能已安全、實用到足以上線。",
  notice: "送出申請不代表立即取得名額；審核測試梯次期間，現有公開工具仍可使用。",
  stages: [
    ["申請", "告訴我們你的職類、時程與最需要改善的面試準備問題。"],
    ["邀請", "依職類、資歷、語言與無障礙需求組成平衡的測試梯次。"],
    ["測試", "使用真實履歷與職缺證據完成二至三次引導測試。"],
    ["檢討", "把回饋連到特定版本、修復回歸問題並公開更新內容。"],
  ],
  formTitle: "申請封測梯次",
  formDescription: "這裡只收結構化選項，不收履歷、職缺描述或自由書寫的職涯經歷。",
  signIn: "登入後申請",
  roleFamily: "職類",
  experienceLevel: "資歷",
  interviewTimeline: "面試時程",
  primaryGoal: "最需要改善什麼？",
  choose: "請選擇",
  roleOptions: [["product", "產品"], ["data", "資料與分析"], ["engineering", "工程"], ["design", "設計"], ["operations", "營運"], ["marketing-sales", "行銷或業務"], ["finance", "財務"], ["other", "其他"]],
  experienceOptions: [["student", "學生或應屆畢業生"], ["early", "職涯初期"], ["mid", "中階"], ["senior", "資深或高階主管"], ["career-change", "轉職者"]],
  timelineOptions: [["interviewing", "已排定面試"], ["30-days", "30 天內開始申請"], ["90-days", "90 天內開始申請"], ["exploring", "先為未來探索"]],
  goalOptions: [["evidence-match", "了解職缺符合度與證據缺口"], ["truthful-stories", "建立真實可辯護的面試故事"], ["mock-interview", "練習真實的追問"], ["speech-language", "改善語音或語言支援"], ["accessibility", "改善無障礙體驗"], ["other", "其他"]],
  acknowledgement: "我已閱讀封測說明、服務條款與隱私權政策，並同意自願參與測試。",
  researchConsent: "可以聯絡我參加選擇性的產品研究訪談。",
  updatesConsent: "寄送梯次與版本更新給我。",
  submit: "申請封閉測試",
  saving: "正在儲存申請…",
  statusTitle: "你的封測狀態",
  statusLabels: { applied: "已收到申請", invited: "已邀請", active: "測試中", paused: "已暫停", withdrawn: "已退出" },
  statusHelp: "狀態與同意版本會存入你的帳號。我們不會用這份申請訓練公開模型。",
  withdraw: "退出封測",
  reapply: "更新或重新申請",
  error: "目前無法更新封測申請，請再試一次。",
  loading: "正在載入封測狀態…",
  releaseTitle: "回饋如何成為正式更新",
  releaseSteps: [["觀察", "依產品版本、功能頁面、梯次與嚴重度標記回饋。"], ["決定", "優先處理準確性、隱私、無障礙與任務被阻斷的問題。"], ["驗證", "以有證據依據的評估集執行回歸測試與人工審查。"], ["擴大", "只有通過發布門檻才擴大使用；否則回滾或繼續測試。"]],
  gatesTitle: "發布門檻",
  gates: ["人工稽核評估集中沒有虛構成就。", "至少 95% 產生的主張能連回來源證據。", "測試中的面試問題重複率低於 2%。", "至少 90% 使用者能完成履歷到面試的核心流程。", "隱私、刪除、無障礙與回滾檢查均完成。"],
  fallbackNotice: "這份封測說明目前先以英文提供，經審校的當地語言版本準備完成後會更新。",
};

const labels: Partial<Record<LocaleCode, string>> = {
  en: "Closed beta", ja: "クローズドベータ", ko: "비공개 베타", "zh-CN": "封闭测试", "zh-TW": "封閉測試",
  es: "Beta cerrada", fr: "Bêta fermée", de: "Geschlossene Beta", "pt-BR": "Beta fechado", it: "Beta chiusa",
  nl: "Gesloten bèta", pl: "Zamknięta beta", tr: "Kapalı beta", ru: "Закрытая бета", uk: "Закрита бета",
  ar: "اختبار تجريبي مغلق", he: "בטא סגורה", hi: "क्लोज़्ड बीटा", bn: "ক্লোজড বেটা", ur: "کلوزڈ بیٹا",
  id: "Beta tertutup", ms: "Beta tertutup", th: "เบต้าแบบปิด", vi: "Beta kín", fil: "Closed beta",
  sv: "Stängd beta", no: "Lukket beta", da: "Lukket beta", fi: "Suljettu beta", cs: "Uzavřená beta",
  sk: "Uzavretá beta", hu: "Zárt béta", ro: "Beta închisă", el: "Κλειστή beta", bg: "Затворена бета",
  hr: "Zatvorena beta", sr: "Затворена бета", sl: "Zaprta beta", sw: "Beta iliyofungwa", fa: "بتای بسته",
};

export function betaCopyFor(locale: LocaleCode): BetaCopy {
  if (locale === "zh-TW") return zhTW;
  return { ...en, label: labels[locale] || en.label };
}

export function betaLabelFor(locale: LocaleCode) {
  return labels[locale] || en.label;
}
