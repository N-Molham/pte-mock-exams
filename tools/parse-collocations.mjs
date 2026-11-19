#!/usr/bin/env node
/*
 * Parse the Pearson Academic Collocation List (reference/academic-collocation-list.pdf,
 * text copy in reference/extracted/) into reference/academic-collocations.json.
 *
 *   node tools/parse-collocations.mjs
 *
 * Output shape:
 *   { source, count, entries: [ { head, pos, collocates: [ { word, pos } ] } ] }
 *
 * Sections that do not belong to the list (cover, "why collocations matter",
 * teaching notes, footer, closing links) are skipped by anchoring on entry 1.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "reference", "extracted", "academic-collocation-list.txt");
const OUT = path.join(ROOT, "reference", "academic-collocations.json");

if (!fs.existsSync(SRC)) {
  console.error(`missing ${SRC} — extract the PDF text first`);
  process.exit(1);
}

const raw = fs.readFileSync(SRC, "utf8");
let lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
lines = lines.filter((l) => !/^--\s*\d+ of \d+\s*--$/.test(l));
lines = lines.filter((l) => !/^THE ACADEMIC COLLOCATION LIST/.test(l));

const start = lines.findIndex((l) => /^1\s+abstract \(adj\)$/.test(l));
if (start < 0) {
  console.error("could not find the first entry (1 abstract (adj))");
  process.exit(1);
}

const POS = /\s*\((adj|adv|v|n|vpp)\)\s*$/;
function splitPos(s) {
  const m = s.match(POS);
  return m ? { text: s.slice(0, m.index).trim(), pos: m[1] } : { text: s.trim(), pos: "" };
}

const entries = [];
let cur = null;
for (const line of lines.slice(start)) {
  const m = line.match(/^(\d+)\s+(.+)$/);
  if (m) {
    const { text, pos } = splitPos(m[2]);
    cur = { num: +m[1], head: text, pos, collocates: [] };
    entries.push(cur);
    continue;
  }
  if (!cur) continue;
  if (/^pearsonpte\.com$/.test(line)) break;
  const { text, pos } = splitPos(line);
  cur.collocates.push({ word: text, pos });
}

const kept = entries.filter((e) => e.collocates.length);
const count = kept.reduce((n, e) => n + e.collocates.length, 0);
const payload = {
  source: "Pearson Academic Collocation List, classroom resource v3/2026",
  count,
  entries: kept,
};
fs.writeFileSync(OUT, JSON.stringify(payload) + "\n");
console.log(`${kept.length} headwords, ${count} collocations -> ${path.relative(ROOT, OUT)}`);
