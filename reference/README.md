# Reference material

Source documents used to tune the mock exams. Originals are kept unchanged;
text extracts and the parsed collocation list are what the build and the
scoring code actually consume.

| File | What it is |
|---|---|
| `writing-guide.docx` | Essay + Summarize Written Text structure, word limits, timing, connective banks |
| `reading-strategies.pptx` | Reading task order, per-task timing, PTE scoring weights, question strategies |
| `academic-collocation-list.pdf` | Pearson Academic Collocation List, classroom resource v3/2026 (2,469 collocations) |
| `extracted/writing-guide.txt` | Plain text of the Word document |
| `extracted/reading-strategies.txt` | Plain text of every slide |
| `extracted/academic-collocation-list.txt` | Plain text of the PDF |
| `academic-collocations.json` | Parsed list: 746 headwords, 2,469 headword + collocate pairs |

## How the exams use this material

`build.js` flattens `academic-collocations.json` into `[head, collocate]` pairs
and embeds them in each exam page as `window.ACL` (about 50 KB). Nothing is
fetched at runtime, so the pages keep working offline and from `file://`.

- **Essay scoring** (`scoreEssay`) — hard limits from the writing guide (below
  200 or above 380 words scores zero), paragraph count 3–5, connective-group
  variety, and academic collocations used. Detail line reports each part.
- **Summarize Written Text scoring** (`scoreSwt`) — 5–75 word limit, one-sentence
  rule, key-point coverage, collocation use.
- **Guide-mode writing panel** (`writingPanel`) — 4-paragraph plan with word
  budgets, 20-minute schedule, connective bank, and collocations drawn from the
  words in the actual prompt.
- **Reading scoring** — task weights from the slides (Fill in the Blanks 25%,
  Fill in the Blanks (drag) 20%, Re-order 9.5%, MC multiple 6.5%, MC single 3%)
  split across each type's questions; report shows a test-weighted percentage
  alongside raw points.
- **Reading tips and timings** — per-task suggested time on the item header and
  the strategies from the slide deck (pronoun/connective elimination, general →
  specific ordering, part-of-speech first for drag-and-drop, absolute-language
  traps).

## Regenerating

The collocation JSON is derived; re-run the parser after replacing the text
extract:

```sh
node tools/parse-collocations.mjs
```

Re-extracting text from the originals (no Python PDF libraries are required for
the font-embedded PDF; `pdf-parse` handles it):

```sh
unzip -p reference/writing-guide.docx word/document.xml   # strip tags
unzip -p reference/reading-strategies.pptx 'ppt/slides/*' # strip tags per slide
```
