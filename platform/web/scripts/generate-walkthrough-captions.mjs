import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const webDirectory = join(scriptDirectory, "..");
const transcriptPath = join(webDirectory, "app", "walkthrough-transcripts.json");
const publicDirectory = join(webDirectory, "public");
const transcripts = JSON.parse(await readFile(transcriptPath, "utf8"));
const windows = [
  ["00:00.000", "00:10.000"],
  ["00:10.000", "00:21.000"],
  ["00:21.000", "00:33.000"],
  ["00:33.000", "00:44.000"],
  ["00:44.000", "00:55.000"],
];

await mkdir(publicDirectory, { recursive: true });
for (const [locale, lines] of Object.entries(transcripts)) {
  if (!Array.isArray(lines) || lines.length !== windows.length) {
    throw new Error(`${locale} must contain ${windows.length} subtitle lines.`);
  }
  const cues = lines.map(
    (line, index) => `${windows[index][0]} --> ${windows[index][1]}\n${line}`,
  );
  const output = `WEBVTT\n\n${cues.join("\n\n")}\n`;
  await writeFile(
    join(publicDirectory, `interviewthread-walkthrough-${locale}.vtt`),
    output,
    "utf8",
  );
}

console.log(`Created ${Object.keys(transcripts).length} localized subtitle tracks.`);

