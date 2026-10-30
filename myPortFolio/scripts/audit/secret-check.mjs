// Fails if the built site contains anything that points at the Groq key or API.
// Run after `npm run build`: node scripts/audit/secret-check.mjs
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../../dist", import.meta.url));
const NEEDLES = ["gsk_", "GROQ_API_KEY", "api.groq.com"];

const files = readdirSync(DIST, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath, entry.name));

const hits = [];
for (const file of files) {
  const text = readFileSync(file, "latin1");
  for (const needle of NEEDLES) if (text.includes(needle)) hits.push(`${file}: ${needle}`);
}

if (hits.length) {
  console.error(`FAIL secret check\n${hits.join("\n")}`);
  process.exit(1);
}
console.log(`PASS secret check (${files.length} files)`);
