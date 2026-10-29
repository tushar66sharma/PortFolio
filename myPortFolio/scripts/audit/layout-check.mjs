// Layout & behaviour checks in headless Microsoft Edge, driven over the DevTools protocol.
// Serves dist/ with `vite preview` (run `npm run build` first), unless a base URL is given.
// Usage: npm run build && node scripts/audit/layout-check.mjs [baseUrl]
// Env: EDGE_PATH (browser binary), SHOT_DIR (write full-page screenshots there)
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { preview } from "vite";

const root = resolve(import.meta.dirname, "../..");
const EDGE = process.env.EDGE_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 9223;
const SHOT_DIR = process.env.SHOT_DIR;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let server;
let BASE = process.argv[2];
if (!BASE) {
  server = await preview({ root, logLevel: "error", preview: { port: 4173, strictPort: true } });
  BASE = "http://localhost:4173";
}

const profile = mkdtempSync(join(tmpdir(), "edge-audit-"));
const edge = spawn(
  EDGE,
  ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars", "about:blank"],
  { stdio: "ignore" }
);

async function pageSocket() {
  for (let i = 0; i < 100; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const p = list.find((t) => t.type === "page");
      if (p) return p.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(150);
  }
  throw new Error(`Edge did not start (EDGE_PATH=${EDGE})`);
}

class Page {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = [];
    this.handlers = {};
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.method && this.handlers[msg.method]) this.handlers[msg.method](msg.params);
      if (msg.id && this.pending.has(msg.id)) {
        const { res, rej } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      } else if (msg.method) {
        this.listeners = this.listeners.filter((l) => !(l.method === msg.method && (l.res(msg.params), true)));
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => this.pending.set(id, { res, rej }));
  }
  once(method) {
    return new Promise((res) => this.listeners.push({ method, res }));
  }
  async open(width, scheme, { storage, reducedMotion = false, height = 900 } = {}) {
    this.width = width;
    await this.send("Storage.clearDataForOrigin", { origin: BASE, storageTypes: "local_storage" });
    await this.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 });
    await this.send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-color-scheme", value: scheme },
        { name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" },
      ],
    });
    let seed;
    if (storage) {
      const js = Object.entries(storage).map(([k, v]) => `localStorage.setItem(${JSON.stringify(k)}, ${JSON.stringify(v)});`).join("");
      seed = await this.send("Page.addScriptToEvaluateOnNewDocument", { source: js });
    }
    const loaded = this.once("Page.loadEventFired");
    await this.send("Page.navigate", { url: BASE + "/" });
    await loaded;
    if (seed) await this.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: seed.identifier });
    await this.evaluate("document.fonts.ready.then(() => true)");
    await sleep(300);
  }
  async evaluate(expression) {
    const r = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(`evaluate failed: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
    return r.result.value;
  }
  async click(selector) {
    const ok = await this.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.click(); return true; })()`);
    if (!ok) throw new Error(`no element for ${selector}`);
    await sleep(250);
  }
  async clickAt(x, y) {
    for (const type of ["mousePressed", "mouseReleased"]) await this.send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
    await sleep(250);
  }
  async key(name) {
    const codes = { Enter: 13, Escape: 27, Tab: 9, " ": 32 };
    // Enter/Space carry their character so native buttons activate as they do for a real keypress.
    const text = { Enter: "\r", " ": " " }[name];
    for (const type of ["keyDown", "keyUp"])
      await this.send("Input.dispatchKeyEvent", { type, key: name, code: name === " " ? "Space" : name, windowsVirtualKeyCode: codes[name], ...(type === "keyDown" && text ? { text } : {}) });
    await sleep(250);
  }
  async type(text) {
    await this.send("Input.insertText", { text });
    await sleep(100);
  }
  // Answers POST /api/chat in the browser with a fixed reply; returns a live request counter.
  async mockChat({ reply = "Tushar is a Software Engineer at Talendy.", kind = "answer", delayMs = 0 } = {}) {
    const counter = { requests: 0 };
    this.handlers["Fetch.requestPaused"] = async ({ requestId }) => {
      counter.requests++;
      if (delayMs) await sleep(delayMs);
      const body = Buffer.from(JSON.stringify({ reply, kind })).toString("base64");
      await this.send("Fetch.fulfillRequest", {
        requestId,
        responseCode: 200,
        responseHeaders: [{ name: "content-type", value: "application/json" }],
        body,
      });
    };
    await this.send("Fetch.enable", { patterns: [{ urlPattern: "*/api/chat*" }] });
    return counter;
  }
  async screenshot(file) {
    if (!SHOT_DIR) return;
    mkdirSync(SHOT_DIR, { recursive: true });
    // Make lazy images load now, then wait (max 5s) for them before capturing.
    const pending = await this.evaluate(
      "(async () => { document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }); const loads = Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); await Promise.race([loads, new Promise(r => setTimeout(r, 5000))]); await Promise.all([...document.images].map(i => i.decode().catch(() => 0))); return [...document.images].filter(i => !i.complete).length; })()"
    );
    if (pending) console.log(`  note: ${pending} image(s) still loading in ${file}`);
    await sleep(200);
    const height = await this.evaluate("document.documentElement.scrollHeight");
    const { data } = await this.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: this.width, height, scale: 1 } });
    writeFileSync(join(SHOT_DIR, file), Buffer.from(data, "base64"));
  }
}

