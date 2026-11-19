/* PTE Academic Mock Exam Engine (2026 format) — no dependencies.
   Audio: pre-rendered neural clips (audio/<exam>/<hash>.mp3) when present,
   Web Speech API (speechSynthesis) as fallback. Mic via MediaRecorder. */
(function () {
"use strict";

var app = document.getElementById("app");
var C = EXAM;
var AUDIO_INDEX = window.AUDIO_INDEX || {};

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
    tips: ["ONE sentence only — a full stop inside the answer breaks the task.", "Fix the main claim first, then attach 1–2 supports with connectors (while, because, which, although).", "Aim 35–55 words — inside the 5–75 limit, comfortably under the ceiling.", "Save 1 minute to check subject-verb agreement and spelling."] },
  essay: { title: "Write Essay", part: 1,
    ins: "You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your ideas, present supporting details, and control the elements of standard written English. You should write 200–300 words.",
    tips: ["4 paragraphs: intro (40–50 words, paraphrase + thesis) → body 1 → body 2 (60–70 each) → conclusion (30–40).", "Aim 220–270 words. Below 200 or above 380 scores zero on test day.", "Plan 2–3 min, write 5–17 min, proofread 17–20 min — do not skip proofreading.", "Use one example per body paragraph and vary connectives; rigid memorised templates are penalised."] },
  fibDropdown: { title: "Reading & Writing: Fill in the Blanks", part: 2, time: "~2 min each",
    ins: "Below is a text with blanks. Click on each blank, and a drop-down list will appear. Select the appropriate answer choice for each blank.",
    tips: ["Read the full sentence for meaning, then confirm with word form and collocation.", "Highest-value reading task (~25% of the section) — give it the time you save elsewhere.", "Fixed collocations decide most blanks: 'make a decision', 'conduct research'.", "No negative marking — never leave a blank empty."] },
  mcMultiple: { title: "Multiple Choice, Multiple Answers", part: 2, time: "~1.5–2 min each",
    ins: "Read the text and answer the question by selecting all the correct responses. More than one response is correct. If you select a wrong option, one point is deducted, so do not guess.",
    tips: ["Read the question first, then scan for the keywords it names.", "Each correct option paraphrases a passage detail; distractors copy words but twist meaning.", "Absolute wording ('all', 'every', 'never', 'only', 'proved') usually marks a wrong option.", "Negative marking: only select options you are certain about."] },
  reorder: { title: "Re-order Paragraphs", part: 2, time: "~1–2 min each",
    ins: "The text boxes in the left panel have been placed in a random order. Restore the original order by moving the text boxes.",
    tips: ["Find the opener: no pronouns, no 'this/these', no connectors, often introduces a noun with 'a/an' before 'the' appears.", "Reject sentences starting with 'however', 'therefore', 'furthermore' as openings.", "Chain pronouns to nouns, then apply general → specific and chronological order.", "Adjacent pairs score — a partial correct chain still earns points, so never leave it blank."] },
  fibDrag: { title: "Reading: Fill in the Blanks", part: 2, time: "~1.5–2 min each",
    ins: "Below is a text with blanks. Drag words from the box below to fill the blanks.",
    tips: ["Read the whole passage first (30–45 s): later sentences clarify earlier blanks.", "Decide the part of speech each blank needs, then discard every word of the wrong class.", "Use collocations to choose between grammatically possible options.", "No negative marking — place a word in every blank."] },
  mcSingle: { title: "Multiple Choice, Single Answer", part: 2, time: "~1–1.5 min each",
    ins: "Read the text and answer the multiple choice question by selecting the correct response. Only one response is correct.",
    tips: ["Read the question before the passage, then skim and scan rather than read every word.", "Eliminate options that contradict the passage, add unmentioned ideas, or distort a key detail.", "Beware absolute quantifiers ('proved', 'all', 'always') — typical wrong-option markers.", "Worth little (~3% of reading): answer fast and move on to the blanks."] },
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
  recChunks: [],
  audioEl: null,         // active <audio> for pre-rendered clips
  ttsCancel: null,       // cancels an in-flight speakTurns() sequence
  transcripts: {},       // key -> what speech recognition heard
  sr: null,              // active SpeechRecognition instance
  srKey: null,
  srActive: false
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
/* Hash of a spoken string; must match tools/render-audio.mjs. */
function hashText(text, speaker) {
  var s = String(text == null ? "" : text).replace(/\s+/g, " ").trim();
  if (speaker) s = speaker + "\u0001" + s;
  var h = 0x811c9dc5;
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36);
}
/* Audio lives next to the page on GitHub Pages, one level up when the exam
   file is opened from a local exams/ checkout. */
