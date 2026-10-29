// Minimal client for Groq's OpenAI-compatible chat completions endpoint.
export const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export class GroqError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "GroqError";
    this.status = status; // 0 for network errors and timeouts
  }
}

export async function groqChat({ apiKey, model, messages, options = {}, fetchImpl = fetch, timeoutMs = 15000 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let res;
    try {
      res = await fetchImpl(GROQ_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, ...options }),
        signal: controller.signal,
      });
    } catch (err) {
      throw new GroqError(err?.name === "AbortError" ? "timeout" : "network error", 0);
    }
    if (!res.ok) throw new GroqError(`HTTP ${res.status}`, res.status);

    const data = await res.json().catch(() => null);
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new GroqError("missing content", res.status);
    return content;
  } finally {
    clearTimeout(timer);
  }
}
