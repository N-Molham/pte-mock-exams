#!/usr/bin/env node
/*
 * Pre-render the exam prompts with Microsoft Edge neural voices.
 *
 * Output:
 *   audio/<examId>/<hash>.mp3        one clip per spoken string
 *   audio/<examId>/manifest.json     { "<hash>": <duration-ms> }
 *
 * The exam engine computes the same hash from the same string, so no ids need
 * to be threaded through the content JSON. Missing clips fall back to the
 * browser's speech synthesis.
 *
 *   node tools/render-audio.mjs            # all exams
 *   node tools/render-audio.mjs exam1      # one exam
 *   node tools/render-audio.mjs exam1 --force
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content");
const AUDIO = path.join(ROOT, "audio");
const FORMAT = OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3;
const BITRATE = 48_000;

/* voices */
const NARRATOR = "en-AU-NatashaNeural";
const SECOND = "en-AU-WilliamNeural";
const THIRD = "en-NZ-MollyNeural";
const SPEAKER_VOICES = { A: NARRATOR, B: SECOND, C: THIRD, D: SECOND };

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

/* Mirror of the strings src/engine.js passes to speak()/speakTurns(). */
function clipsFor(content) {
  const out = [];
  const add = (text, voice, rate, speaker) => {
    if (typeof text !== "string" || !text.trim()) return;
    out.push({ text, voice, rate, speaker });
  };
  const arr = (v) => (Array.isArray(v) ? v : []);

  for (const d of arr(content.repeatSentence)) add(d.text, NARRATOR, 0.95);
  for (const d of arr(content.retellLecture)) add(d.text, NARRATOR, 0.92);
  for (const d of arr(content.respondToSituation)) add(d.audio || d.prompt, SECOND, 0.95);
  for (const d of arr(content.answerShortQuestion)) add(d.text || d.question, SECOND, 0.95);
  for (const d of arr(content.summarizeGroupDiscussion)) {
    for (const turn of arr(d.turns)) {
      add(turn.text, SPEAKER_VOICES[turn.speaker] || NARRATOR, 0.95, turn.speaker);
    }
  }

  const listen = content.listening || {};
  for (const d of arr(listen.summarizeSpokenText)) add(d.audio, NARRATOR, 0.92);
  for (const d of arr(listen.mcMultiple)) add(d.audio, NARRATOR, 0.95);
  for (const d of arr(listen.fillBlanks)) add(d.audio, NARRATOR, 0.95);
  for (const d of arr(listen.highlightCorrectSummary)) add(d.audio, NARRATOR, 0.95);
  for (const d of arr(listen.mcSingle)) add(d.audio, NARRATOR, 0.95);
  for (const d of arr(listen.selectMissingWord)) add(d.audio, NARRATOR, 0.95);
  for (const d of arr(listen.highlightIncorrectWords)) {
    const words = arr(d.words).map((w) => w.said || w.w);
    add(words.join(" "), NARRATOR, 0.95);
  }
  for (const d of arr(listen.writeFromDictation)) add(d.text, NARRATOR, 0.95);

  return out;
}

function writeClip(tts, file, text, voice, rate) {
  return new Promise(async (resolve, reject) => {
    try {
      await tts.setMetadata(voice, FORMAT);
      const { audioStream } = tts.toStream(text, { rate });
      const out = fs.createWriteStream(file);
      audioStream.pipe(out);
      out.on("finish", resolve);
      out.on("error", reject);
      audioStream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}

async function renderExam(tts, name, force) {
  const content = JSON.parse(fs.readFileSync(path.join(CONTENT, name), "utf8"));
  const id = content.meta && content.meta.id;
  if (!id) throw new Error(`missing meta.id in ${name}`);

  const dir = path.join(AUDIO, `exam${id}`);
  fs.mkdirSync(dir, { recursive: true });
  const manifestPath = path.join(dir, "manifest.json");
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : {};

  const clips = clipsFor(content);
  const seen = new Set();
  let done = 0, made = 0, bytes = 0, failed = 0;

  for (const clip of clips) {
    const hash = hashText(clip.text, clip.speaker);
    if (seen.has(hash)) continue;
    seen.add(hash);
    done++;

    const file = path.join(dir, hash + ".mp3");
    if (!force && fs.existsSync(file) && manifest[hash]) {
      bytes += fs.statSync(file).size;
      continue;
    }

    try {
      await writeClip(tts, file, clip.text, clip.voice, clip.rate);
      const size = fs.statSync(file).size;
      manifest[hash] = Math.round((size * 8 * 1000) / BITRATE);
      bytes += size;
      made++;
      process.stdout.write(`\r  ${name}: ${done}/${clips.length} clips, ${made} new`);
    } catch (error) {
      failed++;
      console.error(`\n  FAILED ${hash} (${clip.voice}): ${error.message}`);
      try { fs.unlinkSync(file); } catch {}
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest) + "\n");
  console.log(
    `\n  ${name}: ${done} unique clips, ${made} rendered, ` +
      `${(bytes / 1048576).toFixed(6)} MB total, ${failed} failed`,
  );
  return { id, done, made, bytes, failed };
}

(async () => {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = args.find((a) => !a.startsWith("--"));

  const files = fs
    .readdirSync(CONTENT)
    .filter((f) => f.endsWith(".json"))
    .sort((a, b) => parseInt(a.replace(/\D/g, ""), 10) - parseInt(b.replace(/\D/g, ""), 10))
    .filter((f) => !only || f === `${only}.json` || f === only);

  if (!files.length) {
    console.error(`no content files matched ${only || "(all)"}`);
    process.exit(1);
  }

  const tts = new MsEdgeTTS();
  let failed = 0;
  try {
    for (const file of files) {
      const result = await renderExam(tts, file, force);
      failed += result.failed;
    }
  } finally {
    tts.close();
  }
  if (failed) process.exitCode = 1;
})();
