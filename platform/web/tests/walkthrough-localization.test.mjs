import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const expectedLocales = [
  "en", "ja", "ko", "zh-CN", "zh-TW", "es", "fr", "de", "pt-BR", "it",
  "nl", "pl", "tr", "ru", "uk", "ar", "he", "hi", "bn", "ur", "id",
  "ms", "th", "vi", "fil", "sv", "no", "da", "fi", "cs", "sk", "hu",
  "ro", "el", "bg", "hr", "sr", "sl", "sw", "fa",
];

const webRoot = process.cwd();

test("walkthrough provides five complete cues for all 40 locales", async () => {
  const transcripts = JSON.parse(
    await readFile(join(webRoot, "app", "walkthrough-transcripts.json"), "utf8"),
  );
  assert.deepEqual(Object.keys(transcripts), expectedLocales);
  for (const locale of expectedLocales) {
    assert.equal(transcripts[locale].length, 5, `${locale} cue count`);
    for (const line of transcripts[locale]) {
      assert.ok(line.trim().length >= 12, `${locale} contains a complete sentence`);
      assert.ok(!line.includes("..."), `${locale} contains no placeholder text`);
    }
  }
});

test("each walkthrough locale has a generated WebVTT track", async () => {
  for (const locale of expectedLocales) {
    const vtt = await readFile(
      join(webRoot, "public", `interviewthread-walkthrough-${locale}.vtt`),
      "utf8",
    );
    assert.ok(vtt.startsWith("WEBVTT\n\n"));
    assert.equal((vtt.match(/-->/g) || []).length, 5, `${locale} cue timing count`);
  }
});

test("walkthrough source no longer burns English or Chinese captions into video", async () => {
  const generator = await readFile(
    join(webRoot, "scripts", "build-walkthrough.swift"),
    "utf8",
  );
  assert.ok(!generator.includes("chineseTitle"));
  assert.ok(!generator.includes("Prepare with real evidence"));
  assert.ok(!generator.includes("用真實證據準備面試"));
});

