#!/usr/bin/env node
/* Build self-contained exam HTML files from template + css + engine + content JSON. */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const template = read("src/template.html");
const css = read("src/styles.css");
const engine = read("src/engine.js");

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
  let html = template
    .replace("__TITLE__", content.meta.title.replace(/</g, "&lt;"))
    .replace("/*__CSS__*/", () => css)
    .replace("/*__CONTENT__*/null", () => safeJson)
    .replace("/*__ENGINE__*/", () => engine);
  const out = path.join(outDir, `pte-mock-exam-${id}.html`);
  fs.writeFileSync(out, html);
  console.log(`built ${out} (${(html.length / 1024).toFixed(0)} KB)`);
}
console.log("done");
