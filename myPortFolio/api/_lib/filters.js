// Deterministic checks that run without any AI call: input clean-up, greetings,
// a blocklist of manipulation attempts, and validation of the model's reply.
import { MESSAGES } from "./messages.js";

const ZERO_WIDTH = /[\u200B-\u200D\u2060\uFEFF]/g;
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001F\u007F-\u009F]/g;

export function normalize(text) {
  return text.normalize("NFKC").replace(ZERO_WIDTH, "").replace(/\s+/g, " ").replace(CONTROL, "").trim();
}

const GREETING =
  /^(hi|hii+|hello|hey|hey there|hi there|hello there|yo|good (morning|afternoon|evening)|thanks|thank you|thank you so much|thanks a lot|ok thanks|cool thanks)[\s!.,]*$/i;

export function isGreeting(text) {
  return GREETING.test(text.trim());
}

// [category, pattern] pairs; a category may appear more than once.
const BLOCKLIST = [
  ["override", /\b(ignore|disregard|forget|override|bypass)\b.{0,40}\b(instructions?|prompts?|rules?|guidelines?|above|previous|prior)\b/i],
  [
    "extraction",
    /\bsystem prompt\b|\b(your|the|hidden|initial|original) (instructions|prompt|rules)\b|\b(reveal|print|show|repeat|output|display|leak)\b.{0,30}\b(prompt|instructions|rules|text above|above text)\b|\brepeat the text\b/i,
  ],
  [
    "persona",
    /\byou are now\b|(^|\byou (will |must |should |can )?|\bplease |\bnow )act as\b|\bpretend\b|\brole-?play\b|\bjailbreak\b|\bdeveloper mode\b/i,
  ],
  ["persona", /\bDAN\b/], // case-sensitive so the name "Dan" still passes
  ["encoding", /\bbase ?64\b|\brot ?13\b|\bdecode (this|the following)\b|\bhex(adecimal)? encod/i],
  ["template", /<\||\|>|\[\/?INST\]|<<\/?SYS>>|^#{2,}\s*(system|assistant|user)\b/im],
  ["code", /```/],
  ["url", /https?:\/\/|\bwww\./i],
];

export function findBlocked(text) {
  for (const [category, pattern] of BLOCKLIST) {
    if (pattern.test(text)) return category;
  }
  return null;
}

// Room for a full project list with links; anything longer is treated as a runaway reply.
const MAX_REPLY = 3000;
const REPLY_DENY = /```|<[a-z]|system prompt|instructions|as an ai/i;

export function validateReply(text, links) {
  const reply = (text ?? "").trim();
  const refused = { kind: "refused", reply: MESSAGES.refused };
  if (reply.includes("OUT_OF_SCOPE")) return refused;
  if (reply.includes("NO_INFO")) return { kind: "no_info", reply: MESSAGES.no_info };
  if (!reply || reply.length > MAX_REPLY || REPLY_DENY.test(reply)) return refused;

  const urls = reply.match(/https?:\/\/\S+/g) ?? [];
  const unknown = urls.map((u) => u.replace(/[.,;:!?)\]]+$/, "")).some((u) => !links.some((link) => u.startsWith(link)));
  if (unknown) return refused;

  return { kind: "answer", reply };
}
