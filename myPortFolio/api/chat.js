// Vercel function for POST /api/chat. All decisions live in _lib/pipeline.js;
// this file only adapts the Web Request/Response and holds the rate limiter.
import { MESSAGES } from "./_lib/messages.js";
import { handleChat } from "./_lib/pipeline.js";
import { createRateLimiter } from "./_lib/rateLimit.js";

const limiter = createRateLimiter();
const MAX_READ_BYTES = 4097; // one past the pipeline's limit, so oversize is still detected

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

function clientIp(headers) {
  const forwarded = headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || headers.get("x-real-ip") || "unknown";
}

// Reads at most MAX_READ_BYTES so a huge body is never buffered in full.
async function readBody(request) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (size < MAX_READ_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
  }
  reader.cancel().catch(() => {});
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(bytes.subarray(0, MAX_READ_BYTES));
}

export async function POST(request) {
  const { status, body } = await handleChat({
    method: "POST",
    contentType: request.headers.get("content-type"),
    rawBody: await readBody(request),
    ip: clientIp(request.headers),
    origin: request.headers.get("origin") ?? undefined,
    host: new URL(request.url).host,
    env: process.env,
    limiter,
  });
  return json(status, body);
}

export function GET() {
  return json(405, { reply: MESSAGES.refused, kind: "refused" });
}
