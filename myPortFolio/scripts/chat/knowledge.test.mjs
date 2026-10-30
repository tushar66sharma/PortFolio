import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKnowledge, loadPortfolio } from "../knowledge/build-knowledge.mjs";
import { LINKS, SECTIONS } from "../../api/_lib/knowledge.js";

const { constants, site } = await loadPortfolio();
const lf = (text) => text.replace(/\r\n/g, "\n");

test("committed knowledge.js matches a fresh generation (run `npm run knowledge` if this fails)", async () => {
  const committed = readFileSync(new URL("../../api/_lib/knowledge.js", import.meta.url), "utf8");
  assert.equal(lf(await generateKnowledge()), lf(committed));
});

test("knowledge covers every project, role, qualification and profile", () => {
  for (const p of constants.projects) assert.ok(SECTIONS.projects.includes(p.title.trim()), p.title);
  for (const e of constants.experiences) {
    assert.ok(SECTIONS.experience.includes(e.company), e.company);
    assert.ok(SECTIONS.experience.includes(e.role), e.role);
  }
  for (const e of constants.education) {
    assert.ok(SECTIONS.education.includes(e.degree), e.degree);
    assert.ok(SECTIONS.education.includes(e.grade), e.grade);
  }
  for (const p of site.profiles) assert.ok(SECTIONS.contact.includes(p.url), p.url);
  assert.ok(SECTIONS.contact.includes(site.RESUME_URL));
  assert.ok(SECTIONS.about.includes(site.ABOUT_TEXT));
  assert.ok(SECTIONS.about.includes(constants.experiences[0].company));
  for (const group of constants.SkillsInfo) {
    for (const skill of group.skills) assert.ok(SECTIONS.skills.includes(skill.name), skill.name);
  }
});

test("LINKS lists the profile and project URLs", () => {
  assert.ok(LINKS.includes("https://github.com/tushar66sharma"));
  for (const p of constants.projects) assert.ok(LINKS.includes(p.github), p.github);
});

test("knowledge carries no image paths", () => {
  for (const [name, text] of Object.entries(SECTIONS)) {
    assert.doesNotMatch(text, /\.(png|jpe?g)\b|\/assets\//i, name);
  }
});

test("site exports the chat sample questions", () => {
  assert.deepEqual(site.CHAT_SAMPLES, [
    "What is Tushar's current role?",
    "What's his tech stack?",
    "Which projects has he built?",
    "What did he study?",
    "How can I contact him?",
  ]);
});
