#!/usr/bin/env node
/*
 * Verify that every spoken prompt has a rendered clip and a manifest entry.
 *
 *   npm run check:audio
 *
 * Fails when a clip is missing, the manifest lacks its hash, or a file looks
 * truncated. Run `npm run audio` to fill gaps.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content");
const AUDIO = path.join(ROOT, "audio");

/* Must stay byte-identical to hashText() in src/engine.js. */
function hashText(text, speaker) {
  let s = String(text == null ? "" : text).replace(/\s+/g, " ").trim();
  if (speaker) s = speaker + "\u0001" + s;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/* Mirror of tools/render-audio.mjs clipsFor(). */
function spokenStrings(c) {
  const out = [];
  const add = (text, speaker) => { if (typeof text === "string" && text.trim()) out.push([text, speaker]); };
  const arr = (v) => (Array.isArray(v) ? v : []);
  for (const d of arr(c.repeatSentence)) add(d.text);
  for (const d of arr(c.retellLecture)) add(d.text);
  for (const d of arr(c.respondToSituation)) add(d.audio || d.prompt);
  for (const d of arr(c.answerShortQuestion)) add(d.text || d.question);
  for (const d of arr(c.summarizeGroupDiscussion)) for (const t of arr(d.turns)) add(t.text, t.speaker);
  const L = c.listening || {};
  for (const k of ["summarizeSpokenText", "mcMultiple", "fillBlanks", "highlightCorrectSummary", "mcSingle", "selectMissingWord"]) {
    for (const d of arr(L[k])) add(d.audio);
  }
  for (const d of arr(L.highlightIncorrectWords)) add(arr(d.words).map((w) => w.said || w.w).join(" "));
  for (const d of arr(L.writeFromDictation)) add(d.text);
  return out;
}

const failures = [];
let clips = 0;
for (const file of fs.readdirSync(CONTENT).filter((f) => f.endsWith(".json"))) {
  const content = JSON.parse(fs.readFileSync(path.join(CONTENT, file), "utf8"));
  const id = content.meta && content.meta.id;
  const dir = path.join(AUDIO, `exam${id}`);
  const manifestPath = path.join(dir, "manifest.json");
  if (!fs.existsSync(manifestPath)) { failures.push(`${file}: no manifest (${path.relative(ROOT, manifestPath)})`); continue; }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const seen = new Set();
  for (const [text, speaker] of spokenStrings(content)) {
    const hash = hashText(text, speaker);
    if (seen.has(hash)) continue;
    seen.add(hash);
    clips++;
    const clip = path.join(dir, hash + ".mp3");
    if (!manifest[hash]) { failures.push(`${file}: manifest missing ${hash} (${String(text).slice(0, 40)}…)`); continue; }
    if (!fs.existsSync(clip)) { failures.push(`${file}: file missing ${path.relative(ROOT, clip)}`); continue; }
    if (fs.statSync(clip).size < 1200) failures.push(`${file}: suspiciously small clip ${hash}`);
  }
}

if (failures.length) {
  console.error(`audio check failed: ${failures.length} problem(s)`);
  failures.slice(0, 20).forEach((f) => console.error("  - " + f));
  process.exit(1);
}
console.log(`audio check passed: ${clips} clips across ${fs.readdirSync(CONTENT).filter((f) => f.endsWith(".json")).length} exams`);
