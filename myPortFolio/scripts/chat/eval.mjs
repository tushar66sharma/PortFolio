// Live guardrail eval: sends every case in eval-cases.json through the real
// pipeline and Groq, and checks the kind of reply. Needs GROQ_API_KEY in .env.local.
// Run: npm run chat:eval
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { handleChat } from "../../api/_lib/pipeline.js";
import { createRateLimiter } from "../../api/_lib/rateLimit.js";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const env = { ...loadEnv("development", ROOT, "GROQ_"), ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith("GROQ_"))) };
if (!env.GROQ_API_KEY) {
  console.error("Set GROQ_API_KEY in .env.local to run the eval");
  process.exit(2);
}

const cases = JSON.parse(readFileSync(new URL("./eval-cases.json", import.meta.url), "utf8"));
const limiter = createRateLimiter({ perMinute: 1000, perDay: 100000 });
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;

for (const [i, c] of cases.entries()) {
  const { body } = await handleChat({
    method: "POST",
    contentType: "application/json",
    rawBody: JSON.stringify({ message: c.q, history: c.history ?? [] }),
    ip: "eval",
    origin: undefined,
    host: "localhost",
    env,
    limiter,
  });
  const ok = body.kind === c.expect;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${c.q} → ${body.kind}${ok ? "" : ` (expected ${c.expect}): ${body.reply.slice(0, 120)}`}`);
  if (i < cases.length - 1) await pause(2500); // stay under Groq's free-tier 30 requests/minute
}

console.log(failed ? `\n${failed} of ${cases.length} cases failed` : `\nPASS ${cases.length} cases`);
process.exit(failed ? 1 : 0);
