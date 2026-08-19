import assert from "node:assert/strict";
import test from "node:test";
import { strToU8, zipSync } from "fflate";
import { parseDocument, parseDocuments } from "../app/document-parser.ts";

function zippedFile(name, entries, type) {
  return new File(
    [zipSync(Object.fromEntries(Object.entries(entries).map(([path, text]) => [path, strToU8(text)])))],
    name,
    { type },
  );
}

function minimalPdf(text) {
  const escaped = text.replace(/[()\\]/g, "\\$&");
  const stream = `BT /F1 16 Tf 72 720 Td (${escaped}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new File([pdf], "resume.pdf", { type: "application/pdf" });
}

test("parses plain text and multiple local files", async () => {
  const result = await parseDocuments([
    new File(["SQL dashboard reduced reporting time by 42%."], "resume.txt", {
      type: "text/plain",
    }),
    new File(["Python and experimentation are required."], "jd.md", {
      type: "text/markdown",
    }),
  ]);
  assert.equal(result.errors.length, 0);
  assert.equal(result.documents.length, 2);
  assert.match(result.documents[0].text, /42%/);
});

test("extracts DOCX, PPTX, XLSX, and ODF text locally", async () => {
  const fixtures = [
    zippedFile(
      "resume.docx",
      {
        "word/document.xml":
          "<w:document><w:body><w:p><w:r><w:t>Led SQL migration</w:t></w:r></w:p><w:p><w:r><w:t>Reduced errors 30%</w:t></w:r></w:p></w:body></w:document>",
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ),
    zippedFile(
      "story.pptx",
      {
        "ppt/slides/slide1.xml":
          "<p:sld><a:p><a:r><a:t>Interview story evidence</a:t></a:r></a:p></p:sld>",
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ),
    zippedFile(
      "skills.xlsx",
      {
        "xl/sharedStrings.xml": "<sst><si><t>Python</t></si><si><t>Tableau</t></si></sst>",
        "xl/worksheets/sheet1.xml":
          '<worksheet><sheetData><row><c t="s"><v>0</v></c><c t="s"><v>1</v></c></row></sheetData></worksheet>',
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ),
    zippedFile(
      "profile.odt",
      { "content.xml": "<office:document><text:p>Stakeholder leadership</text:p></office:document>" },
      "application/vnd.oasis.opendocument.text",
    ),
  ];
  const result = await parseDocuments(fixtures);
  assert.deepEqual(result.errors, []);
  assert.match(result.documents[0].text, /Led SQL migration/);
  assert.match(result.documents[1].text, /Interview story evidence/);
  assert.match(result.documents[2].text, /Python\tTableau/);
  assert.match(result.documents[3].text, /Stakeholder leadership/);
});

test("extracts selectable text from PDF", async () => {
  const result = await parseDocument(minimalPdf("Resume evidence SQL 42 percent"));
  assert.match(result.kind, /PDF/);
  assert.match(result.text, /Resume evidence SQL 42 percent/);
});

test("rejects formats that need OCR or legacy conversion", async () => {
  await assert.rejects(
    () => parseDocument(new File([new Uint8Array([0, 1, 2])], "scan.png", { type: "image/png" })),
    /not text-readable/,
  );
});
