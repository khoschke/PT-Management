#!/usr/bin/env node
// Fails if an em dash, a spaced en dash, or an HTML entity for either appears
// in any tracked text file. The standing rule for the workbook and the portal
// is no em dashes anywhere (change list, Batch 0, November 2026).
//
// Runs as `prebuild`, so Vercel refuses to deploy a build that reintroduces
// one, and on demand with `npm run check:dashes`.
//
// The patterns are written as escapes so this file passes its own check.
// PT answers live in the database, not the repo, so this never touches them.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PATTERNS = [
  { name: "em dash (U+2014)", re: /—/ },
  { name: "en dash (U+2013)", re: /–/ },
  { name: "HTML entity", re: /&mdash;|&#8212;|&#x2014;|&ndash;|&#8211;|&#x2013;/i },
  { name: "JS escape", re: /\\u2014|\\u2013/i },
];

// Generated or binary files the rule cannot apply to.
const SKIP = [/^package-lock\.json$/, /\.(png|jpe?g|gif|ico|pdf|docx|woff2?|ttf|otf)$/i, /^tools\/check-no-em-dashes\.mjs$/];

let files;
try {
  files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
} catch {
  console.warn("check-no-em-dashes: not a git checkout, skipping.");
  process.exit(0);
}

const hits = [];
for (const file of files) {
  if (SKIP.some((re) => re.test(file))) continue;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  text.split("\n").forEach((line, i) => {
    for (const { name, re } of PATTERNS) {
      if (re.test(line)) hits.push(`${file}:${i + 1}  ${name}  ${line.trim().slice(0, 100)}`);
    }
  });
}

if (hits.length) {
  console.error(`No em dashes, please. Rewrite with a comma, colon, full stop or brackets (ranges use "to").\n`);
  console.error(hits.join("\n"));
  console.error(`\n${hits.length} found.`);
  process.exit(1);
}
console.log("check-no-em-dashes: clean.");
