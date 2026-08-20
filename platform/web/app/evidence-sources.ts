export type CandidateEvidenceSourceKind =
  | "linkedin"
  | "portfolio"
  | "profile"
  | "other";

export type CandidateEvidenceSourceInput = {
  id: string;
  url: string;
  text: string;
};

export type CandidateEvidenceDocument = {
  id: string;
  label: string;
  kind: "resume" | CandidateEvidenceSourceKind;
  url?: string;
  text: string;
};

function normalizedUrl(value: string) {
  const input = value.trim();
  if (!input) return "";
  try {
    const url = new URL(
      /^https?:\/\//i.test(input) ? input : `https://${input}`,
    );
    if (!new Set(["http:", "https:"]).has(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function evidenceSourceKindForUrl(
  value: string,
): CandidateEvidenceSourceKind {
  try {
    const host = new URL(
      /^https?:\/\//i.test(value.trim())
        ? value.trim()
        : `https://${value.trim()}`,
    ).hostname
      .toLowerCase()
      .replace(/^www\./, "");
    if (host === "linkedin.com" || host.endsWith(".linkedin.com"))
      return "linkedin";
    if (
      host === "github.com" ||
      host.endsWith(".github.io") ||
      host === "behance.net" ||
      host.endsWith(".behance.net") ||
      host === "dribbble.com" ||
      host.endsWith(".dribbble.com")
    )
      return "portfolio";
    return "profile";
  } catch {
    return "other";
  }
}

export function evidenceSourceLabel(
  source: CandidateEvidenceSourceInput,
  index: number,
) {
  const kind = evidenceSourceKindForUrl(source.url);
  if (kind === "linkedin") return "LinkedIn profile";
  if (kind === "portfolio") return "Portfolio or project profile";
  if (kind === "profile") return "Public career profile";
  return `Additional evidence ${index + 1}`;
}

export function candidateEvidenceDocuments(
  resume: string,
  sources: CandidateEvidenceSourceInput[],
): CandidateEvidenceDocument[] {
  const documents: CandidateEvidenceDocument[] = [];
  if (resume.trim()) {
    documents.push({
      id: "resume",
      label: "Resume or career evidence",
      kind: "resume",
      text: resume.trim(),
    });
  }
  sources.forEach((source, index) => {
    if (!source.text.trim()) return;
    const url = normalizedUrl(source.url);
    documents.push({
      id: source.id,
      label: evidenceSourceLabel(source, index),
      kind: evidenceSourceKindForUrl(source.url),
      ...(url ? { url } : {}),
      text: source.text.trim(),
    });
  });
  return documents;
}

export function combinedCandidateEvidence(
  documents: CandidateEvidenceDocument[],
) {
  return documents
    .map(
      (document) =>
        `SOURCE ${document.id} · ${document.label}${document.url ? ` · ${document.url}` : ""}\n${document.text}`,
    )
    .join("\n\n");
}
