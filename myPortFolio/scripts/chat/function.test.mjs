import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GET, POST } from "../../api/chat.js";

const chatRequest = (body, headers = {}) =>
  new Request("https://site.test/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

test("without GROQ_API_KEY the function answers 503 busy", async () => {
  delete process.env.GROQ_API_KEY;
  const res = await POST(chatRequest({ message: "hi" }));
  assert.equal(res.status, 503);
  assert.equal((await res.json()).kind, "busy");
});

test("with a key, a greeting is answered without calling Groq", async () => {
  process.env.GROQ_API_KEY = "gsk_test_secret";
  try {
    const res = await POST(chatRequest({ message: "hi" }, { "x-forwarded-for": "9.9.9.9, 10.0.0.1" }));
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "application/json");
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal((await res.json()).kind, "greeting");
  } finally {
    delete process.env.GROQ_API_KEY;
  }
});

test("a foreign Origin header is rejected", async () => {
  process.env.GROQ_API_KEY = "gsk_test_secret";
  try {
    const res = await POST(chatRequest({ message: "hi" }, { origin: "https://evil.test" }));
    assert.equal(res.status, 403);
  } finally {
    delete process.env.GROQ_API_KEY;
  }
});

test("GET is not allowed", async () => {
  const res = GET();
  assert.equal(res.status, 405);
  assert.equal((await res.json()).kind, "refused");
});

test("vercel.json deploys the function with zero-config settings", () => {
  const config = JSON.parse(readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"));
  assert.equal(config.builds, undefined);
  assert.equal(config.framework, "vite");
  assert.equal(config.outputDirectory, "dist");
  assert.equal(config.functions["api/chat.js"].maxDuration, 30);
});

test("the public host from x-forwarded-host is used for the Origin check", async () => {
  process.env.GROQ_API_KEY = "gsk_test_secret";
  try {
    const req = new Request("https://internal.test/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://site.test", "x-forwarded-host": "site.test" },
      body: JSON.stringify({ message: "hi" }),
    });
    const res = await POST(req);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).kind, "greeting");
  } finally {
    delete process.env.GROQ_API_KEY;
  }
});
