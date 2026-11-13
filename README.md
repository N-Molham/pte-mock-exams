# PTE Academic Mock Exams (2026 Format)

Six full-length, self-contained PTE Academic practice exams aligned to the **2026 test format** (post-August-2025: 22 task types, ~2 hours, including the newer **Respond to a Situation** and **Summarize Group Discussion** speaking tasks).

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

Audio prompts use the browser's built-in speech synthesis; spoken responses are recorded via the microphone and replayable in the score report. Objective items are auto-scored; speaking/writing tasks are self-reviewed against sample responses. **Scores are indicative only** — this is unofficial practice material, not affiliated with Pearson PLC.

## Repository layout

```
src/template.html   HTML shell
src/styles.css      exam UI styles
src/engine.js       exam engine (state machine, timers, TTS, MediaRecorder, scoring)
content/exam1..6.json   item banks (original content)
build.js            assembles self-contained HTML into exams/
exams/              the 6 deliverable mock exams
```

Rebuild after editing content or engine:

```sh
node build.js
```
