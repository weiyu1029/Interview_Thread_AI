import { strFromU8, unzipSync } from "fflate";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "csv",
  "json",
  "html",
  "htm",
  "rtf",
  "xml",
  "yaml",
  "yml",
  "log",
  "tex",
]);
const ZIP_DOCUMENT_EXTENSIONS = new Set([
  "docx",
  "pptx",
  "xlsx",
  "odt",
  "ods",
  "odp",
  "epub",
]);

export type ParsedDocument = {
  name: string;
  text: string;
  kind: string;
};

function extensionFor(name: string) {
  return name.split(".").pop()?.toLowerCase() || "";
}

function decodeEntities(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] !== "#") return named[code.toLowerCase()] || entity;
    const number = code[1]?.toLowerCase() === "x"
      ? Number.parseInt(code.slice(2), 16)
      : Number.parseInt(code.slice(1), 10);
    return Number.isFinite(number) ? String.fromCodePoint(number) : entity;
  });
}

function xmlText(value: string) {
  return decodeEntities(
    value
      .replace(/<\/?(?:w:p|a:p|text:p|text:h|p|div|li|tr|table|section)\b[^>]*>/gi, "\n")
      .replace(/<\/?(?:w:tab|text:tab)\b[^>]*>/gi, "\t")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function naturalOrder(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function parseSpreadsheet(entries: Record<string, Uint8Array>) {
  const sharedXml = entries["xl/sharedStrings.xml"]
    ? strFromU8(entries["xl/sharedStrings.xml"])
    : "";
  const shared = Array.from(sharedXml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/gi)).map(
    (match) => xmlText(match[1]),
  );
  const sheets = Object.keys(entries)
    .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name))
    .sort(naturalOrder);
  return sheets
    .map((name, index) => {
      const xml = strFromU8(entries[name]);
      const rows = Array.from(xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/gi)).map(
        (row) =>
          Array.from(row[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/gi))
            .map((cell) => {
              const attributes = cell[1];
              const body = cell[2];
              const inline = body.match(/<is\b[^>]*>([\s\S]*?)<\/is>/i);
              if (inline) return xmlText(inline[1]);
              const value = body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/i)?.[1] || "";
              if (/\bt=["']s["']/i.test(attributes))
                return shared[Number(value)] || value;
              return decodeEntities(value).trim();
            })
            .filter(Boolean)
            .join("\t"),
      );
      return `Sheet ${index + 1}\n${rows.filter(Boolean).join("\n")}`;
    })
    .join("\n\n");
}

async function parseZipDocument(file: File, extension: string) {
  let retainedEntries = 0;
  let retainedBytes = 0;
  const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
    filter: (entry) => {
      const isReadablePart = /\.(?:xml|xhtml|html|htm)$/i.test(entry.name);
      const withinLimits =
        entry.originalSize <= 8_000_000 &&
        retainedEntries < 256 &&
        retainedBytes + entry.originalSize <= 32_000_000;
      if (!isReadablePart || !withinLimits) return false;
      retainedEntries += 1;
      retainedBytes += entry.originalSize;
      return true;
    },
  });
  if (extension === "xlsx") return parseSpreadsheet(entries);

  let names: string[] = [];
  if (extension === "docx") {
    names = Object.keys(entries).filter((name) =>
      /^word\/(?:document|header\d*|footer\d*|footnotes|endnotes)\.xml$/i.test(
        name,
      ),
    );
  } else if (extension === "pptx") {
    names = Object.keys(entries).filter((name) =>
      /^ppt\/(?:slides\/slide\d+|notesSlides\/notesSlide\d+)\.xml$/i.test(
        name,
      ),
    );
  } else if (["odt", "ods", "odp"].includes(extension)) {
    names = Object.keys(entries).filter((name) => name === "content.xml");
  } else if (extension === "epub") {
    names = Object.keys(entries).filter((name) => /\.(?:xhtml|html|htm)$/i.test(name));
  }

  return names
    .sort(naturalOrder)
    .map((name) => xmlText(strFromU8(entries[name])))
    .filter(Boolean)
    .join("\n\n");
}

function parsePlainText(raw: string, extension: string) {
  if (extension === "html" || extension === "htm" || extension === "xml")
    return xmlText(raw);
  if (extension === "rtf")
    return raw
      .replace(/\\par[d]?/g, "\n")
      .replace(/\\'[0-9a-f]{2}/gi, " ")
      .replace(/\\[a-z]+-?\d*\s?/gi, " ")
      .replace(/[{}]/g, "")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  return raw.trim();
}

export async function parseDocument(file: File): Promise<ParsedDocument> {
  if (file.size > MAX_FILE_BYTES)
    throw new Error(`${file.name} is larger than the 20 MB local limit.`);
  const extension = extensionFor(file.name);
  let text = "";
  let kind = extension.toUpperCase() || "Document";

  if (TEXT_EXTENSIONS.has(extension)) {
    text = parsePlainText(await file.text(), extension);
  } else if (extension === "pdf" || file.type === "application/pdf") {
    const { extractText } = await import("unpdf");
    const result = await extractText(new Uint8Array(await file.arrayBuffer()), {
      mergePages: true,
    });
    text = result.text;
    kind = `PDF · ${result.totalPages} page${result.totalPages === 1 ? "" : "s"}`;
  } else if (ZIP_DOCUMENT_EXTENSIONS.has(extension)) {
    text = await parseZipDocument(file, extension);
  } else {
    throw new Error(
      `${file.name} is not text-readable in the browser. Convert legacy DOC/PPT/XLS, images, audio, or archives to PDF, DOCX, PPTX, XLSX, or text first.`,
    );
  }

  const normalized = text.split(String.fromCharCode(0)).join("").trim();
  if (!normalized)
    throw new Error(`${file.name} did not contain extractable text.`);
  return { name: file.name, text: normalized, kind };
}

export async function parseDocuments(files: File[]) {
  const settled = await Promise.allSettled(files.map(parseDocument));
  const documents = settled.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
  const errors = settled.flatMap((result) =>
    result.status === "rejected"
      ? [result.reason instanceof Error ? result.reason.message : "A file could not be read."]
      : [],
  );
  return { documents, errors };
}
