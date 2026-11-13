/* PTE Academic Mock Exam Engine (2026 format) — self-contained, no dependencies.
   Audio via Web Speech API (speechSynthesis). Mic via MediaRecorder. */
(function () {
"use strict";

var app = document.getElementById("app");
var C = EXAM;

/* ================= static text: instructions + guide tips ================= */
var TYPE_META = {
  readAloud: { title: "Read Aloud", part: 1,
    ins: "Look at the text below. In 35 seconds, you must read this text aloud as naturally and as clearly as possible. You have 40 seconds to read aloud.",
    tips: ["Use the 35s prep to read silently twice; mark hard words.", "Stress content words (nouns, verbs), glide over function words.", "Fall in intonation at full stops, rise at commas.", "Never go back to correct a mistake — keep flowing.", "Steady natural pace beats fast reading."] },
  repeatSentence: { title: "Repeat Sentence", part: 1,
    ins: "You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
    tips: ["Close your eyes and listen for meaning chunks, not single words.", "Copy the speaker's intonation and rhythm.", "If memory breaks, deliver the chunk you know fluently — partial fluent beats hesitant full.", "No note-taking time; start speaking as soon as the mic opens."] },
  describeImage: { title: "Describe Image", part: 1,
    ins: "Look at the graph below. In 25 seconds, please speak into the microphone and describe in detail what the graph is showing. You will have 40 seconds to give your response.",
    tips: ["Template: introduction (what it shows) → 2–3 key features (highest, lowest, trend, comparison) → conclusion.", "Never stop talking before 35s; silence costs fluency marks.", "Say approximate figures ('around 40 percent') — exact numbers not required.", "For maps/processes: describe positions/steps left-to-right."] },
  retellLecture: { title: "Re-tell Lecture", part: 1,
    ins: "You will hear a lecture. After listening to the lecture, in 10 seconds, please speak into the microphone and retell what you have just heard in your own words. You will have 40 seconds to give your response.",
    tips: ["Note 8–10 keywords: names, numbers, main nouns/verbs — not full sentences.", "Frame: 'The lecture discussed… The speaker explained that… In conclusion…'", "Fluency and content keywords matter more than grammar perfection.", "Keep speaking for the full 40 seconds."] },
  respondToSituation: { title: "Respond to a Situation", part: 1,
    ins: "You will hear and read a description of an everyday situation. You then have 20 seconds to think about your response and 40 seconds to speak. Answer as if you were really in the situation.",
    tips: ["Identify WHO you are talking to and WHAT outcome you want.", "Structure: polite opening → explain situation/problem → make your request or proposal → thank them.", "Match register: formal for staff/officials, casual for friends.", "Be specific — invent plausible details (dates, names, reasons)."] },
  summarizeGroupDiscussion: { title: "Summarize Group Discussion", part: 1,
    ins: "You will hear a discussion between several speakers. After listening, speak into the microphone and summarize what you have heard. You will have 60 seconds to give your response.",
    tips: ["Note each speaker's MAIN point + any agreement/disagreement between them.", "Frame: 'The speakers discussed… The first speaker argued… while the second believed… They agreed that…'", "Cover ALL speakers, not just one.", "Use reporting verbs: suggested, objected, agreed, proposed."] },
  answerShortQuestion: { title: "Answer Short Question", part: 1,
    ins: "You will hear a question. Please give a simple and short answer. Often just one or a few words is enough. You will hear the question only once.",
    tips: ["Answer with one or a few words — never a full sentence.", "Listen for the wh-word (who/where/what) to predict answer type.", "Tests general knowledge + vocabulary; don't overthink."] },
  summarizeWrittenText: { title: "Summarize Written Text", part: 1,
    ins: "Read the passage below and summarize it using ONE sentence. Type your response in the box at the bottom of the screen. You have 10 minutes. Your response will be judged on how well it presents the key points and on grammar, vocabulary and spelling. Your summary must be between 5 and 75 words.",
    tips: ["ONE sentence only — full stops inside the answer are fatal.", "Find the main claim, then attach 1–2 key supports with connectors (while, because, which, although).", "Aim 35–55 words.", "Save 1 minute to check subject-verb agreement and spelling."] },
  essay: { title: "Write Essay", part: 1,
    ins: "You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your ideas, present supporting details, and control the elements of standard written English. You should write 200–300 words.",
    tips: ["2–3 min plan: position + 2 arguments + examples.", "Structure: introduction (paraphrase + thesis) → body 1 → body 2 → conclusion.", "Start each body paragraph with a clear topic sentence; add an example.", "Save 2 minutes to proofread articles, plurals, verb endings."] },
  fibDropdown: { title: "Reading & Writing: Fill in the Blanks", part: 2,
    ins: "Below is a text with blanks. Click on each blank, and a drop-down list will appear. Select the appropriate answer choice for each blank.",
    tips: ["Read the whole sentence first for meaning, then use grammar (word form, collocation) to confirm.", "Verb tense/agreement and fixed collocations solve most blanks.", "These supply BOTH reading and writing marks — prioritise them."] },
  mcMultiple: { title: "Multiple Choice, Multiple Answers", part: 2,
    ins: "Read the text and answer the question by selecting all the correct responses. More than one response is correct. If you select a wrong option, one point is deducted, so do not guess.",
    tips: ["Skim the passage's main idea before reading options.", "Each correct option is usually a paraphrase of a passage detail.", "Avoid options that exaggerate ('always', 'never') beyond the text.", "Negative marking: skip an option if unsure."] },
  reorder: { title: "Re-order Paragraphs", part: 2,
    ins: "The text boxes in the left panel have been placed in a random order. Restore the original order by moving the text boxes.",
    tips: ["Find the opening sentence first: it has no pronouns, no 'this/these', no connectors like 'however'.", "Chain pronouns to nouns ('he' → the man; 'this method' → a method named earlier).", "Look for time sequence and lexical repetition links.", "Scoring counts adjacent pairs — even a partially correct chain earns points."] },
  fibDrag: { title: "Reading: Fill in the Blanks", part: 2,
    ins: "Below is a text with blanks. Drag words from the box below to fill the blanks.",
    tips: ["Sort the word bank by part of speech before dragging.", "Collocation is king: 'make a decision', 'heavy rain', 'conduct research'.", "Fill easiest blanks first; options shrink.", "Re-read completed text — it must flow grammatically."] },
  mcSingle: { title: "Multiple Choice, Single Answer", part: 2,
    ins: "Read the text and answer the multiple choice question by selecting the correct response. Only one response is correct.",
    tips: ["Read the question BEFORE the passage.", "Eliminate options contradicted or not mentioned in the text.", "Correct answer paraphrases; distractors copy words but twist meaning."] },
  sst: { title: "Summarize Spoken Text", part: 3,
    ins: "You will hear a short lecture. Write a summary for a fellow student who was not present. You should write 50–70 words. You have 10 minutes to finish this task.",
    tips: ["Note keywords, not sentences, while listening.", "Template: 'The speaker discussed X. He/She explained that… and highlighted… Finally, …'", "Stay within 50–70 words.", "Check spelling — it is scored."] },
  mcmL: { title: "Multiple Choice, Multiple Answers (Listening)", part: 3,
    ins: "Listen to the recording and answer the question by selecting all the correct responses. If you select a wrong option, one point is deducted.",
    tips: ["Read the options quickly while the audio begins.", "Listen for paraphrases, not identical wording.", "Negative marking — never guess."] },
  fillBlanksL: { title: "Fill in the Blanks (Listening)", part: 3,
    ins: "You will hear a recording. Type the missing words in each blank as you hear them.",
    tips: ["Type while listening — do not wait until the end.", "Watch the transcript ahead of your typing position.", "After the audio, check plural -s and past-tense -ed endings.", "Spelling counts; both US/UK accepted."] },
  hcs: { title: "Highlight Correct Summary", part: 3,
    ins: "Below are four possible summaries of the recording. Click on the paragraph that best captures what you have heard.",
    tips: ["Eliminate options containing information contradicted by the audio.", "Eliminate options adding details never mentioned.", "The correct option covers the WHOLE talk, not one detail."] },
  mcsL: { title: "Multiple Choice, Single Answer (Listening)", part: 3,
    ins: "Listen to the recording and answer the multiple choice question.",
    tips: ["Read the question stem first; listen with purpose.", "Distractors often repeat exact words from the audio with wrong meaning."] },
  smw: { title: "Select Missing Word", part: 3,
    ins: "You will hear a recording about a topic. At the end of the recording the last word or group of words is replaced by a beep. Select the correct option to complete the recording.",
    tips: ["Predict the word from context before the beep.", "Intonation direction (rising/falling) hints at positive/negative endings.", "Check grammar fit: singular/plural, verb form."] },
  hiw: { title: "Highlight Incorrect Words", part: 3,
    ins: "The transcription of a recording appears on screen. While listening to the recording, identify the words in the transcription that differ from what is said.",
    tips: ["Follow the text with your cursor exactly at audio pace.", "Click the moment a word mismatches — replacements are usually similar-sounding words.", "Every wrong click loses a point; only click genuine mismatches."] },
  wfd: { title: "Write from Dictation", part: 3,
    ins: "You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.",
    tips: ["Type continuously while listening; fix afterwards.", "Check the classic traps: a/an/the, plural -s, -ed endings, prepositions.", "You can add extra words without penalty — write all variants you are unsure of.", "This task is the highest-value listening item: guard every word."] }
};

/* ================= state ================= */
var state = {
  mode: null,            // 'real' | 'guide'
  step: 0,
  answers: {},           // key -> user answer
  recordings: {},        // key -> blob URL
  audioPlayed: {},       // key -> true
  timers: [],            // active interval/timeout ids
  speaking: false,       // TTS in flight
  readingLeft: 30 * 60,  // reading part clock (real mode)
  readingTick: null,
  mediaStream: null,
  recorder: null,
  recChunks: []
};

/* ================= flow construction ================= */
var flow = [];
function addItems(type, list, part) {
  (list || []).forEach(function (d, i) {
    flow.push({ kind: "item", part: part, type: type, data: d, idx: i, total: list.length });
  });
}
function buildFlow() {
  flow.length = 0;
  addItems("readAloud", C.readAloud, 1);
  addItems("repeatSentence", C.repeatSentence, 1);
  addItems("describeImage", C.describeImage, 1);
  addItems("retellLecture", C.retellLecture, 1);
  addItems("respondToSituation", C.respondToSituation, 1);
  addItems("summarizeGroupDiscussion", C.summarizeGroupDiscussion, 1);
  addItems("answerShortQuestion", C.answerShortQuestion, 1);
  addItems("summarizeWrittenText", C.summarizeWrittenText, 1);
  addItems("essay", C.essay, 1);
  flow.push({ kind: "reading", part: 2 });
  addItems("sst", C.listening.summarizeSpokenText, 3);
  addItems("mcmL", C.listening.mcMultiple, 3);
  addItems("fillBlanksL", C.listening.fillBlanks, 3);
  addItems("hcs", C.listening.highlightCorrectSummary, 3);
  addItems("mcsL", C.listening.mcSingle, 3);
  addItems("smw", C.listening.selectMissingWord, 3);
  addItems("hiw", C.listening.highlightIncorrectWords, 3);
  addItems("wfd", C.listening.writeFromDictation, 3);
}
function readingItems() {
  var r = C.reading, out = [];
  r.fibDropdown.forEach(function (d, i) { out.push({ type: "fibDropdown", data: d, idx: i, total: r.fibDropdown.length }); });
  r.mcMultiple.forEach(function (d, i) { out.push({ type: "mcMultiple", data: d, idx: i, total: r.mcMultiple.length }); });
  r.reorder.forEach(function (d, i) { out.push({ type: "reorder", data: d, idx: i, total: r.reorder.length }); });
  r.fibDrag.forEach(function (d, i) { out.push({ type: "fibDrag", data: d, idx: i, total: r.fibDrag.length }); });
  r.mcSingle.forEach(function (d, i) { out.push({ type: "mcSingle", data: d, idx: i, total: r.mcSingle.length }); });
  return out;
}

/* ================= helpers ================= */
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function key() { return "s" + state.step; }
function rkey(t, i) { return "r_" + t + "_" + i; }
function clearTimers() {
  state.timers.forEach(function (id) { clearTimeout(id); clearInterval(id); });
  state.timers = [];
  stopTTS();
}
function later(fn, ms) { var id = setTimeout(fn, ms); state.timers.push(id); return id; }
function every(fn, ms) { var id = setInterval(fn, ms); state.timers.push(id); return id; }
function fmt(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
function beep() {
  try {
    var ctx = beep._ctx || (beep._ctx = new (window.AudioContext || window.webkitAudioContext)());
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 720; g.gain.value = 0.18;
    o.start(); o.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}
function wordCount(t) { t = (t || "").trim(); return t ? t.split(/\s+/).length : 0; }

/* ================= TTS ================= */
function stopTTS() { try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} state.speaking = false; }
function speak(text, opts) {
  opts = opts || {};
  return new Promise(function (res) {
    if (!("speechSynthesis" in window)) { res(false); return; }
    var u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate || 0.95; u.pitch = opts.pitch || 1; u.lang = opts.lang || "en-AU";
    u.onend = function () { res(true); };
    u.onerror = function () { res(false); };
    state.speaking = true;
    speechSynthesis.speak(u);
  });
}
function speakTurns(turns) {
  var pitches = { A: 1.0, B: 1.35, C: 0.75, D: 1.15 };
  var i = 0, cancelled = false;
  state.ttsCancel = function () { cancelled = true; };
  return new Promise(function (res) {
    (function next() {
      if (cancelled || i >= turns.length) { res(!cancelled); return; }
      speak(turns[i].text, { pitch: pitches[turns[i].speaker] || 1, rate: 0.95 }).then(next);
      i++;
    })();
  });
}

/* ================= audio play controller (enforces single play in real mode) ================= */
function playAudio(k, playFn, onDone) {
  if (state.mode === "real" && state.audioPlayed[k]) { if (onDone) onDone(false); return false; }
  state.audioPlayed[k] = true;
  playFn().then(function (ok) { state.speaking = false; if (onDone) onDone(ok); });
  return true;
}

/* ================= mic ================= */
function ensureMic() {
  if (state.mediaStream) return Promise.resolve(true);
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.resolve(false);
  return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
    state.mediaStream = s; return true;
  }).catch(function () { return false; });
}
function startRecording(k) {
  if (!state.mediaStream) return false;
  state.recChunks = [];
  try { state.recorder = new MediaRecorder(state.mediaStream); } catch (e) { return false; }
  state.recorder.ondataavailable = function (e) { if (e.data.size) state.recChunks.push(e.data); };
  state.recorder.onstop = function () {
    var b = new Blob(state.recChunks, { type: state.recorder.mimeType || "audio/webm" });
    state.recordings[k] = URL.createObjectURL(b);
  };
  state.recorder.start();
  return true;
}
function stopRecording() {
  if (state.recorder && state.recorder.state !== "inactive") { try { state.recorder.stop(); } catch (e) {} }
}

/* ================= chrome (header / progress) ================= */
function chrome(partLabel, timerHtml) {
  var total = flow.length, cur = Math.min(state.step + 1, total);
  var pct = state.step === -1 ? 0 : Math.round((state.step) / (total - 1) * 100);
  return '<div class="topbar">' +
    '<div class="logo">PTE<span>·Academic</span> Mock</div>' +
    '<div class="mode ' + (state.mode === "guide" ? "guide" : "") + '">' + (state.mode === "guide" ? "GUIDE MODE" : "REAL MODE") + "</div>" +
    '<div class="spacer"></div>' +
    (partLabel ? '<div style="font-size:13px;opacity:.85">' + partLabel + "</div>" : "") +
    (timerHtml || "") +
    "</div>" +
    '<div class="progress"><div style="width:' + pct + '%"></div></div>';
}
function render(html) { app.innerHTML = html; window.scrollTo(0, 0); }
function tipsHtml(type) {
  if (state.mode !== "guide") return "";
  var t = TYPE_META[type].tips;
  return '<div class="tipsbox"><h4>Tips &amp; tricks</h4><ul>' + t.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>";
}
function sampleHtml(label, text) {
  return '<div class="samplebox"><h4>' + esc(label || "Sample answer") + '</h4><div>' + esc(text) + "</div></div>";
}
function guideExtra(type, data) {
  if (state.mode !== "guide" || !data.sample) return "";
  return '<div id="sampleWrap"><button class="btn sec small" onclick="PTE.showSample()">Show sample answer</button></div>';
}

/* ================= home ================= */
function renderHome() {
  state.step = -1;
  render(chrome(null, "") +
    '<div class="main"><div class="card">' +
    "<h1>" + esc(C.meta.title) + "</h1>" +
    '<div class="instructions">Full-length PTE Academic mock exam · 2026 test format (22 task types, ~2 hours). ' +
    "This simulation follows the official test-day workflow: three parts (Speaking &amp; Writing, Reading, Listening), " +
    "per-item timers, one-play audio, microphone recording, and auto-advance.</div>" +
    '<div class="modewrap">' +
    '<div class="modecard" onclick="PTE.pickMode(\'real\')"><h3>▶ Real Mode</h3>' +
    "<ul><li>Exact exam workflow &amp; strict timers</li><li>Audio plays ONCE only</li><li>Auto-advance, no tips, no pause</li><li>Mic recording like test day</li><li>Score report at the end</li></ul></div>" +
    '<div class="modecard" onclick="PTE.pickMode(\'guide\')"><h3>✎ Guide Mode</h3>' +
    "<ul><li>Tips &amp; tricks panel on every task</li><li>Replay audio freely, no forced timing</li><li>Sample answers / answer keys inline</li><li>Practice at your own pace</li><li>Same items &amp; scoring review</li></ul></div>" +
    "</div>" +
    '<div class="kv"><b>Requirements:</b> a browser with Web Speech API (audio prompts) and microphone access (speaking tasks). Chrome/Edge recommended.</div>' +
    '<div class="kv"><b>Content:</b> original practice items aligned to the 2026 PTE Academic format — including the newer <i>Respond to a Situation</i> and <i>Summarize Group Discussion</i> speaking tasks.</div>' +
    "</div></div>" +
    '<div class="footer-note">Unofficial practice material. Not affiliated with Pearson PLC. Scores are indicative only.</div>');
}

/* ================= mic check ================= */
function renderMicCheck() {
  render(chrome(null, "") +
    '<div class="main"><div class="card">' +
    "<h2>Microphone check</h2>" +
    '<div class="instructions">The real PTE Academic records your spoken responses. Allow microphone access, then speak a few words and check the indicator. You may skip this; speaking tasks will still run, but recordings will not be captured.</div>' +
    '<div class="statusbar"><span class="recdot" id="micdot"></span><span id="micstatus" class="statusline">Not tested yet</span></div>' +
    '<div class="statusbar"><button class="btn sec" id="micbtn">Enable microphone</button>' +
    '<button class="btn" id="micnext">Continue</button></div>' +
    "</div></div>");
  document.getElementById("micbtn").onclick = function () {
    ensureMic().then(function (ok) {
      var d = document.getElementById("micdot"), s = document.getElementById("micstatus");
      if (ok) {
        d.classList.add("on"); s.textContent = "Microphone ready — say something!";
        try {
          var ctx = new (window.AudioContext || window.webkitAudioContext)();
          var src = ctx.createMediaStreamSource(state.mediaStream);
          var an = ctx.createAnalyser(); src.connect(an);
          var buf = new Uint8Array(an.frequencyBinCount);
          every(function () {
            an.getByteTimeDomainData(buf);
            var m = 0; for (var i = 0; i < buf.length; i++) m = Math.max(m, Math.abs(buf[i] - 128));
            d.style.transform = "scale(" + (1 + Math.min(1.5, m / 40)) + ")";
          }, 120);
        } catch (e) {}
      } else { s.textContent = "Microphone unavailable — continuing without recording."; }
    });
  };
  document.getElementById("micnext").onclick = function () { clearTimers(); renderSectionIntro(1); };
}

/* ================= section intros ================= */
var SECTION_INFO = {
  1: { t: "Part 1: Speaking & Writing", d: "This part tests your speaking and writing skills. Speaking tasks record your voice; you will hear a short tone before each recording starts. Writing tasks are typed. Timers run per item.", time: "approx. 60–70 min" },
  2: { t: "Part 2: Reading", d: "This part tests your reading skills. A single clock governs the whole part — manage your time across all items. You may move between questions with the navigation panel.", time: "approx. 30 min" },
  3: { t: "Part 3: Listening", d: "This part tests your listening skills. Each recording plays automatically and only ONCE. Answer as you listen; the test advances automatically after each item.", time: "approx. 30 min" }
};
function renderSectionIntro(part) {
  clearTimers(); stopRecording();
  var s = SECTION_INFO[part];
  var tId = "secTimer";
  render(chrome(s.t, state.mode === "real" ? '<div class="timerbox" id="' + tId + '"></div>' : "") +
    '<div class="main"><div class="card">' +
    '<div class="partlabel">' + s.time + "</div><h1>" + s.t + "</h1>" +
    '<div class="instructions">' + s.d + "</div>" +
    (state.mode === "guide" ? '<div class="tipsbox"><h4>Guide mode</h4><ul><li>No forced timers here — take your time on every task.</li><li>Use the yellow tips panel on each task.</li><li>Replay audio and reveal sample answers whenever you like.</li></ul></div>' : '<div class="instructions" id="secCount">The test will begin automatically in <b>10</b> seconds…</div>') +
    '<div class="navrow"><span></span><button class="btn" id="secgo">' + (state.mode === "real" ? "Start now" : "Begin") + "</button></div>" +
    "</div></div>");
  var go = function () { clearTimers(); advanceFromIntro(part); };
  document.getElementById("secgo").onclick = go;
  if (state.mode === "real") {
    var n = 10;
    later(function () {}, 0);
    var iv = every(function () {
      n--;
      var el = document.getElementById("secCount");
      if (el) el.innerHTML = "The test will begin automatically in <b>" + n + "</b> seconds…";
      if (n <= 0) go();
    }, 1000);
  }
}
function advanceFromIntro(part) {
  if (part === 2) { startReadingPart(); return; }
  var pos = flow.findIndex(function (f, i) { return f.kind === "item" && f.part === part; });
  state.step = pos; renderStep();
}

/* ================= step renderer ================= */
function renderStep() {
  clearTimers(); stopRecording();
  var f = flow[state.step];
  if (!f) { renderReview(); return; }
  if (f.kind === "reading") { startReadingPart(); return; }
  var meta = TYPE_META[f.type];
  var partLabel = SECTION_INFO[f.part].t + " · " + meta.title + " " + (f.idx + 1) + " of " + f.total;
  if (SPEAK_RENDER[f.type]) SPEAK_RENDER[f.type](f, partLabel);
  else if (WRITE_RENDER[f.type]) WRITE_RENDER[f.type](f, partLabel);
  else LISTEN_RENDER[f.type](f, partLabel);
}
function next() { state.step++; renderStep(); }
function itemHead(f, partLabel, timerId) {
  return chrome(partLabel, timerId ? '<div class="timerbox" id="' + timerId + '">--:--</div>' : "") +
    '<div class="main"><div class="card"><div class="qtype-head">' +
    '<span class="qpos">' + (f.idx + 1) + " / " + f.total + "</span>" +
    '<span class="qtitle">' + TYPE_META[f.type].title + "</span></div>" +
    '<div class="instructions">' + TYPE_META[f.type].ins + "</div>" + tipsHtml(f.type);
}

/* ================= speaking items (generic state machine) ================= */
/* cfg: {showText, showImage, prepSec, recSec, audioFirst, audioTextFn, showPrompt} */
var SPEAK_CFG = {
  readAloud: { prep: 35, rec: 40, audio: false, show: "text" },
  repeatSentence: { prep: 0, rec: 15, audio: true, show: "none", delay: 3 },
  describeImage: { prep: 25, rec: 40, audio: false, show: "image" },
  retellLecture: { prep: 10, rec: 40, audio: true, show: "title" },
  respondToSituation: { prep: 20, rec: 40, audio: true, show: "prompt" },
  summarizeGroupDiscussion: { prep: 0, rec: 60, audio: true, show: "topic" },
  answerShortQuestion: { prep: 0, rec: 10, audio: true, show: "none", delay: 1 }
};
var SPEAK_RENDER = {};
["readAloud", "repeatSentence", "describeImage", "retellLecture", "respondToSituation", "summarizeGroupDiscussion", "answerShortQuestion"]
  .forEach(function (type) { SPEAK_RENDER[type] = function (f, partLabel) { renderSpeaking(f, partLabel, SPEAK_CFG[type]); }; });

function speakingContentHtml(f, cfg) {
  var d = f.data, h = "";
  if (cfg.show === "text") h += '<div class="promptbox">' + esc(d.text) + "</div>";
  if (cfg.show === "image") h += '<div class="figbox"><h3>' + esc(d.title || "") + "</h3>" + (d.svg || "") + "</div>";
  if (cfg.show === "title") h += '<div class="promptbox"><b>Topic:</b> ' + esc(d.title || "Lecture") + "</div>";
  if (cfg.show === "prompt") h += '<div class="promptbox">' + esc(d.prompt) + "</div>";
  if (cfg.show === "topic") h += '<div class="promptbox"><b>Discussion topic:</b> ' + esc(d.topic) + "</div>";
  return h;
}
function speakingAudioFn(f, cfg) {
  var d = f.data;
  if (!cfg.audio) return null;
  if (f.type === "summarizeGroupDiscussion") return function () { return speakTurns(d.turns); };
  if (f.type === "respondToSituation") return function () { return speak(d.audio || d.prompt); };
  if (f.type === "retellLecture") return function () { return speak(d.text, { rate: 0.92 }); };
  if (f.type === "repeatSentence" || f.type === "answerShortQuestion") return function () { return speak(d.text || d.question); };
  return null;
}
function renderSpeaking(f, partLabel, cfg) {
  var k = key(), d = f.data;
  var timerId = state.mode === "real" ? "spTimer" : null;
  var html = itemHead(f, partLabel, timerId) +
    speakingContentHtml(f, cfg) +
    '<div class="statusbar">' +
    '<span class="recdot" id="dot"></span>' +
    '<span class="statusline" id="stline">Waiting…</span>' +
    '<div class="audbar" id="bar"><div></div></div>' +
    '<span class="timechip" id="clock"></span>' +
    "</div>";
  if (state.mode === "guide") {
    html += '<div class="statusbar">' +
      (cfg.audio ? '<button class="btn sec small" id="gplay">▶ Play audio</button>' : "") +
      '<button class="btn sec small" id="grec">● Start recording</button>' +
      '<button class="btn sec small" id="gstop" disabled>■ Stop</button>' +
      "</div>" + guideExtra(f.type, d) +
      '<div id="guideNote"></div>';
  }
  html += '<div class="navrow"><span>' + (state.mode === "guide" ? '<button class="btn sec" id="prevbtn">← Back</button>' : "") + "</span>" +
    '<button class="btn" id="nextbtn"' + (state.mode === "real" ? " disabled" : "") + ">Next →</button></div></div></div>";
  render(html);

  var stline = document.getElementById("stline"), clock = document.getElementById("clock"),
      dot = document.getElementById("dot"), bar = document.getElementById("bar"),
      nextBtn = document.getElementById("nextbtn");
  var prevBtn = document.getElementById("prevbtn");
  if (prevBtn) prevBtn.onclick = function () { state.step--; renderStep(); };
  nextBtn.onclick = function () { stopRecording(); stopTTS(); next(); };

  function setBar(p, rec) { bar.className = "audbar" + (rec ? " rec" : ""); bar.firstElementChild.style.width = Math.min(100, p) + "%"; }
  function runTimer(sec, label, rec, done) {
    var total = sec;
    clock.textContent = fmt(sec);
    every(function () {
      sec -= 0.25; clock.textContent = fmt(sec); setBar((1 - sec / total) * 100, rec);
      if (sec <= 0) { clearTimers(); done(); }
    }, 250);
  }
  function startRecPhase() {
    beep();
    stline.textContent = "Recording — speak now";
    dot.classList.add("on");
    ensureMic().then(function (ok) { if (ok) startRecording(k); });
    runTimer(cfg.rec, "rec", true, function () {
      stopRecording(); dot.classList.remove("on");
      stline.textContent = "Recording finished";
      nextBtn.disabled = false;
      if (state.mode === "real") later(next, 800);
    });
  }
  function startPrepPhase() {
    if (cfg.prep > 0) {
      stline.textContent = "Preparing…";
      runTimer(cfg.prep, "prep", false, startRecPhase);
    } else startRecPhase();
  }
  function startAudioPhase() {
    var fn = speakingAudioFn(f, cfg);
    if (!fn) { startPrepPhase(); return; }
    stline.textContent = "Playing audio…";
    playAudio(k, fn, function () {
      if (state.mode === "real") later(startPrepPhase, (cfg.delay || 2) * 1000);
      else { stline.textContent = "Audio finished — press ● Start recording"; }
    });
  }

  if (state.mode === "real") {
    nextBtn.disabled = true;
    if (cfg.audio) later(startAudioPhase, 1200);
    else later(startPrepPhase, 1200);
    var t = document.getElementById(timerId);
    if (t) { var secs = cfg.prep + cfg.rec + (cfg.audio ? 200 : 0); }
  } else {
    nextBtn.disabled = false;
    stline.textContent = "Guide mode — work at your own pace";
    var gp = document.getElementById("gplay"), gr = document.getElementById("grec"), gs = document.getElementById("gstop");
    if (gp) gp.onclick = function () { stopTTS(); playAudio(k + "_g", speakingAudioFn(f, cfg), function () { stline.textContent = "Audio finished"; }); stline.textContent = "Playing audio…"; };
    gr.onclick = function () {
      ensureMic().then(function (ok) {
        if (!ok) { stline.textContent = "No microphone — recording skipped"; return; }
        beep(); startRecording(k); dot.classList.add("on");
        stline.textContent = "Recording — press ■ Stop when done";
        gr.disabled = true; gs.disabled = false;
      });
    };
    gs.onclick = function () { stopRecording(); dot.classList.remove("on"); stline.textContent = "Recording saved (see review at end)"; gr.disabled = false; gs.disabled = true; };
  }
  window._pteSample = d.sample || d.text || d.question || null;
}

/* ================= writing items ================= */
var WRITE_RENDER = {};
["summarizeWrittenText", "essay"].forEach(function (t) {
  WRITE_RENDER[t] = function (f, partLabel) {
    var k = key(), d = f.data;
    var isSWT = t === "summarizeWrittenText";
    var secs = isSWT ? 600 : 1200;
    var min = isSWT ? 5 : 200, max = isSWT ? 75 : 300;
    var html = itemHead(f, partLabel, state.mode === "real" ? "wTimer" : null) +
      (isSWT ? '<div class="promptbox">' + esc(d.passage) + "</div>" : '<div class="promptbox"><b>' + esc(d.prompt) + "</b></div>") +
      '<textarea id="wtext" rows="' + (isSWT ? 5 : 14) + '" placeholder="Type your response here…"></textarea>' +
      '<div class="wordcount" id="wc">Word Count: 0 (target ' + min + "–" + max + ")</div>" +
      guideExtra(t, d) +
      '<div class="navrow"><span>' + (state.mode === "guide" ? '<button class="btn sec" id="prevbtn">← Back</button>' : "") + "</span>" +
      '<button class="btn" id="nextbtn">Next →</button></div></div></div>';
    render(html);
    window._pteSample = d.sample || null;
    var ta = document.getElementById("wtext"), wc = document.getElementById("wc");
    var saved = state.answers[k]; if (saved) ta.value = saved;
    function upd() {
      var n = wordCount(ta.value);
      wc.textContent = "Word Count: " + n + " (target " + min + "–" + max + ")";
      wc.className = "wordcount" + ((n > 0 && (n < min || n > max)) ? " bad" : "");
      state.answers[k] = ta.value;
    }
    ta.oninput = upd; upd();
    var prevBtn = document.getElementById("prevbtn");
    if (prevBtn) prevBtn.onclick = function () { state.answers[k] = ta.value; state.step--; renderStep(); };
    document.getElementById("nextbtn").onclick = function () { state.answers[k] = ta.value; next(); };
    if (state.mode === "real") {
      var el = document.getElementById("wTimer"), left = secs;
      el.textContent = fmt(left);
      every(function () {
        left--; el.textContent = fmt(left);
        if (left <= 60) el.classList.add("warn");
        if (left <= 0) { state.answers[k] = ta.value; clearTimers(); next(); }
      }, 1000);
    }
  };
});

/* ================= reading part ================= */
function startReadingPart() {
  clearTimers(); stopRecording();
  var items = readingItems();
  var cur = 0;
  var timerHtml = state.mode === "real" ? '<div class="timerbox" id="rdTimer">' + fmt(state.readingLeft) + "</div>" : "";
  function draw() {
    var it = items[cur], meta = TYPE_META[it.type], rk = rkey(it.type, it.idx);
    var nav = items.map(function (x, i) {
      var done = state.answers[rkey(x.type, x.idx)] != null;
      return '<button class="' + (i === cur ? "cur " : "") + (done ? "done" : "") + '" data-i="' + i + '">' + meta2short(x.type) + " " + (x.idx + 1) + "</button>";
    }).join("");
    var h = chrome("Part 2: Reading · " + meta.title + " " + (it.idx + 1) + " of " + it.total, timerHtml) +
      '<div class="main"><div class="readwrap"><div class="readnav">' + nav + "</div>" +
      '<div class="readmain"><div class="card">' +
      '<div class="qtype-head"><span class="qpos">' + (cur + 1) + " / " + items.length + '</span><span class="qtitle">' + meta.title + "</span></div>" +
      '<div class="instructions">' + meta.ins + "</div>" + tipsHtml(it.type) +
      '<div id="rbody"></div>' +
      '<div class="navrow"><button class="btn sec" id="rprev"' + (cur === 0 ? " disabled" : "") + ">← Previous</button>" +
      (cur < items.length - 1
        ? '<button class="btn" id="rnext">Next →</button>'
        : '<button class="btn warn" id="rfinish">' + (state.mode === "real" ? "End Reading Part" : "Finish Reading → Listening") + "</button>") +
      "</div></div></div></div></div>";
    render(h);
    document.querySelectorAll(".readnav button").forEach(function (b) {
      b.onclick = function () { saveCur(); cur = +b.dataset.i; draw(); };
    });
    drawReadingBody(it, rk);
    var pv = document.getElementById("rprev"); if (pv) pv.onclick = function () { saveCur(); cur--; draw(); };
    var nx = document.getElementById("rnext"); if (nx) nx.onclick = function () { saveCur(); cur++; draw(); };
    var fn = document.getElementById("rfinish"); if (fn) fn.onclick = function () { saveCur(); finishReading(); };
  }
  function saveCur() {
    var it = items[cur], rk = rkey(it.type, it.idx);
    var v = collectReadingAnswer(it);
    if (v != null) state.answers[rk] = v;
  }
  function finishReading() {
    if (state.readingTick) { clearInterval(state.readingTick); state.readingTick = null; }
    renderSectionIntro(3);
  }
  draw();
  if (state.mode === "real") {
    if (state.readingTick) clearInterval(state.readingTick);
    state.readingTick = setInterval(function () {
      state.readingLeft--;
      var el = document.getElementById("rdTimer");
      if (el) { el.textContent = fmt(state.readingLeft); if (state.readingLeft <= 120) el.classList.add("warn"); }
      if (state.readingLeft <= 0) {
        clearInterval(state.readingTick); state.readingTick = null;
        try { saveCur(); } catch (e) {}
        finishReading();
      }
    }, 1000);
  }
}
function meta2short(t) {
  return { fibDropdown: "FIB-RW", mcMultiple: "MC-M", reorder: "RO", fibDrag: "FIB-R", mcSingle: "MC-S" }[t] || t;
}
function blanksHtml(text, n) {
  var out = esc(text);
  for (var i = 1; i <= n; i++) out = out.replace(new RegExp("\\{\\{" + i + "\\}\\}", "g"), "⟦B" + i + "⟧");
  return out;
}
function drawReadingBody(it, rk) {
  var body = document.getElementById("rbody"), d = it.data, saved = state.answers[rk];
  if (it.type === "fibDropdown") {
    var n = d.blanks.length, html = '<div class="promptbox">' + blanksHtml(d.text, n) + "</div>";
    body.innerHTML = html;
    for (var i = 0; i < n; i++) {
      var sel = '<select data-b="' + i + '"><option value="">— select —</option>' +
        d.blanks[i].options.map(function (o, j) { return '<option value="' + j + '">' + esc(o) + "</option>"; }).join("") + "</select>";
      body.innerHTML = body.innerHTML.replace("⟦B" + (i + 1) + "⟧", sel);
    }
    body.querySelectorAll("select").forEach(function (s) {
      if (saved && saved[s.dataset.b] != null) s.value = saved[s.dataset.b];
      s.onchange = function () {
        var cur2 = state.answers[rk] || [];
        cur2[s.dataset.b] = s.value === "" ? null : +s.value;
        state.answers[rk] = cur2;
      };
    });
  } else if (it.type === "mcMultiple" || it.type === "mcSingle") {
    var multi = it.type === "mcMultiple";
    var h = '<div class="promptbox">' + esc(d.passage) + "</div><h3>" + esc(d.question) + "</h3>";
    h += d.options.map(function (o, j) {
      return '<label class="optrow"><input type="' + (multi ? "checkbox" : "radio") + '" name="rq" value="' + j + '"> ' + esc(o) + "</label>";
    }).join("");
    body.innerHTML = h;
    body.querySelectorAll("input").forEach(function (inp) {
      if (saved != null && (multi ? saved.indexOf(+inp.value) >= 0 : saved === +inp.value)) inp.checked = true;
      inp.onchange = function () {
        if (multi) {
          var vals = [];
          body.querySelectorAll("input:checked").forEach(function (x) { vals.push(+x.value); });
          state.answers[rk] = vals;
        } else state.answers[rk] = +inp.value;
      };
    });
  } else if (it.type === "reorder") {
    var order = saved || shuffleIdx(d.sentences.length);
    state.answers[rk] = order;
    var render2 = function () {
      body.innerHTML = "<h3>Arrange in the original order:</h3>" + order.map(function (si, pos) {
        return '<div class="reitem"><div class="mv"><button data-p="' + pos + '" data-mv="-1">▲</button><button data-p="' + pos + '" data-mv="1">▼</button></div><div class="txt">' + esc(d.sentences[si]) + "</div></div>";
      }).join("");
      body.querySelectorAll("button").forEach(function (b) {
        b.onclick = function () {
          var p = +b.dataset.p, mv = +b.dataset.mv, q = p + mv;
          if (q < 0 || q >= order.length) return;
          var t = order[p]; order[p] = order[q]; order[q] = t;
          state.answers[rk] = order; render2();
        };
      });
    };
    render2();
  } else if (it.type === "fibDrag") {
    var ans = saved ? saved.slice() : d.answers.map(function () { return null; });
    state.answers[rk] = ans;
    var nB = d.answers.length;
    var render3 = function () {
      var html = '<div class="promptbox">' + blanksHtml(d.text, nB) + "</div>";
      html += '<div class="fibbank">' + d.bank.map(function (w) {
        return '<span class="chip' + (ans.indexOf(w) >= 0 ? " used" : "") + '" data-w="' + esc(w) + '">' + esc(w) + "</span>";
      }).join("") + "</div>";
      body.innerHTML = html;
      for (var i = 0; i < nB; i++) {
        var b = '<span class="blank" data-b="' + i + '">' + (ans[i] ? esc(ans[i]) : "") + "</span>";
        body.innerHTML = body.innerHTML.replace("⟦B" + (i + 1) + "⟧", b);
      }
      var selB = null;
      body.querySelectorAll(".chip").forEach(function (c) {
        c.onclick = function () {
          if (selB == null) { var free = ans.indexOf(null); if (free < 0) return; selB = free; }
          ans[selB] = c.dataset.w; selB = null; state.answers[rk] = ans; render3();
        };
      });
      body.querySelectorAll(".blank").forEach(function (bEl) {
        bEl.onclick = function () {
          var bi = +bEl.dataset.b;
          if (ans[bi]) { ans[bi] = null; state.answers[rk] = ans; render3(); }
          else selB = bi;
        };
      });
    };
    render3();
  }
  if (state.mode === "guide") {
    var gdiv = document.createElement("div");
    gdiv.innerHTML = '<button class="btn sec small" style="margin-top:10px" id="gkey">Show answer key</button><div id="gkeyout"></div>';
    body.appendChild(gdiv);
    document.getElementById("gkey").onclick = function () {
      document.getElementById("gkeyout").innerHTML = sampleHtml("Answer key", readingKeyText(it));
    };
  }
}
function collectReadingAnswer(it) { return state.answers[rkey(it.type, it.idx)] != null ? state.answers[rkey(it.type, it.idx)] : null; }
function readingKeyText(it) {
  var d = it.data;
  if (it.type === "fibDropdown") return d.blanks.map(function (b, i) { return "Blank " + (i + 1) + ": " + b.options[b.correct]; }).join(" · ");
  if (it.type === "fibDrag") return d.answers.map(function (a, i) { return "Blank " + (i + 1) + ": " + a; }).join(" · ");
  if (it.type === "mcMultiple") return "Correct: " + d.answers.map(function (a) { return d.options[a]; }).join(" + ");
  if (it.type === "mcSingle") return "Correct: " + d.options[d.answer];
  if (it.type === "reorder") return "Correct order: " + d.sentences.map(function (s, i) { return "(" + (i + 1) + ") " + s; }).join(" ");
  return "";
}
function shuffleIdx(n) {
  var a = []; for (var i = 0; i < n; i++) a.push(i);
  do {
    for (var j = n - 1; j > 0; j--) { var r = Math.floor(Math.random() * (j + 1)); var t = a[j]; a[j] = a[r]; a[r] = t; }
  } while (a.every(function (v, i) { return v === i; }) && n > 1);
  return a;
}

/* ================= listening items ================= */
var LISTEN_RENDER = {};
function listenShell(f, partLabel, audioTextFn, bodyBuilder, opts) {
  opts = opts || {};
  var k = key(), timerId = state.mode === "real" ? "lTimer" : null;
  var html = itemHead(f, partLabel, timerId) +
    '<div class="statusbar"><span class="recdot" id="dot"></span>' +
    '<span class="statusline" id="stline">Audio will play shortly…</span>' +
    '<div class="audbar" id="bar"><div></div></div></div>' +
    (state.mode === "guide" ? '<div class="statusbar"><button class="btn sec small" id="gplay">▶ Play audio</button></div>' : "") +
    '<div id="lbody"></div>' +
    (state.mode === "guide" ? '<div><button class="btn sec small" id="gkey" style="margin-top:10px">Show answer key</button><div id="gkeyout"></div></div>' : "") +
    '<div class="navrow"><span>' + (state.mode === "guide" ? '<button class="btn sec" id="prevbtn">← Back</button>' : "") + "</span>" +
    '<button class="btn" id="nextbtn"' + (state.mode === "real" && !opts.manualNext ? " disabled" : "") + ">Next →</button></div></div></div>";
  render(html);
  var body = document.getElementById("lbody");
  bodyBuilder(body, k);
  var prevBtn = document.getElementById("prevbtn"); if (prevBtn) prevBtn.onclick = function () { state.step--; renderStep(); };
  var nextBtn = document.getElementById("nextbtn");
  nextBtn.onclick = function () { stopTTS(); next(); };
  var gk = document.getElementById("gkey");
  if (gk) gk.onclick = function () {
    document.getElementById("gkeyout").innerHTML = sampleHtml(opts.keyLabel || "Answer key / transcript", opts.keyText || f.data.audio || f.data.text || "");
  };
  var gp = document.getElementById("gplay");
  if (gp) gp.onclick = function () { stopTTS(); playOnce(f, k, audioTextFn, opts, true); };
  if (state.mode === "real") later(function () { playOnce(f, k, audioTextFn, opts, false); }, 1200);
  else document.getElementById("stline").textContent = "Press ▶ Play audio when ready";
  function enableNext() { if (nextBtn && opts.manualNext) nextBtn.disabled = false; }
  return { enableNext: enableNext, nextBtn: nextBtn };
}
function playOnce(f, k, audioTextFn, opts, isGuide) {
  var stline = document.getElementById("stline"), bar = document.getElementById("bar"), dot = document.getElementById("dot");
  stline.textContent = "Playing audio…"; dot.classList.add("on");
  var est = Math.min(150, Math.max(8, wordCount(opts.audioLen || "") * 0.42)) * 1000;
  var t0 = Date.now(), stopped = false;
  every(function () {
    var p = (Date.now() - t0) / est * 100;
    bar.firstElementChild.style.width = Math.min(99, p) + "%";
    if (p >= 99 || !state.speaking) {
      if (!state.speaking) { bar.firstElementChild.style.width = "100%"; }
    }
  }, 300);
  playAudio(isGuide ? k + "_g" + Date.now() : k, audioTextFn, function () {
    clearTimers(); dot.classList.remove("on");
    bar.firstElementChild.style.width = "100%";
    stline.textContent = "Audio finished";
    if (state.mode === "real" && opts.autoAfter !== false) {
      var nb = document.getElementById("nextbtn");
      if (nb) { nb.disabled = false; if (opts.autoNext) later(next, opts.autoNext * 1000); }
    }
    if (opts.afterAudio) opts.afterAudio();
  });
}
/* specific listening renderers */
LISTEN_RENDER.sst = function (f, partLabel) {
  var d = f.data, k = key();
  var secs = 600;
  var shell = listenShell(f, partLabel, function () { return speak(d.audio, { rate: 0.92 }); }, function (body) {
    body.innerHTML = '<div class="promptbox"><b>Topic:</b> ' + esc(d.title) + "</div>" +
      '<textarea rows="7" id="sstText" placeholder="Write your summary here (50–70 words)…"></textarea>' +
      '<div class="wordcount" id="wc">Word Count: 0 (target 50–70)</div>';
    var ta = body.querySelector("#sstText");
    if (state.answers[k]) ta.value = state.answers[k];
    ta.oninput = function () {
      var n = wordCount(ta.value);
      var wc = body.querySelector("#wc");
      wc.textContent = "Word Count: " + n + " (target 50–70)";
      wc.className = "wordcount" + ((n > 0 && (n < 50 || n > 70)) ? " bad" : "");
      state.answers[k] = ta.value;
    };
  }, { keyText: d.sample, keyLabel: "Sample summary", autoNext: false, audioLen: d.audio });
  if (state.mode === "real") {
    var el = document.getElementById("lTimer"), left = secs;
    el.textContent = fmt(left);
    every(function () {
      left--; el.textContent = fmt(left);
      if (left <= 60) el.classList.add("warn");
      if (left <= 0) { clearTimers(); next(); }
    }, 1000);
  }
};
function mcListenRender(f, partLabel, multi) {
  var d = f.data, k = key();
  listenShell(f, partLabel, function () { return speak(d.audio); }, function (body) {
    var h = "<h3>" + esc(d.question) + "</h3>" + d.options.map(function (o, j) {
      return '<label class="optrow"><input type="' + (multi ? "checkbox" : "radio") + '" name="lq" value="' + j + '"> ' + esc(o) + "</label>";
    }).join("");
    body.innerHTML = h;
    body.querySelectorAll("input").forEach(function (inp) {
      inp.onchange = function () {
        if (multi) {
          var v = [];
          body.querySelectorAll("input:checked").forEach(function (x) { v.push(+x.value); });
          state.answers[k] = v;
        } else state.answers[k] = +inp.value;
      };
    });
  }, { keyText: multi ? "Correct: " + d.answers.map(function (a) { return d.options[a]; }).join(" + ") : "Correct: " + d.options[d.answer], autoNext: state.mode === "real" ? 4 : false, audioLen: d.audio });
}
LISTEN_RENDER.mcmL = function (f, pl) { mcListenRender(f, pl, true); };
LISTEN_RENDER.mcsL = function (f, pl) { mcListenRender(f, pl, false); };
LISTEN_RENDER.hcs = function (f, pl) { mcListenRender({ type: "hcs", data: { audio: f.data.audio, question: "Click on the paragraph that best relates to the recording you have heard.", options: f.data.options, answer: f.data.answer }, idx: f.idx, total: f.total }, pl, false); };
LISTEN_RENDER.smw = function (f, partLabel) {
  var d = f.data;
  listenShell(f, partLabel, function () { return speak(d.audio).then(function (ok) { beep(); return ok; }); }, function (body) {
    body.innerHTML = "<h3>Select the missing word:</h3>" + d.options.map(function (o, j) {
      return '<label class="optrow"><input type="radio" name="smw" value="' + j + '"> ' + esc(o) + "</label>";
    }).join("");
    body.querySelectorAll("input").forEach(function (inp) {
      inp.onchange = function () { state.answers[key()] = +inp.value; };
    });
  }, { keyText: "Correct: " + d.options[d.answer] + " — full text: " + (d.fullText || d.audio), autoNext: state.mode === "real" ? 4 : false, audioLen: d.audio });
};
LISTEN_RENDER.fillBlanksL = function (f, partLabel) {
  var d = f.data, k = key();
  listenShell(f, partLabel, function () { return speak(d.audio); }, function (body) {
    var n = d.answers.length, html = '<div class="promptbox">' + blanksHtml(d.display, n) + "</div>";
    body.innerHTML = html;
    for (var i = 0; i < n; i++) {
      var inp = '<input type="text" data-b="' + i + '" style="width:150px" value=""> ';
      body.innerHTML = body.innerHTML.replace("⟦B" + (i + 1) + "⟧", inp);
    }
    var saved = state.answers[k];
    body.querySelectorAll("input").forEach(function (x) {
      if (saved && saved[x.dataset.b]) x.value = saved[x.dataset.b];
      x.oninput = function () {
        var v = state.answers[k] || [];
        v[x.dataset.b] = x.value;
        state.answers[k] = v;
      };
    });
  }, { keyText: "Answers: " + d.answers.join(" · ") + " — transcript: " + d.audio, autoNext: state.mode === "real" ? 8 : false, audioLen: d.audio });
};
LISTEN_RENDER.hiw = function (f, partLabel) {
  var d = f.data, k = key();
  var audioText = d.words.map(function (w) { return w.said || w.w; }).join(" ");
  listenShell(f, partLabel, function () { return speak(audioText, { rate: 0.98 }); }, function (body) {
    body.innerHTML = '<div class="promptbox">' + d.words.map(function (w, i) {
      return '<span class="hiw-word" data-i="' + i + '">' + esc(w.w) + "</span>";
    }).join(" ") + "</div>";
    var sel = state.answers[k] || [];
    state.answers[k] = sel;
    body.querySelectorAll(".hiw-word").forEach(function (s) {
      if (sel.indexOf(+s.dataset.i) >= 0) s.classList.add("sel");
      s.onclick = function () {
        var i = +s.dataset.i, p = sel.indexOf(i);
        if (p >= 0) { sel.splice(p, 1); s.classList.remove("sel"); }
        else { sel.push(i); s.classList.add("sel"); }
      };
    });
  }, { keyText: "Incorrect words: " + d.words.filter(function (w) { return w.wrong; }).map(function (w) { return '"' + w.w + '" (said: "' + w.said + '")'; }).join(" · "), autoNext: state.mode === "real" ? 6 : false, audioLen: audioText });
};
LISTEN_RENDER.wfd = function (f, partLabel) {
  var d = f.data, k = key();
  listenShell(f, partLabel, function () { return speak(d.text, { rate: 0.95 }); }, function (body) {
    body.innerHTML = '<textarea rows="3" id="wfdText" placeholder="Type the sentence exactly as you hear it…"></textarea>';
    var ta = body.querySelector("#wfdText");
    if (state.answers[k]) ta.value = state.answers[k];
    ta.oninput = function () { state.answers[k] = ta.value; };
  }, { keyText: d.text, autoNext: state.mode === "real" ? 10 : false, audioLen: d.text });
};

/* ================= scoring ================= */
function norm(s) { return (s || "").toLowerCase().trim().replace(/[.,;:!?'"()-]/g, ""); }
function scoreItem(type, d, ans) {
  /* returns {got, max, detail} or null for non-objective */
  if (type === "fibDropdown") {
    var got = 0; d.blanks.forEach(function (b, i) { if (ans && ans[i] != null && +ans[i] === b.correct) got++; });
    return { got: got, max: d.blanks.length };
  }
  if (type === "fibDrag") {
    var g2 = 0; d.answers.forEach(function (a, i) { if (ans && norm(ans[i]) === norm(a)) g2++; });
    return { got: g2, max: d.answers.length };
  }
  if (type === "mcMultiple" || type === "mcmL") {
    if (!ans || !ans.length) return { got: 0, max: d.answers.length };
    var sc = 0; ans.forEach(function (a) { sc += d.answers.indexOf(a) >= 0 ? 1 : -1; });
    return { got: Math.max(0, sc), max: d.answers.length };
  }
  if (type === "mcSingle" || type === "mcsL" || type === "hcs" || type === "smw")
    return { got: ans != null && +ans === d.answer ? 1 : 0, max: 1 };
  if (type === "reorder") {
    if (!ans) return { got: 0, max: d.sentences.length - 1 };
    var pos = {}; ans.forEach(function (si, p) { pos[si] = p; });
    var ok = 0; for (var i = 0; i < d.sentences.length - 1; i++) if (pos[i] < pos[i + 1]) ok++;
    return { got: ok, max: d.sentences.length - 1 };
  }
  if (type === "fillBlanksL") {
    var g3 = 0; d.answers.forEach(function (a, i) { if (ans && norm(ans[i]) === norm(a)) g3++; });
    return { got: g3, max: d.answers.length };
  }
  if (type === "hiw") {
    var wrongIdx = []; d.words.forEach(function (w, i) { if (w.wrong) wrongIdx.push(i); });
    if (!ans || !ans.length) return { got: 0, max: wrongIdx.length };
    var s2 = 0; ans.forEach(function (i) { s2 += wrongIdx.indexOf(i) >= 0 ? 1 : -1; });
    return { got: Math.max(0, s2), max: wrongIdx.length };
  }
  if (type === "wfd") {
    var ref = norm(d.text).split(/\s+/), usr = norm(ans).split(/\s+/), g4 = 0;
    for (var j = 0; j < ref.length; j++) if (usr[j] === ref[j]) g4++;
    return { got: g4, max: ref.length };
  }
  return null;
}
function answerSummary(type, d, ans) {
  if (ans == null) return "<i>No answer</i>";
  if (type === "fibDropdown") return d.blanks.map(function (b, i) { return "Blank " + (i + 1) + ": " + (ans[i] != null && ans[i] !== "" ? esc(b.options[ans[i]]) : "—"); }).join(" · ");
  if (type === "fibDrag" || type === "fillBlanksL") return d.answers.map(function (a, i) { return "Blank " + (i + 1) + ": " + (ans[i] ? esc(ans[i]) : "—"); }).join(" · ");
  if (type === "mcMultiple" || type === "mcmL") return ans.length ? ans.map(function (a) { return esc(d.options[a]); }).join(" + ") : "<i>No selection</i>";
  if (type === "mcSingle" || type === "mcsL" || type === "hcs" || type === "smw") return esc(d.options[ans]);
  if (type === "reorder") return ans.map(function (si) { return "(" + (si + 1) + ")"; }).join(" → ");
  if (type === "hiw") return ans.length ? ans.map(function (i) { return '"' + esc(d.words[i].w) + '"'; }).join(" ") : "<i>No words highlighted</i>";
  if (type === "wfd" || type === "summarizeWrittenText" || type === "essay" || type === "sst") return esc(ans).slice(0, 600);
  return esc(JSON.stringify(ans));
}
function correctSummary(type, d) {
  if (type === "fibDropdown" || type === "fibDrag" || type === "mcMultiple" || type === "mcSingle" || type === "reorder") return readingKeyText({ type: type, data: d });
  if (type === "mcmL") return "Correct: " + d.answers.map(function (a) { return esc(d.options[a]); }).join(" + ");
  if (type === "mcsL" || type === "hcs" || type === "smw") return "Correct: " + esc(d.options[d.answer]);
  if (type === "fillBlanksL") return "Answers: " + d.answers.map(esc).join(" · ");
  if (type === "hiw") return "Incorrect words: " + d.words.filter(function (w) { return w.wrong; }).map(function (w) { return '"' + esc(w.w) + '" → said "' + esc(w.said) + '"'; }).join(" · ");
  if (type === "wfd") return esc(d.text);
  return "";
}

/* ================= review / score report ================= */
function renderReview() {
  clearTimers(); stopRecording();
  if (state.readingTick) { clearInterval(state.readingTick); state.readingTick = null; }
  var totGot = 0, totMax = 0, rows = "";
  flow.forEach(function (f, i) {
    if (f.kind !== "item") return;
    var k = "s" + i, ans = state.answers[k], meta = TYPE_META[f.type];
    var sc = scoreItem(f.type, f.data, ans);
    if (sc) { totGot += sc.got; totMax += sc.max; }
    var badge = sc ? (sc.got >= sc.max ? '<span class="badge ok">' + sc.got + "/" + sc.max + "</span>" : '<span class="badge no">' + sc.got + "/" + sc.max + "</span>") : '<span class="badge na">self-review</span>';
    var body = "";
    if (SPEAK_CFG[f.type]) {
      body += state.recordings[k]
        ? '<audio controls src="' + state.recordings[k] + '"></audio>'
        : '<div class="kv"><i>No recording captured (mic not enabled).</i></div>';
      var samp = f.data.sample || f.data.text || f.data.question || null;
      if (samp) body += sampleHtml(f.type === "answerShortQuestion" ? "Expected answer" : "Reference / sample", samp);
    } else {
      body += '<div class="ua"><b>Your answer:</b> ' + answerSummary(f.type, f.data, ans) + "</div>";
      var cs = correctSummary(f.type, f.data);
      if (cs) body += '<div class="ua" style="background:#eafaf0"><b>Correct:</b> ' + cs + "</div>";
      if (f.data.sample) body += sampleHtml("Sample response", f.data.sample);
      if (f.type === "summarizeWrittenText" || f.type === "essay" || f.type === "sst") {
        var n = wordCount(ans), lim = f.type === "summarizeWrittenText" ? [5, 75] : f.type === "sst" ? [50, 70] : [200, 300];
        body += '<div class="kv">Word count: <b class="' + (n >= lim[0] && n <= lim[1] ? "ok" : "no") + '">' + n + "</b> (required " + lim[0] + "–" + lim[1] + ")</div>";
      }
    }
    rows += '<div class="revitem"><h4>' + meta.title + " " + (f.idx + 1) + badge + "</h4>" + body + "</div>";
  });
  var pct = totMax ? Math.round(totGot / totMax * 100) : 0;
  render(chrome("Score report", "") +
    '<div class="main"><div class="card" style="text-align:center">' +
    "<h1>Score Report</h1>" +
    '<div class="scorebig">' + pct + "%</div>" +
    '<div class="kv">Auto-scored objective items: ' + totGot + " / " + totMax + " points</div>" +
    '<div class="kv">Speaking &amp; open writing tasks are self-reviewed against the sample responses below. This is an indicative practice score, not a Pearson score.</div>' +
    '<div class="navrow"><button class="btn sec" onclick="PTE.restart()">← Restart exam</button><button class="btn sec" onclick="PTE.toggleMode()">Switch to ' + (state.mode === "real" ? "Guide" : "Real") + " mode</button></div>" +
    "</div>" + rows + "</div>");
}

/* ================= public API ================= */
window.PTE = {
  pickMode: function (m) {
    state.mode = m;
    ensureMic();
    renderMicCheck();
  },
  showSample: function () {
    var w = document.getElementById("sampleWrap");
    if (w && window._pteSample) w.innerHTML = sampleHtml("Sample answer", window._pteSample);
  },
  restart: function () {
    clearTimers();
    state.step = -1; state.answers = {}; state.recordings = {}; state.audioPlayed = {}; state.readingLeft = 30 * 60;
    renderHome();
  },
  toggleMode: function () {
    state.mode = state.mode === "real" ? "guide" : "real";
    clearTimers();
    state.audioPlayed = {}; state.readingLeft = 30 * 60; state.step = -1;
    renderSectionIntro(1);
  }
};

/* ================= boot ================= */
buildFlow();
renderHome();
})();