function audioBases() {
  var dir = "audio/exam" + ((C.meta && C.meta.id) || 1) + "/";
  return [dir, "../" + dir];
}
/* Play a pre-rendered clip. Returns null when no clip exists (caller falls
   back to speechSynthesis), otherwise a Promise<boolean>. */
function playClip(text, speaker) {
  var hash = hashText(text, speaker);
  if (!AUDIO_INDEX[hash]) return null;
  return new Promise(function (res) {
    var bases = audioBases(), attempt = 0, settled = false, el;
    function finish(ok) {
      if (settled) return;
      settled = true;
      if (state.audioEl === el) state.audioEl = null;
      state.speaking = false;
      res(ok);
    }
    function start() {
      el = new Audio(bases[attempt] + hash + ".mp3");
      el.preload = "auto";
      state.audioEl = el;
      state.speaking = true;
      el.onended = function () { finish(true); };
      el.onerror = function () {
        if (el === state.audioEl) state.audioEl = null;
        attempt++;
        if (attempt < bases.length) start(); else finish(false);
      };
      var p = el.play();
      if (p && p.catch) p.catch(function () { finish(false); });
    }
    start();
  });
}
function stopTTS() {
  var el = state.audioEl;
  state.audioEl = null;
  if (el) { try { el.pause(); el.removeAttribute("src"); el.load(); } catch (e) {} }
  try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {}
  state.speaking = false;
  if (state.ttsCancel) { var cancel = state.ttsCancel; state.ttsCancel = null; try { cancel(); } catch (e) {} }
}
function speakFallback(text, opts) {
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
function speak(text, opts) {
  opts = opts || {};
  var clip = playClip(text, opts.speaker);
  if (!clip) return speakFallback(text, opts);
  return clip.then(function (ok) { return ok ? true : speakFallback(text, opts); });
}
function speakTurns(turns) {
  /* Pre-rendered clips already use a different voice per speaker; pitch only
     distinguishes speakers in the speechSynthesis fallback. */
  var pitches = { A: 1.0, B: 0.75, C: 1.3, D: 0.9 };
  var i = 0, cancelled = false;
  var cancel = function () { cancelled = true; };
  state.ttsCancel = cancel;
  return new Promise(function (res) {
    (function next() {
      if (cancelled || i >= turns.length) {
        if (state.ttsCancel === cancel) state.ttsCancel = null;
        res(!cancelled);
        return;
      }
      var turn = turns[i];
      speak(turn.text, { speaker: turn.speaker, pitch: pitches[turn.speaker] || 1, rate: 0.95 }).then(next);
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
  startTranscription(k);
  return true;
}
function stopRecording() {
  stopTranscription();
  if (state.recorder && state.recorder.state !== "inactive") { try { state.recorder.stop(); } catch (e) {} }
}

/* Speech recognition turns a spoken response into text so it can be scored.
   Chrome/Edge only; absent API simply leaves the item self-reviewed. */
function srCtor() { return window.SpeechRecognition || window.webkitSpeechRecognition || null; }
function startTranscription(k) {
  var SR = srCtor();
  if (!SR) return;
  stopTranscription();
  try {
    var r = new SR();
    r.lang = "en-AU"; r.continuous = true; r.interimResults = false; r.maxAlternatives = 1;
    state.srKey = k; state.srActive = true;
    if (!state.transcripts[k]) state.transcripts[k] = "";
    r.onresult = function (e) {
      var out = "";
      for (var i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) out += e.results[i][0].transcript + " ";
      }
      if (out) state.transcripts[k] = (state.transcripts[k] + " " + out).replace(/\s+/g, " ").trim();
    };
    r.onerror = function () {};
    /* Chrome ends the session on a pause; resume while the mic is still open. */
    r.onend = function () { if (state.srActive && state.srKey === k) { try { r.start(); } catch (e) {} } };
    r.start();
    state.sr = r;
  } catch (e) { state.sr = null; }
}
function stopTranscription() {
  state.srActive = false;
  if (state.sr) { try { state.sr.stop(); } catch (e) {} state.sr = null; }
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
  if (state.mode !== "guide") return "";
  var out = "";
  if (type === "essay" || type === "summarizeWrittenText") out += writingPanel(type, data);
  if (data.sample) out += '<div id="sampleWrap"><button class="btn sec small" onclick="PTE.showSample()">Show sample answer</button></div>';
  return out;
}
/* Plan panel built from the writing handout: structure, timing, connectives
   and collocations that fit this prompt. */
var LINK_BANK = "firstly · secondly · furthermore · moreover · in addition · however · although · on the other hand · " +
  "therefore · as a result · consequently · for example · for instance · such as · clearly · in conclusion · to sum up";
function writingPanel(type, d) {
  var cols = collocationsFor(type === "essay" ? d.prompt : d.passage, 8);
  var h = '<div class="tipsbox"><h4>' + (type === "essay" ? "Essay plan — 20 minutes" : "Summary plan — 10 minutes") + "</h4><ul>";
  if (type === "essay") {
    h += "<li><b>0–2 min</b> read the prompt, pick agree/disagree, advantages or problem/solution.</li>" +
      "<li><b>2–5 min</b> two main points, one example each.</li>" +
      "<li><b>5–17 min</b> intro 40–50 words · body 1 60–70 · body 2 60–70 · conclusion 30–40 → aim 220–270.</li>" +
      "<li><b>17–20 min</b> proofread. Below 200 or above 380 words scores zero.</li>" +
      "<li>The sample answer is a skeleton: expand each point to reach 220–270 words.</li>" +
      "<li>Vary the structure from the sample — rigid memorised templates lose marks.</li>";
  } else {
    h += "<li>One sentence only, 5–75 words (aim 35–55).</li>" +
      "<li>Frame: <i>The passage highlights X, emphasising that …; furthermore, it is clear that …</i></li>" +
      "<li>Cover the main claim plus one or two supports; do not copy whole sentences.</li>" +
      "<li>Save a minute to check the full stop and subject–verb agreement.</li>";
  }
  h += "</ul><div class=\"kv\"><b>Connectives:</b> " + LINK_BANK + "</div>";
  if (cols.length) h += '<div class="kv"><b>Academic collocations for this prompt:</b> ' + cols.join(" · ") + "</div>";
  return h + "</div>";
}

/* ================= home ================= */
function renderHome() {
  state.step = -1;
  render(chrome(null, "") +
    '<div class="main"><div class="card">' +
    "<h1>" + esc(C.meta.title) + "</h1>" +
    '<div class="instructions">Full-length PTE Academic mock exam · 2026 test format (22 task types, ~2 h 10 – 2 h 35). ' +
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
    '<div class="instructions">Speaking responses are also transcribed by your browser\'s speech recognition (Chrome/Edge) so they can be scored. That audio goes to the browser\'s speech service, not to this site. Without it, speaking items stay self-reviewed.</div>' +
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
  1: { t: "Part 1: Speaking & Writing", d: "This part tests your speaking and writing skills. Speaking tasks record your voice; you will hear a short tone before each recording starts. Writing tasks are typed. Timers run per item.", time: "approx. 76–84 min" },
  2: { t: "Part 2: Reading", d: "This part tests your reading skills. A single clock governs the whole part — manage your time across all items. You may move between questions with the navigation panel.", time: "approx. 23–30 min" },
  3: { t: "Part 3: Listening", d: "This part tests your listening skills. It opens with Summarize Spoken Text. Each recording plays automatically and only ONCE. Answer as you listen; the test advances automatically after each item.", time: "approx. 31–39 min" }
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
      var hard = isSWT ? (n < 5 || n > 75) : (n < 200 || n > 380);
      wc.textContent = "Word Count: " + n + " (target " + min + "–" + max + ")" +
        (hard ? " — outside the hard limit, scores zero" : "");
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
    var h = chrome("Part 2: Reading · " + meta.title + " " + (it.idx + 1) + " of " + it.total + (meta.time ? " · " + meta.time : ""), timerHtml) +
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

/* ---- open-response scoring: keyword coverage + length + accuracy ---- */
var STOPW = {};
("a an the and or but if then than that this these those of in on at to for from with without by as is are was were be been being it its their there they them he she his her you your we our i my me not no so do does did has have had can could would should will shall may might must more most much many some any such only own same too very just don now also into about over under between across after before while during because although though which who whom whose what when where why how both each other another one two three").split(" ").forEach(function (w) { STOPW[w] = 1; });
function words(t) { return String(t || "").toLowerCase().replace(/[^a-z0-9'\s]/g, " ").split(/\s+/).filter(Boolean); }
function stemW(w) { return w.replace(/'(s|t|re|ve|ll|d|m)$/, "").replace(/ies$/, "y").replace(/(ing|ed|es|s)$/, ""); }
function contentWords(t) { return words(t).filter(function (w) { return w.length > 2 && !STOPW[w]; }).map(stemW); }
function keyTerms(ref, n) {
  var freq = {}, order = [];
  contentWords(ref).forEach(function (w) {
    if (freq[w] == null) { freq[w] = 0; order.push(w); }
    freq[w]++;
  });
  order.sort(function (a, b) { return freq[b] - freq[a] || b.length - a.length; });
  return order.slice(0, n || 14);
}
function coverageOf(ansText, keys) {
  if (!keys.length) return 0;
  var set = {}, hit = 0;
  contentWords(ansText).forEach(function (w) { set[w] = 1; });
  keys.forEach(function (k) { if (set[k]) hit++; });
  return hit / keys.length;
}
/* Share of the answer's content words that also occur in the reference.
   Keeps copies of unrelated text from scoring on length alone. */
function precisionOf(ansText, refText) {
  var ref = {}, ans = contentWords(ansText), hit = 0;
  contentWords(refText).forEach(function (w) { ref[w] = 1; });
  if (!ans.length) return 0;
  ans.forEach(function (w) { if (ref[w]) hit++; });
  return hit / ans.length;
}
/* Longest common subsequence over words, as a share of the reference. */
function matchRatio(ref, ans) {
  var a = words(ref), b = words(ans);
  if (!a.length || !b.length) return 0;
  var dp = [];
  for (var j = 0; j <= b.length; j++) dp[j] = 0;
  for (var i = 1; i <= a.length; i++) {
    var prev = 0;
    for (var j2 = 1; j2 <= b.length; j2++) {
      var tmp = dp[j2];
      dp[j2] = a[i - 1] === b[j2 - 1] ? prev + 1 : Math.max(dp[j2], dp[j2 - 1]);
      prev = tmp;
    }
  }
  return dp[b.length] / a.length;
}
function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function round1(x) { return Math.round(x * 10) / 10; }

/* Writing / listening summaries: content coverage + length, plus structure
   for the essay. Reference text is the passage, transcript or prompt. */
function scoreTextResponse(refText, ans, o) {
  var n = wordCount(ans);
  if (!n) return null;
  var keys = keyTerms(refText, 14);
  var recall = coverageOf(ans, keys), precision = precisionOf(ans, refText);
  var cov = 0.65 * recall + 0.35 * precision;
  var lenFit = n < o.min ? clamp01(n / o.min) : n > o.target * 1.3 ? 0.45 : 1;
  var frac, extra = "";
  if (o.paragraphs) {
    var paras = String(ans).split(/\n+/).filter(function (p) { return wordCount(p) >= 25; }).length;
    var struct = paras >= 3 ? 1 : paras === 2 ? 0.75 : 0.45;
    frac = 0.45 * cov + 0.25 * lenFit + 0.3 * struct;
    extra = " · " + paras + " paragraph" + (paras === 1 ? "" : "s");
  } else {
    frac = 0.7 * cov + 0.3 * lenFit;
  }
  return {
    got: round1(o.max * frac),
    max: o.max,
    detail: "Content " + Math.round(cov * 100) + "% (coverage " + Math.round(recall * 100) +
      "%, relevance " + Math.round(precision * 100) + "%) · " + n + " words (target " + o.min + "–" + o.target + ")" + extra
  };
}

/* Chart labels and axis captions carried by the inline SVG figure. */
function svgLabels(svg) {
  var out = [], m, re = /<text[^>]*>([^<]*)<\/text>/g;
  while ((m = re.exec(String(svg || "")))) {
    var t = m[1].replace(/\s+/g, " ").trim();
    if (!t) continue;
    if (/^[\d.,%+\-–—]+$/.test(t)) continue; /* axis tick numbers */
    out.push(t);
  }
  return out;
}
/* Describe Image has no transcript reference, but the figure does carry a
   title, category labels and axis text, so the spoken answer can be checked
   against what the chart actually shows. */
function scoreDescribeImage(d, transcript) {
  var tr = (transcript || "").trim();
  if (!tr) return null;
  var n = wordCount(tr), low = tr.toLowerCase();
  var labels = svgLabels(d.svg).join(" ");
  var ref = labels + " " + (d.title || "");
  var keys = keyTerms(ref, 12);
  var cov = 0.6 * coverageOf(tr, keys) + 0.4 * precisionOf(tr, ref);
  var named = /chart|graph|bar|column|pie|line|figure|diagram|table|chart/.test(low) ? 1 : 0;
  var trend = /increase|increas|rise|rose|rising|grow|decrease|declin|fell|fall|drop|highest|lowest|peak|compare|whereas|while|most|least/.test(low) ? 1 : 0;
  var lenFit = clamp01(n / 45);
  var frac = 0.5 * cov + 0.2 * named + 0.15 * trend + 0.15 * lenFit;
  return {
    got: round1(3 * frac),
    max: 3,
    detail: "Chart labels covered " + Math.round(cov * 100) + "% · " + n + " words spoken · " +
      (named ? "chart named" : "chart type not named") + " · " + (trend ? "trend/values described" : "no trend or comparison")
  };
}
/* Speaking tasks: transcript against the reference text. */
function scoreSpokenResponse(type, d, transcript) {
  var tr = (transcript || "").trim();
  if (!tr) return null;
  if (type === "describeImage") return scoreDescribeImage(d, tr);
  var n = wordCount(tr), keys, cov, ratio;
  if (type === "answerShortQuestion") {
    var expected = norm(d.answer || ""), said = norm(tr);
    var ok = !!expected && (said.indexOf(expected) >= 0 || matchRatio(expected, said) >= 0.6);
    return { got: ok ? 1 : 0, max: 1, detail: 'Expected "' + (d.answer || "") + '" · heard "' + tr.slice(0, 80) + '"' };
  }
  if (type === "readAloud" || type === "repeatSentence") {
    ratio = matchRatio(d.text || d.question || "", tr);
    return {
      got: round1(3 * ratio),
      max: 3,
      detail: "Word accuracy " + Math.round(ratio * 100) + "% vs prompt · " + n + " words spoken"
    };
  }
  var ref = type === "retellLecture" ? d.text
    : type === "respondToSituation" ? (d.audio || d.prompt)
    : type === "summarizeGroupDiscussion" ? (d.turns || []).map(function (t) { return t.text; }).join(" ")
    : "";
  if (!ref) return null;
  keys = keyTerms(ref, 16);
  cov = 0.65 * coverageOf(tr, keys) + 0.35 * precisionOf(tr, ref);
  var lenFit = clamp01(n / (type === "summarizeGroupDiscussion" ? 60 : 45));
  return {
    got: round1(3 * (0.7 * cov + 0.3 * lenFit)),
    max: type === "summarizeGroupDiscussion" ? 4 : 3,
    detail: "Content coverage " + Math.round(cov * 100) + "% · " + n + " words spoken"
  };
}
/* Collocations and connectives come from the Pearson Academic Collocation
   List and the writing-guide handouts under reference/. Both are embedded at
   build time, so scoring works offline. */
var ACL = window.ACL || [];
var ACL_SET = null;
function aclKeys() {
  if (ACL_SET) return ACL_SET;
  ACL_SET = [];
  for (var i = 0; i < ACL.length; i++) {
    var a = stemW(String(ACL[i][0]).toLowerCase()), b = stemW(String(ACL[i][1]).toLowerCase());
    if (a && b) ACL_SET.push([a, b, ACL[i][0] + " " + ACL[i][1]]);
  }
  return ACL_SET;
}
/* Collocations that appear as adjacent word pairs in the answer. */
function collocationHits(text) {
  var w = words(text), pairs = aclKeys(), hits = [], seen = {};
  if (!w.length || !pairs.length) return hits;
  var bigrams = {};
  for (var i = 0; i < w.length - 1; i++) bigrams[stemW(w[i]) + "|" + stemW(w[i + 1])] = 1;
  for (var j = 0; j < pairs.length; j++) {
    if (!bigrams[pairs[j][0] + "|" + pairs[j][1]]) continue;
    if (seen[pairs[j][2]]) continue;
    seen[pairs[j][2]] = 1;
    hits.push(pairs[j][2]);
  }
  return hits;
}
/* Collocations worth borrowing in a response to this prompt. */
function collocationsFor(text, n) {
  var w = words(text), set = {}, picks = [], seen = {}, pairs = aclKeys();
  if (!w.length) return picks;
  for (var i = 0; i < w.length; i++) set[stemW(w[i])] = 1;
  for (var j = 0; j < pairs.length && picks.length < (n || 10); j++) {
    if (!set[pairs[j][0]] && !set[pairs[j][1]]) continue;
    if (seen[pairs[j][2]]) continue;
    seen[pairs[j][2]] = 1;
    picks.push(pairs[j][2]);
  }
  return picks;
}
var CONNECTIVE_GROUPS = {
  contrast: ["even though", "although", "despite", "in spite of", "on the other hand", "in comparison", "nevertheless", "conversely", "however"],
  addition: ["furthermore", "moreover", "in addition", "additionally", "apart from", "besides", "as well as"],
  result: ["consequently", "therefore", "as a result", "hence", "for this reason", "thus"],
  emphasis: ["clearly", "obviously", "of course", "particularly", "especially"],
  example: ["for example", "for instance", "such as", "to illustrate"],
  opinion: ["in my opinion", "in my view", "i believe", "i think", "i disagree", "i do not agree"],
  conclusion: ["in conclusion", "to conclude", "to sum up"],
  listing: ["firstly", "secondly", "thirdly", "lastly", "finally", "to begin with"]
};
function cohesion(text) {
  var t = " " + words(text).join(" ") + " ";
  var groups = [], used = [];
  Object.keys(CONNECTIVE_GROUPS).forEach(function (g) {
    var found = null;
    CONNECTIVE_GROUPS[g].forEach(function (c) {
      if (!found && t.indexOf(" " + words(c).join(" ") + " ") >= 0) found = c;
    });
    if (found) { groups.push(g); used.push(found); }
  });
  return { groups: groups.length, list: used };
}
function sentenceCount(text) {
  return String(text || "").split(/[.!?]+/).filter(function (s) { return s.trim().length > 1; }).length;
}
/* Share of the answer's n-word chunks that also appear in the reference. */
function ngramOverlap(text, ref, n) {
  var w = words(text), r = words(ref), set = {}, hits = 0, total = 0;
  if (w.length < n || r.length < n) return 0;
  for (var i = 0; i <= r.length - n; i++) set[r.slice(i, i + n).join(" ")] = 1;
  for (var j = 0; j <= w.length - n; j++) {
    total++;
    if (set[w.slice(j, j + n).join(" ")]) hits++;
  }
  return total ? hits / total : 0;
}
function repeatedOpeners(text) {
  var seen = {}, worst = 0;
  String(text || "").split(/[.!?]+/).forEach(function (s) {
    var k = words(s).slice(0, 2).join(" ");
    if (!k) return;
    seen[k] = (seen[k] || 0) + 1;
    if (seen[k] > worst) worst = seen[k];
  });
  return worst;
}
/* The writing guide warns that copied prompts and memorised templates are
   penalised, so those patterns now reduce the response score. */
function copyPenalty(text, prompt, sample) {
  var p = prompt ? ngramOverlap(text, prompt, 4) : 0;
  var s = sample ? ngramOverlap(text, sample, 4) : 0;
  var rep = repeatedOpeners(text);
  var mult = 1, notes = [];
  if (p >= 0.2) { mult *= 0.85; notes.push("repeats prompt wording " + Math.round(p * 100) + "%"); }
  if (s >= 0.2) { mult *= 0.75; notes.push("copies the model answer " + Math.round(s * 100) + "%"); }
  if (rep >= 3) { mult *= 0.9; notes.push("same sentence opener ×" + rep); }
  return { mult: mult, notes: notes };
}
function paragraphList(text) {
  return String(text || "").split(/\n+/).map(function (p) { return p.trim(); }).filter(function (p) { return p; });
}
/* Write Essay: hard word limits, 3–5 paragraphs, connectives, collocations. */
function scoreEssay(d, ans) {
  var n = wordCount(ans);
  if (!n) return null;
  if (n < 200 || n > 380) {
    return { got: 0, max: 10, detail: "Word count " + n + " — outside 200–380, which scores zero on test day." };
  }
  var paras = paragraphList(ans), keys = keyTerms(d.prompt, 10);
  var cov = coverageOf(ans, keys);
  var lenFit = n <= 300 ? 1 : 0.8;
  var struct = paras.length >= 3 && paras.length <= 5 ? 1 : paras.length === 2 ? 0.7 : 0.35;
  var con = cohesion(ans), hits = collocationHits(ans);
  var coh = Math.min(1, con.groups / 4), lex = Math.min(1, hits.length / 3);
  var frac = 0.3 * cov + 0.15 * lenFit + 0.25 * struct + 0.15 * coh + 0.15 * lex;
  var pen = copyPenalty(ans, d.prompt, d.sample);
  frac *= pen.mult;
  return {
    got: round1(10 * frac),
    max: 10,
    detail: "Content " + Math.round(cov * 100) + "% · " + n + " words · " + paras.length + " paragraphs · " +
      con.groups + " connective groups" + (con.list.length ? " (" + con.list.slice(0, 4).join(", ") + ")" : "") +
      " · " + hits.length + " academic collocations" + (hits.length ? " (" + hits.slice(0, 3).join(", ") + ")" : "") +
      (pen.notes.length ? " · penalty: " + pen.notes.join(", ") : "")
  };
}
/* Summarize Written Text: one sentence, 5–75 words, key-point coverage. */
function scoreSwt(d, ans) {
  var n = wordCount(ans);
  if (!n) return null;
  if (n < 5 || n > 75) {
    return { got: 0, max: 6, detail: "Word count " + n + " — outside 5–75, which scores zero on test day." };
  }
  var sents = sentenceCount(ans), keys = keyTerms(d.passage, 14);
  var cov = 0.7 * coverageOf(ans, keys) + 0.3 * precisionOf(ans, d.passage);
  var lenFit = n >= 25 && n <= 60 ? 1 : n < 25 ? Math.max(0.5, n / 25) : 0.8;
  var single = sents <= 1 ? 1 : sents === 2 ? 0.65 : 0.4;
  var frac = 0.6 * cov + 0.2 * lenFit + 0.2 * single;
  var pen = copyPenalty(ans, "", d.sample);
  frac *= pen.mult;
  return {
    got: round1(6 * frac),
    max: 6,
    detail: "Content " + Math.round(cov * 100) + "% · " + n + " words (target 5–75, aim 35–55) · " +
      sents + " sentence" + (sents === 1 ? "" : "s") + (sents === 1 ? "" : " — one sentence required") +
      " · " + collocationHits(ans).length + " academic collocations" +
      (pen.notes.length ? " · penalty: " + pen.notes.join(", ") : "")
  };
}
/* Auto-score any open-response item; null when it cannot be scored. */
function scoreOpen(type, d, ans, transcript) {
  if (type === "summarizeWrittenText") return scoreSwt(d, ans);
  if (type === "essay") return scoreEssay(d, ans);
  if (type === "sst") return scoreTextResponse(d.audio, ans, { min: 50, target: 70, max: 6 });
  if (SPEAK_CFG[type]) return scoreSpokenResponse(type, d, transcript);
  return null;
}


function renderReview() {
  clearTimers(); stopRecording();
  if (state.readingTick) { clearInterval(state.readingTick); state.readingTick = null; }
  var totGot = 0, totMax = 0, rows = "";
  var byPart = { 1: { got: 0, max: 0 }, 2: { got: 0, max: 0 }, 3: { got: 0, max: 0 } };
  var bySkill = { speaking: { got: 0, max: 0 }, writing: { got: 0, max: 0 }, reading: { got: 0, max: 0 }, listening: { got: 0, max: 0 } };
  flow.forEach(function (f, i) {
    if (f.kind !== "item") return;
    var k = "s" + i, ans = state.answers[k], meta = TYPE_META[f.type];
    var heard = state.transcripts[k];
    var sc = scoreItem(f.type, f.data, ans) || scoreOpen(f.type, f.data, ans, heard);
    if (sc) {
      totGot += sc.got; totMax += sc.max; var bp = byPart[f.part]; if (bp) { bp.got += sc.got; bp.max += sc.max; }
      var sk = SPEAK_CFG[f.type] ? "speaking" : f.part === 1 ? "writing" : "listening";
      bySkill[sk].got += sc.got; bySkill[sk].max += sc.max;
    }
    var badge = sc ? (sc.got >= sc.max ? '<span class="badge ok">' + sc.got + "/" + sc.max + "</span>" : '<span class="badge no">' + sc.got + "/" + sc.max + "</span>") : '<span class="badge na">self-review</span>';
    var body = "";
    if (SPEAK_CFG[f.type]) {
      body += state.recordings[k]
        ? '<audio controls src="' + state.recordings[k] + '"></audio>'
        : '<div class="kv"><i>No recording captured (mic not enabled).</i></div>';
      if (heard) body += '<div class="ua"><b>Transcription:</b> ' + esc(heard) + "</div>";
      else if (state.recordings[k]) body += '<div class="kv"><i>No transcription — speech recognition unavailable or heard nothing.</i></div>';
      if (sc && sc.detail) body += '<div class="kv">' + esc(sc.detail) + "</div>";
      var samp = f.data.sample || f.data.text || f.data.question || null;
      if (samp) body += sampleHtml(f.type === "answerShortQuestion" ? "Expected answer" : "Reference / sample", samp);
    } else {
      body += '<div class="ua"><b>Your answer:</b> ' + answerSummary(f.type, f.data, ans) + "</div>";
      var cs = correctSummary(f.type, f.data);
      if (cs) body += '<div class="ua" style="background:#eafaf0"><b>Correct:</b> ' + cs + "</div>";
      if (sc && sc.detail) body += '<div class="kv">' + esc(sc.detail) + "</div>";
      if (f.data.sample) body += sampleHtml("Sample response", f.data.sample);
      if (f.type === "summarizeWrittenText" || f.type === "essay" || f.type === "sst") {
        var n = wordCount(ans), lim = f.type === "summarizeWrittenText" ? [5, 75] : f.type === "sst" ? [50, 70] : [200, 300];
        body += '<div class="kv">Word count: <b class="' + (n >= lim[0] && n <= lim[1] ? "ok" : "no") + '">' + n + "</b> (required " + lim[0] + "–" + lim[1] + ")</div>";
      }
    }
    rows += '<div class="revitem"><h4>' + meta.title + " " + (f.idx + 1) + badge + "</h4>" + body + "</div>";
  });
  /* Reading items live outside `flow`, so score them separately. PTE weights
     these tasks unevenly (Fill in the Blanks carries ~25% of the section), so
     the type weight is split evenly across that type's questions. */
  var readWeight = { fibDropdown: 25, fibDrag: 20, reorder: 9.5, mcMultiple: 6.5, mcSingle: 3 };
  var readItems = readingItems(), readCount = {};
  readItems.forEach(function (it) { readCount[it.type] = (readCount[it.type] || 0) + 1; });
  var readW = 0, readGotW = 0;
  readItems.forEach(function (it) {
    var rk = rkey(it.type, it.idx), ans = collectReadingAnswer(it), meta = TYPE_META[it.type];
    var sc = scoreItem(it.type, it.data, ans);
    if (sc) {
      totGot += sc.got; totMax += sc.max; byPart[2].got += sc.got; byPart[2].max += sc.max;
      bySkill.reading.got += sc.got; bySkill.reading.max += sc.max;
      var w = (readWeight[it.type] || 3) / (readCount[it.type] || 1);
      readW += w; readGotW += w * (sc.max ? sc.got / sc.max : 0);
    }
    var badge = sc ? (sc.got >= sc.max ? '<span class="badge ok">' + sc.got + "/" + sc.max + "</span>" : '<span class="badge no">' + sc.got + "/" + sc.max + "</span>") : '<span class="badge na">self-review</span>';
    var body = '<div class="ua"><b>Your answer:</b> ' + answerSummary(it.type, it.data, ans) + "</div>";
    var cs = correctSummary(it.type, it.data);
    if (cs) body += '<div class="ua" style="background:#eafaf0"><b>Correct:</b> ' + cs + "</div>";
    rows += '<div class="revitem"><h4>Part 2 · ' + meta.title + " " + (it.idx + 1) + badge + "</h4>" + body + "</div>";
  });
  /* Weighted blend across the four PTE skills, then map 0–100% to the 10–90
     band scale. Weighting keeps one long listening section from dominating. */
  var SKILL_W = { speaking: 30, writing: 20, reading: 25, listening: 25 };
  var wSum = 0, wGot = 0, skillRows = "";
  Object.keys(SKILL_W).forEach(function (sk) {
    var b = bySkill[sk];
    if (!b.max) return;
    wSum += SKILL_W[sk];
    wGot += SKILL_W[sk] * (b.got / b.max);
    skillRows += '<div class="kv">' + sk.charAt(0).toUpperCase() + sk.slice(1) + ": <b>" +
      Math.round(b.got / b.max * 100) + "%</b> (" + round1(b.got) + "/" + round1(b.max) + ")</div>";
  });
  var weightedPct = wSum ? Math.round(wGot / wSum * 100) : 0;
  var band = Math.round(10 + weightedPct * 0.8);
  var breakdown = "";
  ["1:Speaking &amp; Writing", "2:Reading", "3:Listening"].forEach(function (row) {
    var bits = row.split(":"), bp = byPart[bits[0]];
    if (!bp || !bp.max) return;
    var line = "Part " + bits[0] + " · " + bits[1] + ": <b>" + round1(bp.got) + " / " + round1(bp.max) + "</b> (" + Math.round(bp.got / bp.max * 100) + "%)";
    if (bits[0] === "2" && readW) line += " · test-weighted <b>" + Math.round(readGotW / readW * 100) + "%</b>";
    breakdown += '<div class="kv">' + line + "</div>";
  });
  render(chrome("Score report", "") +
    '<div class="main"><div class="card" style="text-align:center">' +
    "<h1>Score Report</h1>" +
    '<div class="scorebig">' + band + "</div>" +
    '<div class="kv"><b>Estimated band ' + band + " / 90</b> — indicative practice score, not a Pearson score.</div>" +
    '<div class="kv">Weighted score: ' + weightedPct + "% · raw points: " + round1(totGot) + " / " + round1(totMax) + "</div>" +
    skillRows +
    breakdown +
    '<div class="kv">Speaking responses are transcribed by the browser (Chrome/Edge) and scored on word accuracy or key-term coverage; Describe Image is scored against the figure\'s title and labels. Summarize Written Text and the Essay are scored on key-point coverage, word limits, paragraph structure, connectives and academic collocations, with a penalty for copied prompt or model-answer text. The reading percentage is weighted by task value. Indicative practice score, not a Pearson score.</div>' +
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
  /* Debug/verification hook: score any item without running the exam. */
  _score: function (type, data, ans, transcript) {
    return scoreItem(type, data, ans) || scoreOpen(type, data, ans, transcript);
  },
  restart: function () {
    clearTimers();
    state.step = -1; state.answers = {}; state.recordings = {}; state.audioPlayed = {}; state.readingLeft = 30 * 60;
    state.transcripts = {};
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
