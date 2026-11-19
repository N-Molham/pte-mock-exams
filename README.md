# PTE Academic Mock Exams (2026 Format)

Full-length, self-contained PTE Academic practice exams aligned to the **2026 test format** (post-August-2025: 22 task types, ~2 h 10 – 2 h 35 total, including the newer **Respond to a Situation** and **Summarize Group Discussion** speaking tasks).

## Use

**Online (GitHub Pages):** https://n-molham.github.io/pte-mock-exams/ — landing page links to all 10 exams; each opens full-screen in the browser.

Or open any file in `exams/` directly (Chrome/Edge recommended — Web Speech API + microphone required):

```
exams/pte-mock-exam-1.html  …  exams/pte-mock-exam-10.html
```

No server, no install — each HTML file is fully self-contained.

## Two modes

| | Real Mode | Guide Mode |
|---|---|---|
| Timers | Strict per-item / per-part clocks, auto-advance | None forced |
| Audio | Plays **once**, like test day | Replay freely |
| Tips | Hidden | Tips & tricks panel on every task type |
| Samples/keys | Only in final score report | Reveal inline per item |
| Mic | Recorded responses, auto start/stop with beep | Manual record/stop |

## Exam structure (63 items per exam, 10 exams, no repeated items)

- **Part 1 – Speaking & Writing:** Read Aloud ×7, Repeat Sentence ×10, Describe Image ×3, Re-tell Lecture ×2, Respond to a Situation ×2, Summarize Group Discussion ×2, Answer Short Question ×5, Summarize Written Text ×2, Write Essay ×1
- **Part 2 – Reading (30 min clock, 23–30 min on test day):** FIB (dropdown) ×5, MC Multiple ×2, Re-order Paragraphs ×2, FIB (drag) ×4, MC Single ×2
- **Part 3 – Listening:** Summarize Spoken Text ×2, MC Multiple ×1, Fill in the Blanks ×3, Highlight Correct Summary ×1, MC Single ×1, Select Missing Word ×1, Highlight Incorrect Words ×2, Write from Dictation ×3

Audio prompts are pre-rendered with Microsoft Edge neural voices (`en-AU-NatashaNeural`, `en-AU-WilliamNeural`, `en-NZ-MollyNeural`) and served from `audio/<exam>/`; if a clip is unavailable the page falls back to the browser's own speech synthesis. Spoken responses are recorded via the microphone and replayable in the score report.

Scoring is automatic and per-task: objective items are marked exactly (partial credit for multiple-answer, reorder and dictation items), and the reading percentage is weighted by real task value (Fill in the Blanks 25%, Fill in the Blanks drag 20%, Re-order 9.5%, MC multiple 6.5%, MC single 3%). Summarize Written Text and the Essay are scored on key-point coverage, word limits (5–75 and 200–380 hard limits from the writing guide), paragraph structure, connective variety and academic collocations drawn from the Pearson Academic Collocation List, with a penalty for copied prompt or model-answer text; Summarize Spoken Text on coverage and 50–70 word length. Speaking responses are transcribed by the browser's speech recognition (Chrome/Edge) and scored on word accuracy (Read Aloud, Repeat Sentence, short answers), key-term coverage (Retell Lecture, Respond to Situation, Summarize Group Discussion), or — for Describe Image — coverage of the figure's title and labels plus chart-type and trend language. The report shows a per-skill breakdown and an indicative 10–90 band; any speaking item without a transcript stays self-reviewed. **Scores are indicative only** — this is unofficial practice material, not affiliated with Pearson PLC.

## Repository layout

```
src/template.html   HTML shell
src/styles.css      exam UI styles
src/engine.js       exam engine (state machine, timers, TTS, MediaRecorder, scoring)
content/exam1..10.json  item banks (original content)
tools/render-audio.mjs      renders every spoken prompt to audio/<exam>/<hash>.mp3
tools/publish-pages.sh      publishes exams + audio to the gh-pages branch
tools/parse-collocations.mjs  rebuilds the collocation JSON from the extracted PDF text
audio/              pre-rendered neural clips + per-exam manifest.json
build.js            assembles the exam HTML into exams/
exams/              the 10 deliverable mock exams
reference/          source handouts (writing guide, reading strategies, collocation list) + parsed data
site/index.html     landing page published to GitHub Pages
samples/            voice samples + preview page (audio quality check)
```

The `reference/` handouts drive the scoring rules and guide-mode panels — see
`reference/README.md` for what each file contributes.

Rebuild after editing content or engine:

```sh
npm install          # once: build + test dependencies
npm run build        # assembles exams/
npm test             # scoring regression tests (jsdom)
npm run check:audio  # every spoken prompt has a clip + manifest entry
npm run verify       # all three in order (CI runs the same)
```

Re-render audio after editing any spoken prompt (only new/changed clips are synthesised):

```sh
npm install          # once: msedge-tts
npm run audio        # all exams; or: node tools/render-audio.mjs exam3
npm run build        # embeds the clip manifest into each exam
```

Each exam HTML embeds only the clip manifest (hash → duration); the MP3s stay
next to the page under `audio/`, so a page opened from `exams/` finds them at
`../audio/` and the GitHub Pages copy at `audio/`.

Publish the built exams and audio to the live site:

```sh
./tools/publish-pages.sh
```
