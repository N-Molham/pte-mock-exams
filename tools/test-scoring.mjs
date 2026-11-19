#!/usr/bin/env node
/*
 * Scoring regression tests. Loads the built exam page in jsdom, drives the
 * scoring entry points, and checks the score-report render. No network, no
 * browser: suitable for CI.
 *
 *   npm test            (run `npm run build` first)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXAM_HTML = path.join(ROOT, "exams", "pte-mock-exam-1.html");
const CONTENT = path.join(ROOT, "content", "exam1.json");

if (!fs.existsSync(EXAM_HTML)) {
  console.error("missing exams/pte-mock-exam-1.html — run `npm run build` first");
  process.exit(1);
}

const failures = [];
let checks = 0;
function ok(name, cond, detail) {
  checks++;
  if (cond) return;
  failures.push(name + (detail ? " — " + detail : ""));
}

let html = fs.readFileSync(EXAM_HTML, "utf8");
/* Test-only hook: expose the review renderer and state inside the engine IIFE. */
html = html.replace(
  "/* ================= boot ================= */",
  "window.__review = renderReview; window.__state = state; window.__flow = flow;\n/* boot */",
);

const errors = [];
const dom = new JSDOM(html, {
  runScripts: "dangerously",
  pretendToBeVisual: true,
  beforeParse(window) {
    window.Audio = class {
      constructor(src) { this.src = src; }
      play() { return Promise.resolve(); }
      pause() {}
      removeAttribute() {}
      load() {}
    };
    window.speechSynthesis = { speak() {}, cancel() {} };
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    window.scrollTo = () => {};
    window.addEventListener("error", (e) => errors.push(String(e.error || e.message)));
  },
});
const { window } = dom;
await new Promise((r) => setTimeout(r, 150));
const PTE = window.PTE;
const exam = JSON.parse(fs.readFileSync(CONTENT, "utf8"));

ok("engine booted", !!PTE);
ok("collocation list embedded", Array.isArray(window.ACL) && window.ACL.length > 2400, "pairs=" + (window.ACL || []).length);

const score = (type, data, ans, transcript) => PTE._score(type, data, ans, transcript);

/* ---- objective items ---- */
const fib = exam.reading.fibDropdown[0];
const fibPerfect = score("fibDropdown", fib, fib.blanks.map((b) => b.correct));
ok("fib blank perfect", fibPerfect && fibPerfect.got === fibPerfect.max, JSON.stringify(fibPerfect));
const fibEmpty = score("fibDropdown", fib, []);
ok("fib blank empty is zero", fibEmpty && fibEmpty.got === 0);

const wfd = exam.listening.writeFromDictation[0];
const wfdPerfect = score("wfd", wfd, wfd.text);
ok("write from dictation exact", wfdPerfect && wfdPerfect.got === wfdPerfect.max, JSON.stringify(wfdPerfect));

/* ---- essay rules ---- */
const essay = exam.essay[0];
const short = score("essay", essay, essay.sample);
ok("essay under 200 words scores zero", short && short.got === 0, JSON.stringify(short));

const goodBody =
  "Firstly, free university education creates equal opportunity for students from low income families. For example, young people who cannot rely on parental support are discouraged by the cost of tuition, and consequently talented applicants abandon academic study. Furthermore, public funding removes this barrier and allows admission to depend on academic achievement rather than family wealth.";
const body2 =
  "In addition, the opposing view deserves consideration, although it is not convincing. Some argue that students receive the main benefit of a degree, so they should carry the cost. Nevertheless, the whole economy gains from a skilled workforce, and evidence shows higher graduation rates. Moreover, graduates repay the investment through taxation.";
const intro =
  "Some people believe that university education should be free for every student, while others argue that students should pay their own tuition. In my opinion, tuition should be publicly funded, because free university education widens access and raises national skill levels.";
const ext1 =
  "This matters because a well educated population attracts investment, supports innovation and strengthens the tax base over time. In practice, countries that subsidised tuition report measurable gains in social mobility.";
const ext2 =
  "Critics also warn about the fiscal burden, yet the long term return on investment is substantial. For this reason, a phased programme of public funding is both affordable and effective.";
const concl =
  "In conclusion, the benefits of free university education clearly outweigh the drawbacks. To sum up, public funding is a sound investment in equal opportunity and national prosperity.";
const good = [intro, goodBody, body2, ext1, ext2, concl].join("\n\n");
const goodScore = score("essay", essay, good);
ok("essay on topic scores well", goodScore && goodScore.got >= 7, JSON.stringify(goodScore));
ok("essay detail reports components", goodScore && /paragraphs/.test(goodScore.detail) && /collocations/.test(goodScore.detail));

const copySample = score("essay", essay, [essay.sample, essay.sample, essay.sample, "In conclusion, tuition should be free for all students."].join("\n\n"));
ok("copied model answer is penalised", copySample && /copies the model answer/.test(copySample.detail), JSON.stringify(copySample));

/* ---- SWT rules ---- */
const swt = exam.summarizeWrittenText[0];
const tooLong = score("summarizeWrittenText", swt, new Array(80).fill("word").join(" "));
ok("swt over 75 words scores zero", tooLong && tooLong.got === 0, JSON.stringify(tooLong));
const one = score("summarizeWrittenText", swt, swt.sample);
const two = score("summarizeWrittenText", swt, swt.sample + " It also matters.");
ok("swt sample is one sentence", one && /1 sentence/.test(one.detail), JSON.stringify(one));
ok("swt multi-sentence scores lower", one && two && two.got < one.got, JSON.stringify(two));

/* ---- describe image ---- */
const di = exam.describeImage[0];
const diSample = score("describeImage", di, null, di.sample);
ok("describe image sample scores", diSample && diSample.got >= 2, JSON.stringify(diSample));
const diJunk = score("describeImage", di, null, "hello I like this picture very much and it is nice");
ok("describe image junk scores low", diJunk && diJunk.got <= 0.5, JSON.stringify(diJunk));

/* ---- reading weights and score report ---- */
const state = window.__state;
const flow = window.__flow;
state.mode = "guide";
state.answers["r_fibDropdown_0"] = fib.blanks.map((b) => b.correct);
const at = (type) => flow.findIndex((f) => f.type === type);
state.answers["s" + at("summarizeWrittenText")] = swt.sample;
state.answers["s" + at("writeFromDictation")] = wfd.text;
state.transcripts["s" + at("readAloud")] = exam.readAloud[0].text;
state.transcripts["s" + at("describeImage")] = di.sample;
window.__review();
await new Promise((r) => setTimeout(r, 60));
const doc = window.document;
const text = doc.body.textContent.replace(/\s+/g, " ");
ok("report shows a band", /Estimated band \d+ \/ 90/.test(text), text.slice(0, 120));
ok("report shows weighted reading", /test-weighted \d+%/.test(text));
ok("report lists skill rows", /Speaking: \d+%/.test(text) && /Reading: \d+%/.test(text) && /Listening: \d+%/.test(text));

ok("no page errors", errors.length === 0, errors.join(" | "));

console.log(`${checks - failures.length}/${checks} checks passed`);
if (failures.length) {
  console.error("\nFAILED:");
  failures.forEach((f) => console.error("  - " + f));
  process.exit(1);
}
