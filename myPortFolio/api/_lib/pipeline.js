// The whole /api/chat decision flow (spec 7.2). Pure apart from the injected
// fetch, env and limiter, so it can be tested without a network.
import { findBlocked, isGreeting, normalize, validateReply } from "./filters.js";
import { GroqError, groqChat } from "./groq.js";
import { LINKS } from "./knowledge.js";
import { MESSAGES } from "./messages.js";
import { answerMessages, parseGuard, scopeMessages, TOPICS } from "./prompts.js";

const MAX_BODY_BYTES = 4096;
const MAX_TEXT = 300;
const MAX_HISTORY = 3;
const DEFAULT_MODEL = "openai/gpt-oss-20b";
const DEFAULT_GUARD_MODEL = "meta-llama/llama-prompt-guard-2-86m";

const respond = (status, kind) => ({ status, body: { reply: MESSAGES[kind], kind } });

function hostOf(origin) {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

// Returns { message, history } with normalised text, or null when the body is unusable.
function parseInput(rawBody) {
  let data;
  try {
    data = JSON.parse(rawBody);
  } catch {
    return null;
  }
  const history = data?.history ?? [];
  if (typeof data?.message !== "string" || !Array.isArray(history) || history.length > MAX_HISTORY) return null;
  if (history.some((h) => typeof h !== "string")) return null;

  const message = normalize(data.message);
  const past = history.map(normalize);
  if (!message || message.length > MAX_TEXT || past.some((h) => h.length > MAX_TEXT)) return null;
  return { message, history: past.filter(Boolean) };
}

function parseScope(content) {
  try {
    const verdict = JSON.parse(content);
    if (verdict?.verdict !== "allow") return null;
    return Array.isArray(verdict.topics) ? verdict.topics.filter((t) => TOPICS.includes(t)) : [];
  } catch {
    return null;
  }
}

export async function handleChat({ method, contentType, rawBody, ip, origin, host, env, fetchImpl = fetch, limiter }) {
  if (method !== "POST") return respond(405, "refused");
  if (new TextEncoder().encode(rawBody ?? "").length > MAX_BODY_BYTES) return respond(413, "refused");
  if (!/^application\/json\b/i.test(contentType ?? "")) return respond(400, "refused");
  if (origin && hostOf(origin) !== host) return respond(403, "refused");
  if (!env.GROQ_API_KEY) return respond(503, "busy");

  const input = parseInput(rawBody);
  if (!input) return respond(400, "refused");
  const { message, history } = input;

  if (!limiter.hit(ip)) return respond(200, "limited");
  if (isGreeting(message)) return respond(200, "greeting");
  if ([message, ...history].some((text) => findBlocked(text))) return respond(200, "refused");

  const model = env.GROQ_MODEL || DEFAULT_MODEL;
  const guardModel = env.GROQ_GUARD_MODEL || DEFAULT_GUARD_MODEL;
  const call = (args) =>
    groqChat({ apiKey: env.GROQ_API_KEY, fetchImpl, timeoutMs: Number(env.GROQ_TIMEOUT_MS) || 15000, ...args });

  let step = "guard";
  try {
    if (guardModel !== "off") {
      const verdict = await call({ model: guardModel, messages: [{ role: "user", content: [...history, message].join("\n") }] });
      if (parseGuard(verdict)) return respond(200, "refused");
    }

    step = "scope";
    const scope = await call({
      model,
      messages: scopeMessages(message, history),
      options: { temperature: 0, reasoning_effort: "low", include_reasoning: false, response_format: { type: "json_object" } },
    });
    const topics = parseScope(scope);
    if (!topics) return respond(200, "refused");

    step = "answer";
    const answer = await call({
      model,
      messages: answerMessages(message, history, topics),
      options: { temperature: 0.2, reasoning_effort: "low", include_reasoning: false, max_completion_tokens: 700 },
    });
    const checked = validateReply(answer, LINKS);
    return { status: 200, body: checked };
  } catch (err) {
    if (!(err instanceof GroqError)) throw err;
    console.error(`[chat] groq ${step} call failed: ${err.status} ${err.message}`);
    return respond(200, "busy");
  }
}
