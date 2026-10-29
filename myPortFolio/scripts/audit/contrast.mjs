// Contrast check: reads the --bp-* tokens from src/index.css (light :root block and
// :root[data-theme="dark"] block) and asserts WCAG contrast ratios for each theme.
// Usage: node scripts/audit/contrast.mjs
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const css = readFileSync(join(resolve(import.meta.dirname, "../.."), "src/index.css"), "utf8");

function tokens(blockRe) {
  const m = css.match(blockRe);
  if (!m) return null;
  const out = {};
  for (const [, k, v] of m[1].matchAll(/--bp-([a-z-]+)\s*:\s*(#[0-9a-fA-F]{6})/g)) out[k] = v;
  return out;
}
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const PAIRS = [
  ["ink", "paper", 7],
  ["ink", "panel", 7],
  ["muted", "paper", 4.5],
  ["muted", "panel", 4.5],
  ["accent", "paper", 4.5],
  ["paper", "line", 4.5],
];
const themes = {
  light: tokens(/:root\s*\{([^}]*)\}/),
  dark: tokens(/:root\[data-theme="dark"\]\s*\{([^}]*)\}/),
};

const failures = [];
let count = 0;
for (const [name, t] of Object.entries(themes)) {
  for (const [fg, bg, min] of PAIRS) {
    count++;
    if (!t || !t[fg] || !t[bg]) {
      failures.push(`FAIL ${name}: ${fg} on ${bg} — token missing`);
      continue;
    }
    const r = ratio(t[fg], t[bg]);
    if (r < min) failures.push(`FAIL ${name}: ${fg} ${t[fg]} on ${bg} ${t[bg]} = ${r.toFixed(2)} (needs ${min})`);
  }
}
if (failures.length) {
  console.log(failures.join("\n") + `\n\n${failures.length} of ${count} checks failed`);
  process.exit(1);
}
console.log(`PASS ${count} checks`);
