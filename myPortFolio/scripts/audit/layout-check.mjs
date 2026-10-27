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
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
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
    for (const type of ["keyDown", "keyUp"]) await this.send("Input.dispatchKeyEvent", { type, key: name, code: name === " " ? "Space" : name, windowsVirtualKeyCode: codes[name] });
    await sleep(250);
  }
  async screenshot(file) {
    if (!SHOT_DIR) return;
    mkdirSync(SHOT_DIR, { recursive: true });
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