const WIDTHS = [320, 360, 768, 1024, 1440];
const SCHEMES = ["light", "dark"];
const BG = { light: "rgb(237, 242, 248)", dark: "rgb(10, 42, 85)" };

const CHECKS = [
  {
    name: "themeFollowsSystem",
    async run(p) {
      const bad = [];
      for (const s of SCHEMES) {
        await p.open(1024, s);
        const t = await p.evaluate("document.documentElement.dataset.theme");
        if (t !== s) bad.push(`system ${s} → data-theme=${t}`);
      }
      return bad.length ? bad.join("; ") : true;
    },
  },
  {
    name: "storedPreferenceWins",
    async run(p) {
      const bad = [];
      for (const [scheme, stored] of [["dark", "light"], ["light", "dark"]]) {
        await p.open(1024, scheme, { storage: { theme: stored } });
        const t = await p.evaluate("document.documentElement.dataset.theme");
        const bg = await p.evaluate("getComputedStyle(document.body).backgroundColor");
        if (t !== stored) bad.push(`system ${scheme} + stored ${stored} → data-theme=${t}`);
        if (bg !== BG[stored]) bad.push(`stored ${stored} → body background ${bg}, expected ${BG[stored]}`);
      }
      return bad.length ? bad.join("; ") : true;
    },
  },
  {
    name: "noHorizontalOverflow",
    async run(p) {
      const bad = [];
      for (const w of WIDTHS)
        for (const s of SCHEMES) {
          await p.open(w, s);
          const [sw, iw] = await p.evaluate("[document.documentElement.scrollWidth, window.innerWidth]");
          if (sw > iw) {
            const culprits = await p.evaluate(
              `[...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > window.innerWidth + 1).slice(0, 4).map(e => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\\s+/).slice(0, 3).join('.') : '')).join(', ')`
            );
            bad.push(`${w}px ${s}: scrollWidth ${sw} > ${iw} (${culprits})`);
          }
          await p.screenshot(`w${w}-${s}.png`);
        }
      return bad.length ? bad.join("; ") : true;
    },
  },
];

// --- Task 4: navbar ---
CHECKS.push(
  {
    name: "themeToggle",
    async run(p) {
      await p.open(1024, "light");
      await p.click(".js-theme-toggle");
      const a = await p.evaluate("[document.documentElement.dataset.theme, localStorage.getItem('theme')]");
      await p.click(".js-theme-toggle");
      const b = await p.evaluate("[document.documentElement.dataset.theme, localStorage.getItem('theme')]");
      const ok = a[0] === "dark" && a[1] === "dark" && b[0] === "light" && b[1] === "light";
      return ok || `after 1st click ${a.join("/")}, after 2nd click ${b.join("/")}`;
    },
  },
  {
    name: "mobileMenu",
    async run(p) {
      await p.open(360, "light");
      const before = await p.evaluate(
        "({ desktop: (() => { const el = document.querySelector('.js-desktop-links'); return el ? getComputedStyle(el).display : 'missing'; })(), menu: !!document.getElementById('mobile-menu') })"
      );
      if (before.desktop !== "none") return `desktop links display=${before.desktop} at 360px`;
      if (before.menu) return "mobile menu open before tapping the menu button";
      await p.click(".js-menu");
      const links = await p.evaluate("document.getElementById('mobile-menu') ? document.querySelectorAll('#mobile-menu a').length : -1");
      if (links !== 6) return `menu after tap: ${links === -1 ? "not shown" : links + " links"}`;
      await p.evaluate("[...document.querySelectorAll('#mobile-menu a')].find(a => a.textContent.trim() === 'Projects').click()");
      await sleep(1200);
      const after = await p.evaluate("({ open: !!document.getElementById('mobile-menu'), overflow: document.body.style.overflow, y: scrollY })");
      if (after.open) return "menu still open after tapping Projects";
      if (after.overflow === "hidden") return "page left scroll-locked";
      return after.y > 0 || "page did not scroll to Projects";
    },
  }
);

