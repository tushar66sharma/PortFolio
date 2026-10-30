// Minimal client for Groq's OpenAI-compatible chat completions endpoint.
export const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_RETRY_WAIT_MS = 4000;

export class GroqError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "GroqError";
    this.status = status; // 0 for network errors and timeouts
  }
}

// On a 429 Groq says in retry-after how many seconds to wait; null when there is no short wait.
function retryWait(res) {
  if (res.status !== 429) return null;
  const header = res.headers.get("retry-after");
  const ms = Number(header) * 1000;
  return header !== null && Number.isFinite(ms) && ms >= 0 && ms <= MAX_RETRY_WAIT_MS ? ms : null;
}

async function post({ apiKey, model, messages, options, fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, ...options }),
      signal: controller.signal,
    });
  } catch (err) {
    throw new GroqError(err?.name === "AbortError" ? "timeout" : "network error", 0);
  } finally {
    clearTimeout(timer);
  }
}

export async function groqChat({ apiKey, model, messages, options = {}, fetchImpl = fetch, timeoutMs = 15000 }) {
  const request = { apiKey, model, messages, options, fetchImpl, timeoutMs };
  let res = await post(request);
  const wait = retryWait(res);
  if (wait !== null) {
    await new Promise((resolve) => setTimeout(resolve, wait));
    res = await post(request);
  }
  if (!res.ok) throw new GroqError(`HTTP ${res.status}`, res.status);

  const data = await res.json().catch(() => null);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new GroqError("missing content", res.status);
  return content;
}
