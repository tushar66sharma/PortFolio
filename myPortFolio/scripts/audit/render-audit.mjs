// Content audit: server-renders <App/> and checks that every piece of
// portfolio content (constants.js + strings kept inside components) is on the page.
// Usage: node scripts/audit/render-audit.mjs
import { build } from "vite";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "../..");
const outDir = join(tmpdir(), "portfolio-audit");

await build({
  root,
  configFile: join(root, "vite.config.js"),
  logLevel: "error",
  build: {
    ssr: "scripts/audit/entry-server.js",
    outDir,
    emptyOutDir: true,
    rollupOptions: { output: { format: "es", entryFileNames: "entry-server.mjs" } },
  },
  ssr: { noExternal: true },
});

const mod = await import(pathToFileURL(join(outDir, "entry-server.mjs")).href + "?t=" + Date.now());
const { SkillsInfo, experiences, education, projects } = mod;
const html = mod.render();

const decode = (s) =>
  s
    .replace(/<!-- -->/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&");
const squash = (s) => s.replace(/\s+/g, " ").trim();
const page = squash(decode(html));
const text = squash(decode(html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ")));
const src = (path) => readFileSync(join(root, path), "utf8");

// --- check builders ---
const inText = (name, str) => ({
  name,
  test: () => text.includes(squash(str)) || `text not rendered: "${squash(str).slice(0, 90)}"`,
});
const inHtml = (name, str) => ({
  name,
  test: () => page.includes(squash(str)) || `markup not found: ${squash(str).slice(0, 90)}`,
});
const inSource = (name, path, str) => ({
  name,
  test: () => src(path).includes(str) || `${path} no longer contains "${str}"`,
});

const CHECKS = [];

// --- Task 1: content from constants.js ---
SkillsInfo.forEach((cat) => {
  CHECKS.push(inText(`skills: category ${cat.title}`, cat.title));
  cat.skills.forEach((s) => CHECKS.push(inText(`skills: ${cat.title}/${s.name}`, s.name)));
});
experiences.forEach((e) => {
  for (const f of ["role", "company", "date", "desc"]) CHECKS.push(inText(`experience ${e.id}: ${f}`, e[f]));
  e.skills.forEach((s, i) => CHECKS.push(inText(`experience ${e.id}: skill[${i}] ${s}`, s)));
});
education.forEach((e) => {
  for (const f of ["school", "date", "grade", "desc", "degree"]) CHECKS.push(inText(`education ${e.id}: ${f}`, e[f]));
});
projects.forEach((p) => {
  CHECKS.push(inText(`project ${p.id}: title`, p.title.trim()));
  CHECKS.push(inText(`project ${p.id}: description`, p.description));
  p.tags.forEach((t, i) => CHECKS.push(inText(`project ${p.id}: tag[${i}] ${t.trim()}`, t.trim())));
});

// --- Task 1: content kept inside components ---
CHECKS.push(
  inText(
    "about: paragraph",
    "I’m Tushar Sharma, a Software Engineer with experience building production-ready backend systems, full-stack web applications, and AI-powered solutions. I specialize in Python, FastAPI, TypeScript, React, PostgreSQL, and Google Cloud, with hands-on experience in designing scalable APIs, cloud infrastructure, CI/CD pipelines, and automation workflows. I enjoy solving complex engineering problems and building reliable, high-performance software that delivers real-world impact."
  ),
  inHtml("about: resume link", 'href="https://drive.google.com/file/d/1UCyThGN3WtYYY_5FgnzhLwHWx7Pyq8ED/view?usp=drive_link"'),
  inHtml("profile: GitHub", 'href="https://github.com/tushar66sharma"'),
  inHtml("profile: LinkedIn", 'href="https://www.linkedin.com/in/tushar-sharma-599992256/"'),
  inHtml("profile: LeetCode", 'href="https://leetcode.com/u/DynamicCoder_66/"'),
  inHtml("profile: CodeChef", 'href="https://www.codechef.com/users/dynamiccoder66"'),
  inHtml("profile: Codeforces", 'href="https://codeforces.com/profile/DynamicCoder_66"'),
  inHtml("profile: Instagram", 'href="https://www.instagram.com/i_tushar_66?igsh=MXIxc3J6d3lyN3I4dA=="'),
  ...["user_email", "user_name", "subject", "message"].map((n) => inHtml(`contact: field ${n}`, `name="${n}"`)),
  ...["service_f7oaimq", "template_6g9gonj", "oJY8R8h4jJnI9xdch"].map((id) =>
    inSource(`contact: EmailJS ${id}`, "src/components/Contact/Contact.jsx", id)
  ),
  ...["Full-Stack Developer", "App Developer", "Competitive Programmer", "Open-Source Contributor"].map((w) =>
    inSource(`about: role word ${w}`, "src/components/About/About.jsx", `"${w}"`)
  )
);

// --- Task 3: sheet frame, references row, footer, drawing helpers ---
const count = (re) => (page.match(re) || []).length;
CHECKS.push(
  inText("references: label", "REFERENCES"),
  ...[
    ["GitHub", "tushar66sharma"],
    ["LinkedIn", "tushar-sharma"],
    ["LeetCode", "DynamicCoder_66"],
    ["Codeforces", "DynamicCoder_66"],
    ["CodeChef", "dynamiccoder66"],
  ].flatMap(([ref, handle]) => [inText(`references: ${ref}`, ref), inText(`references: ${ref} handle`, handle)]),
  inText("footer: drawing note", "DO NOT SCALE DRAWING"),
  inText("footer: copyright", "© 2026 Tushar Sharma. All rights reserved."),
  inHtml("footer: projects link targets #work", 'href="#work"'),
  { name: "footer: no dead #projects link", test: () => !page.includes('href="#projects"') || 'found href="#projects"' },
  { name: "sheet: six zone markers", test: () => count(/data-zone="/g) === 6 || `found ${count(/data-zone="/g)} zone markers` },
  {
    name: "drawing helpers",
    test: () => {
      if (typeof mod.revLetter !== "function") return "drawing helpers not exported from entry-server";
      const c = mod.getCounts();
      const ok = mod.revLetter(0, 4) === "D" && mod.revLetter(3, 4) === "A" && mod.detailLetter(6) === "G" && c.roles === 4 && c.projects === 7 && c.skills === 36;
      return ok || `got revLetter(0,4)=${mod.revLetter(0, 4)} revLetter(3,4)=${mod.revLetter(3, 4)} detailLetter(6)=${mod.detailLetter(6)} counts=${JSON.stringify(c)}`;
    },
  }
);

// --- Task 4: navbar ---
const mainNav = () => (page.match(/<nav[^>]*aria-label="Main"[\s\S]*?<\/nav>/) || [""])[0];
CHECKS.push(
  { name: "navbar: brand TS-066", test: () => mainNav().includes("TS-066") || "main nav missing or has no TS-066 brand" },
  {
    name: "navbar: six section links",
    test: () => {
      const hrefs = ["#about", "#skills", "#experience", "#work", "#education", "#contact"].filter((h) => !mainNav().includes(`href="${h}"`));
      return !hrefs.length || `main nav missing ${hrefs.join(", ")}`;
    },
  },
  inHtml("navbar: theme toggle label", 'aria-label="Switch to dark theme"')
);

// --- Task 5: hero ---
const titleBlock = () => squash(decode((html.match(/aria-label="Title block"[\s\S]*?<\/aside>/) || [""])[0].replace(/<[^>]+>/g, " ")));
CHECKS.push(
  inText("hero: eyebrow", "GENERAL ARRANGEMENT"),
  inText("hero: first role word typed on first paint", "Full-Stack Developer"),
  inText("hero: dimension line", "4 ROLES · 7 PROJECTS · 36 SKILLS"),
  inText("hero: photo label", "FRONT ELEVATION"),
  inText("hero: CV button", "Download CV"),
  inHtml("hero: photo alt", 'alt="Tushar Sharma"'),
  { name: "hero: exactly one h1", test: () => count(/<h1[\s>]/g) === 1 || `found ${count(/<h1[\s>]/g)} h1 elements` },
  ...["Talendy Holdings (Tech Japan Labs)", "B.Tech CSE · 8.4 CPI", "D · 1 OF 1", "TS-066"].map((v) => ({
    name: `hero: title block shows ${v}`,
    test: () => titleBlock().includes(v) || `title block missing "${v}"`,
  }))
);

// --- Task 6: skills parts list ---
CHECKS.push(
  inText("skills: section tag", "SECTION B–B"),
  inText("skills: note", "bill of materials by assembly"),
  inText("skills: intro", "A collection of my technical skills and expertise honed through various projects and experiences"),
  inText("skills: ASSEMBLY column", "ASSEMBLY"),
  ...SkillsInfo.flatMap((cat) => [
    inHtml(`skills: ${cat.title} quantity`, `data-qty="${cat.skills.length}"`),
    ...cat.skills.map((s) => inHtml(`skills: ${cat.title}/${s.name} logo`, `alt="${s.name} logo"`)),
  ])
);

// --- Task 7: experience revision history ---
CHECKS.push(
  inText("experience: section tag", "REV. HISTORY"),
  inText("experience: note", "latest revision first"),
  inText("experience: intro", "A collection of my work experience and the roles I have taken in various organizations"),
  {
    name: "experience: revision letters newest first",
    test: () => {
      const revs = [...page.matchAll(/data-rev="([A-Z])"/g)].map((m) => m[1]).join("");
      return revs === "DCBA" || `revision order "${revs}", expected "DCBA"`;
    },
  },
  {
    name: "experience: one SPEC chip per skill entry (duplicates kept)",
    test: () => {
      const want = experiences.reduce((n, e) => n + e.skills.length, 0);
      return count(/data-spec="/g) === want || `found ${count(/data-spec="/g)} SPEC chips, expected ${want}`;
    },
  }
);

// --- Task 8: projects detail views ---
CHECKS.push(
  inText("projects: section tag", "DETAIL VIEWS"),
  inText("projects: note", "scale 2 : 1"),
  inText("projects: intro", "A showcase of the projects I have worked on, highlighting my skills and experience in various technologies"),
  ...projects.map((p, i) => inText(`projects: callout ${i}`, `DETAIL ${String.fromCharCode(65 + i)}`)),
  { name: "projects: Source link on every card", test: () => (text.match(/Source ↗/g) || []).length === projects.length || `found ${(text.match(/Source ↗/g) || []).length} Source links` },
  // moved from Task 1: the old design only rendered these inside the modal
  ...projects.flatMap((p) => [inHtml(`project ${p.id}: github link`, `href="${p.github}"`), inHtml(`project ${p.id}: live link`, `href="${p.webapp}"`)])
);

// --- Task 9: education certification record ---
CHECKS.push(
  inText("education: section tag", "CERT. RECORD"),
  inText("education: note", "qualifications on file"),
  inText("education: QUALIFICATION column", "QUALIFICATION"),
  inText("education: intro", "My education has been a journey of learning and development. Here are the details of my academic background"),
  ...education.map((e) => inHtml(`education ${e.id}: grade cell`, `data-grade="${e.grade}"`))
);

// --- Task 10: contact transmittal ---
CHECKS.push(
  inText("contact: section tag", "TRANSMITTAL"),
  inText("contact: form header", "TRANSMITTAL NO. TS-066-T"),
  inText("contact: send button", "SEND TRANSMITTAL"),
  inText("contact: intro", "I’d love to hear from you—reach out for any opportunities or questions!"),
  ...["email", "name", "subject", "message"].flatMap((f) => [
    inHtml(`contact: label for ${f}`, `for="contact-${f}"`),
    inHtml(`contact: field id ${f}`, `id="contact-${f}"`),
  ])
);

// --- Chat widget (closed on first render) ---
CHECKS.push(
  inHtml("chat: launcher button", 'class="js-chat-launcher'),
  inHtml("chat: launcher label", 'aria-label="Open chat"'),
  inHtml("chat: launcher collapsed", 'aria-expanded="false"'),
  inHtml("chat: launcher controls panel", 'aria-controls="chat-panel"'),
  inHtml("chat: unread dot", "js-chat-dot"),
  { name: "chat: panel closed on load", test: () => !page.includes('id="chat-panel"') || "panel rendered while closed" }
);

// --- run ---
const failures = [];
for (const c of CHECKS) {
  let r;
  try {
    r = c.test();
  } catch (err) {
    r = `threw: ${err.message}`;
  }
  if (r !== true) failures.push(`FAIL ${c.name} — ${r}`);
}
if (failures.length) {
  console.log(failures.join("\n"));
  console.log(`\n${failures.length} of ${CHECKS.length} checks failed`);
  process.exit(1);
}
console.log(`PASS ${CHECKS.length} checks`);