// --- Task 8: project modal ---
CHECKS.push({
  name: "projectModal",
  async run(p) {
    const state = "({ modal: !!document.querySelector('.js-project-modal'), overflow: document.body.style.overflow, label: document.activeElement?.getAttribute('aria-label'), onCard: document.activeElement?.classList.contains('js-project-card') })";
    const bad = [];
    for (const w of [360, 1440]) {
      await p.open(w, "light");
      await p.evaluate("document.querySelector('.js-project-card').focus()");
      await p.key("Enter");
      const open = await p.evaluate(state);
      if (!open.modal) bad.push(`${w}px: Enter did not open the modal`);
      if (open.overflow !== "hidden") bad.push(`${w}px: page not scroll-locked while open`);
      if (open.label !== "Close project details") bad.push(`${w}px: focus on "${open.label}", expected the close button`);
      await p.key("Escape");
      const closed = await p.evaluate(state);
      if (closed.modal) bad.push(`${w}px: Escape did not close the modal`);
      if (closed.overflow === "hidden") bad.push(`${w}px: scroll lock not released`);
      if (!closed.onCard) bad.push(`${w}px: focus did not return to the card`);
    }
    await p.click(".js-project-card");
    if (!(await p.evaluate("!!document.querySelector('.js-project-modal')"))) bad.push("1440px: click did not open the modal");
    await p.clickAt(5, 5);
    if (await p.evaluate("!!document.querySelector('.js-project-modal')")) bad.push("1440px: backdrop click did not close the modal");
    return bad.length ? bad.join("; ") : true;
  },
});

// --- Task 11: footer rows ---
CHECKS.push({
  name: "footerNoOrphans",
  async run(p) {
    const bad = [];
    for (const w of [360, 1440]) {
      await p.open(w, "light");
      const rows = await p.evaluate(
        "(() => { const f = document.querySelector('footer'); const tops = (sel) => new Set([...f.querySelectorAll(sel)].map(e => Math.round(e.getBoundingClientRect().top))).size; return { icons: tops('a[aria-label]'), links: tops('nav a') }; })()"
      );
      if (rows.icons !== 1) bad.push(`${w}px: social icons span ${rows.icons} rows`);
      if (w >= 1024 && rows.links !== 1) bad.push(`${w}px: footer links span ${rows.links} rows`);
    }
    return bad.length ? bad.join("; ") : true;
  },
});

CHECKS.push({
  name: "reducedMotionTypewriterIdle",
  async run(p) {
    await p.open(1024, "light", { reducedMotion: true });
    await sleep(3000);
    const role = await p.evaluate("document.querySelector('#about p > span.font-medium')?.textContent");
    return role === "Full-Stack Developer" || `hero role after 3s with reduced motion: "${role}"`;
  },
});

// --- Chat widget ---
const SAMPLE = "What is Tushar's current role?";
const panelRect = "(() => { const r = document.querySelector('#chat-panel')?.getBoundingClientRect(); return r && [r.left, r.top, r.width, r.height]; })()";
const logText = "document.querySelector('.js-chat-log')?.innerText ?? ''";

