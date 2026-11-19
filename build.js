#!/usr/bin/env node
/* Build self-contained exam HTML files from template + css + engine + content JSON. */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const template = read("src/template.html");
const css = read("src/styles.css");
const engine = read("src/engine.js");

/* Academic Collocation List: pairs embedded so writing feedback can grade
   lexical range and offer prompt-specific collocation hints offline. */
function collocationPairs() {
  const p = path.join(ROOT, "reference", "academic-collocations.json");
  if (!fs.existsSync(p)) return [];
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  const strip = (s) => s.replace(/\s*\([^)]*\)/g, "").trim();
  const seen = new Set();
  const pairs = [];
  for (const entry of data.entries || []) {
    const head = strip(entry.head);
    if (!head) continue;
    for (const c of entry.collocates || []) {
      const word = strip(c.word);
      if (!word) continue;
      const key = head + "|" + word;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push([head, word]);
    }
  }
  return pairs;
}
const aclJson = JSON.stringify(collocationPairs());

const outDir = path.join(ROOT, "exams");
fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(path.join(ROOT, "content")).filter((f) => f.endsWith(".json")).sort();
if (!files.length) { console.error("No content files found"); process.exit(1); }

for (const f of files) {
  const raw = read("content/" + f);
  let content;
  try { content = JSON.parse(raw); } catch (e) { console.error(`INVALID JSON: ${f}: ${e.message}`); process.exit(1); }
  const id = content.meta && content.meta.id;
  if (!id) { console.error(`Missing meta.id in ${f}`); process.exit(1); }
  // JSON is embedded inside a <script>: escape "</script" defensively.
  const safeJson = JSON.stringify(content).replace(/<\//g, "<\\/");
  // Neural clip index (hash -> duration ms) built by tools/render-audio.mjs.
  const manifestPath = path.join(ROOT, "audio", `exam${id}`, "manifest.json");
  const audioJson = fs.existsSync(manifestPath)
    ? fs.readFileSync(manifestPath, "utf8").trim()
    : "{}";
  let html = template
    .replace("__TITLE__", content.meta.title.replace(/</g, "&lt;"))
    .replace("/*__CSS__*/", () => css)
    .replace("/*__CONTENT__*/null", () => safeJson)
    .replace("/*__AUDIO__*/null", () => audioJson)
    .replace("/*__ACL__*/null", () => aclJson)
    .replace("/*__ENGINE__*/", () => engine);
  const out = path.join(outDir, `pte-mock-exam-${id}.html`);
  fs.writeFileSync(out, html);
  console.log(`built ${out} (${(html.length / 1024).toFixed(0)} KB)`);
}
console.log("done");
