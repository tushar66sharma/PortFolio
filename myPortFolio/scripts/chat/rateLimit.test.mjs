import { test } from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter } from "../../api/_lib/rateLimit.js";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

test("allows 6 messages a minute per IP, then recovers after the minute", () => {
  let t = 0;
  const limiter = createRateLimiter({ now: () => t });
  for (let i = 0; i < 6; i++) assert.equal(limiter.hit("a"), true, `hit ${i + 1}`);
  assert.equal(limiter.hit("a"), false);
  assert.equal(limiter.hit("b"), true, "other IPs are unaffected");
  t += MINUTE + 1;
  assert.equal(limiter.hit("a"), true);
});

test("allows 40 messages a day per IP, then recovers after 24 hours", () => {
  let t = 0;
  const limiter = createRateLimiter({ now: () => t });
  for (let i = 0; i < 40; i++) {
    assert.equal(limiter.hit("a"), true, `hit ${i + 1}`);
    t += MINUTE + 1;
  }
  assert.equal(limiter.hit("a"), false);
  t += DAY;
  assert.equal(limiter.hit("a"), true);
});

test("denied hits are not counted", () => {
  let t = 0;
  const limiter = createRateLimiter({ perMinute: 1, perDay: 2, now: () => t });
  assert.equal(limiter.hit("a"), true);
  assert.equal(limiter.hit("a"), false);
  assert.equal(limiter.hit("a"), false);
  t += MINUTE + 1;
  assert.equal(limiter.hit("a"), true, "second allowed hit of the day");
});