CHECKS.push(
  {
    name: "chatLauncherPosition",
    async run(p) {
      const bad = [];
      for (const w of [360, 1440]) {
        await p.open(w, "light");
        const pos = await p.evaluate(
          "(() => { const r = document.querySelector('.js-chat-launcher')?.getBoundingClientRect(); return r && [innerWidth - r.right, innerHeight - r.bottom, getComputedStyle(document.querySelector('.js-chat-launcher')).position]; })()"
        );
        if (!pos) bad.push(`${w}px: no launcher`);
        else if (pos[0] < 0 || pos[0] > 24 || pos[1] < 0 || pos[1] > 24 || pos[2] !== "fixed") bad.push(`${w}px: right gap ${pos[0]}, bottom gap ${pos[1]}, ${pos[2]}`);
      }
      return bad.length ? bad.join("; ") : true;
    },
  },
  {
    name: "chatOpensAndAnswers",
    async run(p) {
      await p.open(1440, "light");
      await p.mockChat();
      await p.click(".js-chat-launcher");
      if (!(await p.evaluate("!!document.querySelector('#chat-panel')"))) return "panel did not open";
      const focused = await p.evaluate("document.activeElement?.id");
      if (focused !== "chat-input") return `focus on "${focused}", not the input`;
      const samples = await p.evaluate("[...document.querySelectorAll('.js-chat-sample')].map(b => b.textContent.trim())");
      if (samples.length !== 5 || samples[0] !== SAMPLE) return `samples: ${JSON.stringify(samples)}`;
      if (await p.evaluate("!!document.querySelector('.js-chat-dot')")) return "unread dot still shown after opening";
      await p.click(".js-chat-sample");
      await sleep(600);
      const log = await p.evaluate(logText);
      if (!log.includes(SAMPLE)) return "sample question not shown as a user message";
      if (!log.includes("Tushar is a Software Engineer at Talendy.")) return `reply missing; log: ${log.slice(-120)}`;
      if (await p.evaluate("document.querySelectorAll('.js-chat-sample').length")) return "samples still shown after first message";
      return true;
    },
  },
  {
    name: "chatFullScreenOnPhone",
    async run(p) {
      await p.open(360, "light");
      await p.click(".js-chat-launcher");
      const r = await p.evaluate(panelRect);
      const [vw, vh] = await p.evaluate("[innerWidth, innerHeight]");
      if (!r) return "panel did not open";
      return (Math.abs(r[0]) <= 1 && Math.abs(r[1]) <= 1 && Math.abs(r[2] - vw) <= 1 && Math.abs(r[3] - vh) <= 1) || `panel ${r.map(Math.round)} vs viewport ${vw}x${vh}`;
    },
  },
  {
    name: "chatEscapeClosesAndRestoresFocus",
    async run(p) {
      await p.open(1440, "light");
      await p.click(".js-chat-launcher");
      await p.key("Escape");
      if (await p.evaluate("!!document.querySelector('#chat-panel')")) return "panel still open after Escape";
      return (await p.evaluate("document.activeElement?.classList.contains('js-chat-launcher')")) || "focus did not return to the launcher";
    },
  },
  {
    name: "chatSingleRequestWhilePending",
    async run(p) {
      await p.open(1440, "light");
      const counter = await p.mockChat({ delayMs: 1000 });
      await p.click(".js-chat-launcher");
      await p.type("What is his tech stack?");
      await p.key("Enter");
      await p.key("Enter");
      await p.evaluate("document.querySelector('.js-chat-send')?.click()");
      await sleep(1500);
      return counter.requests === 1 || `${counter.requests} requests sent`;
    },
  },
  {
    name: "chatLongWordWraps",
    async run(p) {
      await p.open(360, "light");
      await p.mockChat({ reply: "a".repeat(300) });
      await p.click(".js-chat-launcher");
      await p.type("b".repeat(300));
      await p.key("Enter");
      await sleep(600);
      const [sw, iw, worst] = await p.evaluate(
        "[document.documentElement.scrollWidth, innerWidth, Math.max(0, ...[...document.querySelectorAll('.js-chat-log > *')].map(e => e.scrollWidth - e.clientWidth))]"
      );
      if (sw > iw) return `page scrollWidth ${sw} > ${iw}`;
      return worst <= 1 || `a message overflows its bubble by ${worst}px`;
    },
  },
  {
    name: "chatPanelNoOverflow",
    async run(p) {
      const bad = [];
      for (const w of [360, 1440])
        for (const s of SCHEMES) {
          await p.open(w, s);
          await p.click(".js-chat-launcher");
          const [sw, iw] = await p.evaluate("[document.documentElement.scrollWidth, innerWidth]");
          if (sw > iw) bad.push(`${w}px ${s}: scrollWidth ${sw} > ${iw}`);
          if (SHOT_DIR) {
            const { data } = await p.send("Page.captureScreenshot", { format: "png" });
            writeFileSync(join(SHOT_DIR, `chat-open-${w}-${s}.png`), Buffer.from(data, "base64"));
          }
        }
      return bad.length ? bad.join("; ") : true;
    },
  }
);

const failures = [];
try {
  const ws = new WebSocket(await pageSocket());
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", rej, { once: true });
  });
  const page = new Page(ws);
  await page.send("Page.enable");
  for (const c of CHECKS) {
    let r;
    try {
      r = await c.run(page);
    } catch (err) {
      r = `threw: ${err.message}`;
    }
    console.log(`${r === true ? "PASS" : "FAIL"} ${c.name}${r === true ? "" : " — " + r}`);
    if (r !== true) failures.push(c.name);
  }
  ws.close();
} finally {
  edge.kill();
  if (server) await new Promise((r) => server.httpServer.close(r));
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* Edge may still hold files */
  }
}
console.log(failures.length ? `\n${failures.length} of ${CHECKS.length} checks failed` : `\nPASS ${CHECKS.length} checks`);
process.exit(failures.length ? 1 : 0);
