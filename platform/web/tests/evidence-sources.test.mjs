import assert from "node:assert/strict";
import test from "node:test";
import {
  candidateEvidenceDocuments,
  combinedCandidateEvidence,
  evidenceSourceKindForUrl,
  evidenceSourceLabel,
} from "../app/evidence-sources.ts";

test("classifies candidate-controlled career source links", () => {
  assert.equal(
    evidenceSourceKindForUrl("https://www.linkedin.com/in/example"),
    "linkedin",
  );
  assert.equal(
    evidenceSourceKindForUrl("https://github.com/example/project"),
    "portfolio",
  );
  assert.equal(
    evidenceSourceKindForUrl("https://example.com/resume"),
    "profile",
  );
});

test("treats source text as evidence and a URL alone as provenance", () => {
  const sources = [
    {
      id: "linkedin-1",
      url: "linkedin.com/in/example",
      text: "Led a migration that reduced reconciliation time by 30%.",
    },
    {
      id: "portfolio-1",
      url: "https://example.com/project",
      text: "",
    },
  ];
  const documents = candidateEvidenceDocuments("Built SQL dashboards.", sources);
  assert.equal(documents.length, 2);
  assert.equal(documents[1].label, "LinkedIn profile");
  assert.equal(documents[1].url, "https://linkedin.com/in/example");
  assert.doesNotMatch(combinedCandidateEvidence(documents), /portfolio-1/);
  assert.match(combinedCandidateEvidence(documents), /SOURCE linkedin-1/);
});

test("does not turn invalid source links into clickable citations", () => {
  const documents = candidateEvidenceDocuments("", [
    { id: "unsafe", url: "http://", text: "Built a reporting workflow." },
  ]);
  assert.equal(documents.length, 1);
  assert.equal(documents[0].url, undefined);
});

test("uses readable source labels", () => {
  assert.equal(
    evidenceSourceLabel(
      { id: "a", url: "https://example.github.io/work", text: "Proof" },
      0,
    ),
    "Portfolio or project profile",
  );
});
