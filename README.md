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
- **Part 2 – Reading (30 min clock):** FIB (dropdown) ×5, MC Multiple ×2, Re-order Paragraphs ×2, FIB (drag) ×4, MC Single ×2
- **Part 3 – Listening:** Summarize Spoken Text ×2, MC Multiple ×1, Fill in the Blanks ×3, Highlight Correct Summary ×1, MC Single ×1, Select Missing Word ×1, Highlight Incorrect Words ×2, Write from Dictation ×3

Audio prompts are pre-rendered with Microsoft Edge neural voices (`en-AU-NatashaNeural`, `en-AU-WilliamNeural`, `en-NZ-MollyNeural`) and served from `audio/<exam>/`; if a clip is unavailable the page falls back to the browser's own speech synthesis. Spoken responses are recorded via the microphone and replayable in the score report.

Scoring is automatic and per-task: objective items are marked exactly (partial credit for multiple-answer, reorder and dictation items); Summarize Written Text, Essay and Summarize Spoken Text are scored on content coverage against the source text, length target, and paragraph structure for the essay; speaking responses are transcribed by the browser's speech recognition (Chrome/Edge) and scored on word accuracy (Read Aloud, Repeat Sentence, short answers) or key-term coverage (Retell Lecture, Respond to Situation, Summarize Group Discussion). Describe Image has no text reference and stays self-reviewed, as does any speaking item when speech recognition is unavailable. **Scores are indicative only** — this is unofficial practice material, not affiliated with Pearson PLC.

## Repository layout

```
src/template.html   HTML shell
src/styles.css      exam UI styles
src/engine.js       exam engine (state machine, timers, TTS, MediaRecorder, scoring)
content/exam1..10.json  item banks (original content)
tools/render-audio.mjs  renders every spoken prompt to audio/<exam>/<hash>.mp3
tools/publish-pages.sh  publishes exams + audio to the gh-pages branch
audio/              pre-rendered neural clips + per-exam manifest.json
build.js            assembles the exam HTML into exams/
exams/              the 10 deliverable mock exams
site/index.html     landing page published to GitHub Pages
samples/            voice samples + preview page (audio quality check)
```

Rebuild after editing content or engine:

```sh
node build.js
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
