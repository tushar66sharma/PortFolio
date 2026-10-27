# Blueprint Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the portfolio as an engineering drawing ("Blueprint"), with light/dark themes, a REFERENCES profile-links row, and fully responsive layouts, without changing any content.

**Architecture:** Theme colours live as CSS custom properties on `<html data-theme>` and are mapped into Tailwind v4 utilities (`bg-paper`, `text-ink`, `border-line`, …) via `@theme inline`. A handful of repeated drawing devices (sheet frame, rev triangle, callout circle, table rows, chips, buttons) are component classes in `@layer components`; everything else stays inline Tailwind, matching the existing code style. Each section component is rewritten in place and keeps reading `src/constants.js` untouched.

**Tech Stack:** React 19.1, Vite 6.3, Tailwind CSS 4.1 (`@tailwindcss/vite`), react-icons 5.5, @emailjs/browser, react-toastify. Checks run on Node 24 (built-in `WebSocket`/`fetch`) and headless Microsoft Edge, with no new npm dependencies.

**Spec:** `docs/superpowers/specs/2026-10-27-blueprint-redesign-design.md`

All paths below are relative to `myPortFolio/` (the git root is its parent folder `PortFolio/`; run every command from `myPortFolio/`).

## Global Constraints

- `src/constants.js` is never modified. `git diff --exit-code -- src/constants.js` must pass before every commit.
- Preserved verbatim: About paragraph, the four typed role words, resume URL, all profile URLs, Instagram URL, EmailJS IDs (`service_f7oaimq`, `template_6g9gonj`, `oJY8R8h4jJnI9xdch`) and form field names (`user_email`, `user_name`, `subject`, `message`), every section intro sentence.
- Render constants data as given: array order, duplicates (keys use the index), and the original strings (e.g. `" Rent Connect "` may be trimmed only for display).
- `package.json` / `package-lock.json` / `tailwind.config.js` / `eslint.config.js` are not modified.
- **Never `git push`.** Stage only files the task names (the working tree has CRLF-only phantom changes in `eslint.config.js`, `index.html`, `package*.json`, `src/App.jsx`, `tailwind.config.js`; never `git add -A` or `git add .`).
- Commit messages: conventional commits (`feat(scope): …`, `test: …`, `fix: …`, `docs: …`), a body that says what and why, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Tokens (exact):
  - light: `--bp-paper:#edf2f8; --bp-panel:#f7faff; --bp-ink:#0f2b55; --bp-muted:#4b6690; --bp-line:#1d4f9c; --bp-accent:#c2410c; --bp-grid:rgba(24,74,150,.07); --bp-grid-major:rgba(24,74,150,.15)`
  - dark: `--bp-paper:#0a2a55; --bp-panel:#0c3166; --bp-ink:#eef5ff; --bp-muted:#9fbce4; --bp-line:#cfe1ff; --bp-accent:#ffb35c; --bp-grid:rgba(205,225,255,.055); --bp-grid-major:rgba(205,225,255,.12)`
- Fonts: Barlow Condensed 500/700 (`--font-display`, fallback `"Arial Narrow", sans-serif`) and IBM Plex Mono 400/500/600 (`--font-mono`, fallback `ui-monospace, Consolas, monospace`). Poppins removed.
- Breakpoints: Tailwind defaults (sm 640, md 768, lg 1024, xl 1280). Content max width `max-w-[1160px]`; side gutter `max(16px, env(safe-area-inset-*))`.
- Drawing number `TS-066`. Footer copy: `© 2026 Tushar Sharma. All rights reserved.` and `DO NOT SCALE DRAWING`.
- `prefers-reduced-motion: reduce` disables typing, transitions and smooth scroll.

## Review Focus

1. **Very long unbroken strings at 320px** (the Vendor/Driver project title, `Talendy Holdings (Tech Japan Labs)`, LinkedIn handle) should wrap or truncate inside their cell, never widen the page. Pinned by the layout check at 320px (Task 3, re-run in every later task).
2. **A stored theme choice overriding a dark OS** should load light with no flash, and the reverse. Pinned by `storedPreferenceWins` (Task 2).
3. **Keyboard-only use of project cards and the modal**: Enter opens the modal, Escape closes it, and focus returns to the card. Pinned by `projectModal` (Task 8).
4. **The mobile menu at 360px** should open, show all six links, and close after a link is tapped without leaving the page scroll-locked. Pinned by `mobileMenu` (Task 4).
5. **No-JS / first paint**: the hero shows a role word immediately (the typewriter starts fully typed), and all content is in the server-rendered HTML. Pinned by the content audit (Task 5).

---

### Task 1: Content audit harness (characterization test)

Locks in "no content lost" before any visual change.

**Files:**
- Create: `scripts/audit/entry-server.jsx`
- Create: `scripts/audit/render-audit.mjs`

**Interfaces:**
- Produces: `node scripts/audit/render-audit.mjs` builds an SSR bundle of `<App/>` with Vite's JS API, renders it with `renderToString`, and runs every check in its `CHECKS` array. It prints `PASS <n> checks`, or each failing check and exits 1. Later tasks append entries to `CHECKS` (shape: `{ name: string, test: (html: string, src: (path) => string) => boolean | string }`; return `true` for pass, or a string describing the failure).
- `entry-server.jsx` exports `render(): string` = `renderToString(<App />)`.

- [ ] **Step 1: Write `entry-server.jsx`**: imports `../../src/App.jsx` and `react-dom/server`; exports `render`.
- [ ] **Step 2: Write `render-audit.mjs`**
  - Build: `build({ configFile: 'vite.config.js', logLevel: 'error', build: { ssr: 'scripts/audit/entry-server.jsx', outDir: <os tmpdir>/portfolio-audit, emptyOutDir: true, rollupOptions: { output: { format: 'es' } } }, ssr: { noExternal: true } })`. Then dynamic-import the output with a `?t=Date.now()` query (as a `file://` URL).
  - Normalise the HTML: remove `<!-- -->`, decode `&amp; &lt; &gt; &quot; &#x27; &#39;`, collapse whitespace. Normalise expected strings the same way.
  - `src(path)` reads a repo file as text (for static checks on component source).
  - Import `src/constants.js` data **through the same SSR bundle**: re-export `SkillsInfo, experiences, education, projects` from `entry-server.jsx`, so image imports resolve.
  - Initial `CHECKS` (generated from the data, one check per field):
    - every `SkillsInfo[].title` and every `skills[].name`
    - every experience `role`, `company`, `date`, `desc`, every `skills[]` entry
    - every education `school`, `date`, `grade`, `desc`, `degree`
    - every project `title.trim()`, `description`, every `tags[].trim()`, `github`, `webapp` (as `href="…"`, with `&` encoded)
    - About paragraph starting `I’m Tushar Sharma, a Software Engineer with experience building production-ready` (full sentence copied from current `About.jsx`)
    - resume URL `https://drive.google.com/file/d/1UCyThGN3WtYYY_5FgnzhLwHWx7Pyq8ED/view?usp=drive_link`
    - the 5 profile URLs + Instagram URL (copied from current `Navbar.jsx` / `Footer.jsx`)
    - `name="user_email"`, `name="user_name"`, `name="subject"`, `name="message"`
    - static: `src('src/components/Contact/Contact.jsx')` contains the three EmailJS IDs
    - static: `src('src/components/About/About.jsx')` contains `Full-Stack Developer`, `App Developer`, `Competitive Programmer`, `Open-Source Contributor`
- [ ] **Step 3: Run against the current site**

  Run: `node scripts/audit/render-audit.mjs`
  Expected: `PASS` (≈150 checks). This is a characterization test, so it must pass on the old design. If a check fails because the old site never rendered that field, fix the check, not the site.
- [ ] **Step 4: Prove it catches loss**: temporarily delete `{exp.desc}` in `Experience.jsx`, run, expect FAIL naming the four descriptions; restore with `git checkout -- src/components/Experience/Experience.jsx`.
- [ ] **Step 5: Commit**: `git add scripts/audit/entry-server.jsx scripts/audit/render-audit.mjs` → `test: add SSR content audit to guard portfolio content`

---

### Task 2: Theme foundation (tokens, fonts, theme switching, contrast + theme checks)

**Files:**
- Modify: `index.html`
- Modify: `src/index.css` (full rewrite)
- Create: `src/hooks/useTheme.js`
- Create: `scripts/audit/contrast.mjs`
- Create: `scripts/audit/layout-check.mjs`

**Interfaces:**
- Produces: CSS tokens + Tailwind utilities `paper | panel | ink | muted | line | accent` (as `bg-*`, `text-*`, `border-*`, `outline-*`, `decoration-*`), `font-display`, `font-mono`; `dark:` variant bound to `[data-theme=dark]`.
- Produces: `useTheme(): { theme: 'light' | 'dark', toggle: () => void }`. Storage key `"theme"`. SSR-safe (no `window`/`document` access during render; initial value read from `document.documentElement.dataset.theme` inside a lazy `useState` initializer guarded by `typeof document !== 'undefined'`, default `'light'`).
- Produces: `node scripts/audit/layout-check.mjs [baseUrl]` (default `http://localhost:4173`). It launches Edge headless (`EDGE_PATH` env, default `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`) with `--headless=new --remote-debugging-port=9223 --user-data-dir=<tmp>` and drives it over CDP with Node's `WebSocket`. Helpers: `open(width, scheme, {storage})`, `evaluate(expr)`, `click(selector)`, `key(name)`, `screenshot(file)`. Exports nothing; runs a `CHECKS` list of async functions `(page) => true | string`, prints PASS/FAIL, exits 1 on any failure. Screenshots go to `$SHOT_DIR` when set (`Page.captureScreenshot` with `captureBeyondViewport: true`).
  - Scheme emulation: `Emulation.setEmulatedMedia({ features: [{ name: 'prefers-color-scheme', value }] })` **before** `Page.navigate`. Storage seeding: `Page.addScriptToEvaluateOnNewDocument`.
- Preconditions for layout-check: `npm run build` then `npx vite preview --port 4173 --strictPort` running in the background.

- [ ] **Step 1: Write `contrast.mjs`**: parses `src/index.css`, takes the `--bp-*` values from the `:root` block and the `:root[data-theme="dark"]` block, computes WCAG contrast. Asserts, per theme: `ink` on `paper` ≥ 7, `ink` on `panel` ≥ 7, `muted` on `paper` ≥ 4.5, `muted` on `panel` ≥ 4.5, `accent` on `paper` ≥ 4.5, `paper` on `line` ≥ 4.5 (primary button text).
- [ ] **Step 2: Run it**: `node scripts/audit/contrast.mjs` → FAIL (tokens don't exist yet).
- [ ] **Step 3: Write `layout-check.mjs`** with these initial checks:
  - `themeFollowsSystem`: for scheme light and dark at 1024px, `document.documentElement.dataset.theme === scheme`.
  - `storedPreferenceWins`: dark scheme + storage `theme=light` → `dataset.theme === 'light'`; light scheme + `theme=dark` → `'dark'`. Also `getComputedStyle(document.body).backgroundColor` equals `rgb(237, 242, 248)` (light) / `rgb(10, 42, 85)` (dark).
  - `noHorizontalOverflow`: for widths `[320, 360, 768, 1024, 1440]` × `['light','dark']`: `document.documentElement.scrollWidth <= window.innerWidth`; screenshot `w{width}-{scheme}.png`.
- [ ] **Step 4: Rewrite `src/index.css`**
  - `@import "tailwindcss";` then `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`
  - `:root { …light tokens…; color-scheme: light }`, `:root[data-theme="dark"] { …dark tokens…; color-scheme: dark }`
  - `@theme inline { --color-paper: var(--bp-paper); … --color-accent: var(--bp-accent); --font-display: …; --font-mono: …; }`
  - Base: `html { scroll-behavior: smooth }` (inside `@media (prefers-reduced-motion: no-preference)`); `body` = `bg-paper text-ink font-mono`, 14px/1.6, with the drafting grid as background-image (major 100px + minor 20px lines from `--bp-grid-major` / `--bp-grid`); `section[id] { scroll-margin-top: 84px }`; `::selection` accent; `:focus-visible { outline: 2px solid var(--bp-accent); outline-offset: 2px }`; reduced-motion block killing animations/transitions.
  - `@layer components`: `.bp-sheet` (2px `line` border + 1px outline, offset 5px, 3px below `sm`), `.bp-label` (10.5px, `letter-spacing:.14em`, uppercase, muted), `.bp-tag` (accent text + 1px accent border, 11px, px-2), `.bp-btn` (line bg, paper text, uppercase 12px, `tracking-[.12em]`, py-2.5 px-4.5, min-h-10) and `.bp-btn-ghost` (transparent, ink text), `.bp-chip` (1px dashed `line`, 11.5–12.5px, px-2 py-0.5), `.bp-tri` (30×26 clip-path triangle, accent bg, paper text), `.bp-callout` (30px circle, 1.5px accent border, accent text), `.bp-dim` (flex row; `i` children are 1px accent lines).
  - Remove the Poppins `@import` and the `* { font-family }` rule; drop `.clip-path-custom` (unused).
- [ ] **Step 5: Update `index.html`**: keep existing tags; add `<meta name="description" content="Tushar Sharma — Software Engineer. Backend systems, full-stack web apps and AI-powered tools.">`, `<meta name="theme-color" content="#edf2f8">`, Google Fonts preconnects + one stylesheet link (`Barlow+Condensed:wght@500;700` and `IBM+Plex+Mono:wght@400;500;600`, `display=swap`), and an inline `<script>` before any stylesheet that sets `data-theme` from `localStorage.theme` (`'light'|'dark'`) or else `matchMedia('(prefers-color-scheme: dark)')`, and sets the theme-color meta to `#0a2a55` for dark. Wrap it in try/catch with `'light'` as the fallback.
- [ ] **Step 6: Implement `useTheme`**: `toggle` flips the theme, writes `data-theme`, theme-color meta and `localStorage.theme` (try/catch). An effect subscribes to `matchMedia` changes and applies them only while no stored choice exists.
- [ ] **Step 7: Run checks**
  - `node scripts/audit/contrast.mjs` → PASS
  - `node scripts/audit/render-audit.mjs` → PASS
  - `npm run build` → succeeds; then start preview in the background; `node scripts/audit/layout-check.mjs` → `themeFollowsSystem` and `storedPreferenceWins` PASS. (`noHorizontalOverflow` may already pass; the old components are not the target yet.)
  - `git diff --exit-code -- src/constants.js` → no output
- [ ] **Step 8: Commit**: `git add index.html src/index.css src/hooks/useTheme.js scripts/audit/contrast.mjs scripts/audit/layout-check.mjs` → `feat(theme): add blueprint design tokens, fonts and light/dark switching`

---

### Task 3: Site data, sheet layout, REFERENCES row, footer

**Files:**
- Create: `src/site.js`, `src/drawing.js`
- Create: `src/components/ui/SectionHeader.jsx`
- Create: `src/components/References/References.jsx`
- Modify: `src/App.jsx` (full rewrite)
- Modify: `src/components/Footer/Footer.jsx` (full rewrite)
- Delete: `src/BlurBlob.jsx`
- Modify: `scripts/audit/render-audit.mjs` (append checks)

**Interfaces:**
- `src/site.js` exports:
  - `DRAWING_NO = 'TS-066'`
  - `RESUME_URL` (the existing Drive URL)
  - `sections: { id: string, label: string }[]` = about/About, skills/Skills, experience/Experience, work/Projects, education/Education, contact/Contact
  - `profiles: { id, code, platform, handle, url, Icon }[]` in this order: github/GH/GitHub/`tushar66sharma`/FaGithub, linkedin/IN/LinkedIn/`tushar-sharma`/FaLinkedin, leetcode/LC/LeetCode/`DynamicCoder_66`/SiLeetcode, codeforces/CF/Codeforces/`DynamicCoder_66`/SiCodeforces, codechef/CC/CodeChef/`dynamiccoder66`/SiCodechef (URLs copied from current `Navbar.jsx`)
  - `instagram: { platform: 'Instagram', url, Icon: FaInstagram }` (URL from current `Footer.jsx`)
- `src/drawing.js` exports pure helpers:
  - `getCounts(): { roles: number, projects: number, skills: number }` from constants (`skills` = sum of `SkillsInfo[i].skills.length` → 36)
  - `revLetter(index: number, total: number): string` → `String.fromCharCode(65 + total - 1 - index)`
  - `detailLetter(index: number): string` → `String.fromCharCode(65 + index)`
- `SectionHeader({ tag: string, title: string, note?: string, intro?: string })` renders the `.bp-tag`, `h2` (font-display, uppercase, 28–34px), muted `note` inline, then `intro` paragraph (muted, max-w-[70ch]).
- `References()` renders `<nav aria-label="Profiles">` per spec 6.2.
- `App` layout: `<Navbar/>` (unchanged import for now), then `<main className="mx-auto max-w-[1160px] px-[max(16px,env(safe-area-inset-left))] pt-20 pb-10">` (right padding uses `env(safe-area-inset-right)`) containing `<div className="bp-sheet">` → zone row (6 cells A–F, `aria-hidden`) → `<References/>` → About, Skills, Experience, Work, Education, Contact → `<Footer/>`. Each section's outer element gets a 2px top `border-line` (except About).
- Footer: links are `<a href="#{id}">` for `sections` (5 of them, excluding contact is fine; include all 6), profile + Instagram icon links with `aria-label`s, copy per Global Constraints.

- [ ] **Step 1: Append failing audit checks**: `REFERENCES`; each profile handle and `REF-0{n}`; `DO NOT SCALE DRAWING`; `© 2026 Tushar Sharma. All rights reserved.`; `href="#work"` present and `href="#projects"` absent; zone letters `A`–`F` (check for an element with `data-zone` attributes, 6 of them). Plus a drawing-helper unit check: import `src/drawing.js` via the SSR bundle (re-export from `entry-server.jsx`) and assert `revLetter(0,4)==='D'`, `revLetter(3,4)==='A'`, `detailLetter(6)==='G'`, `getCounts()` deep-equals `{roles:4, projects:7, skills:36}`.
- [ ] **Step 2: Run** `node scripts/audit/render-audit.mjs` → FAIL on exactly the new checks.
- [ ] **Step 3: Implement** `site.js`, `drawing.js`, `SectionHeader`, `References`, `App`, `Footer`; delete `BlurBlob.jsx`.
  - References responsive grid: `grid lg:grid-cols-[auto_minmax(0,1fr)]`; list `grid grid-cols-2 lg:grid-cols-5`; the 5th item gets `col-span-2 lg:col-span-1`; cells `min-w-0`, handle `truncate`; dividers use `border-line`; hover `bg-paper` + accent handle. Icon 16px beside the code badge.
- [ ] **Step 4: Run checks**: render-audit PASS; build; restart preview; layout-check PASS (all three checks); contrast PASS; constants diff clean.
- [ ] **Step 5: Commit**: `git add src/site.js src/drawing.js src/components/ui/SectionHeader.jsx src/components/References/References.jsx src/App.jsx src/components/Footer/Footer.jsx scripts/audit/render-audit.mjs scripts/audit/entry-server.jsx` and `git rm src/BlurBlob.jsx` → `feat(layout): add drawing sheet frame, REFERENCES profile row and blueprint footer`

---

### Task 4: Navbar with theme toggle, active section and mobile menu

**Files:**
- Create: `src/components/ui/ThemeToggle.jsx`
- Modify: `src/components/Navbar/Navbar.jsx` (full rewrite)
- Modify: `scripts/audit/render-audit.mjs`, `scripts/audit/layout-check.mjs` (append checks)

**Interfaces:**
- Consumes: `useTheme()` (Task 2), `sections`, `DRAWING_NO` (Task 3).
- `ThemeToggle()`: 40px circular button, `border-line`, shows `FiMoon` in light / `FiSun` in dark, `aria-label="Switch to dark theme"` / `"Switch to light theme"`, `aria-pressed={theme === 'dark'}`, class `js-theme-toggle`.
- Navbar per spec 6.1. Active section: one `IntersectionObserver` on `section[id]` with `rootMargin: '-45% 0px -50% 0px'`; the active link gets `text-accent` and `aria-current="true"`. Links are `<a href="#{id}">`; the desktop list has class `js-desktop-links` (`hidden md:flex`). Mobile menu button `aria-expanded`, `aria-controls="mobile-menu"`, class `js-menu`. Panel `id="mobile-menu"`, closes on link click, Escape and outside pointerdown.

- [ ] **Step 1: Append failing checks**
  - render-audit: `TS-066` inside the nav; six `href="#…"` nav links; `aria-label="Switch to dark theme"`.
  - layout-check `themeToggle`: at 1024 light, click `.js-theme-toggle` → `dataset.theme==='dark'` and `localStorage.theme==='dark'`; click again → `'light'`.
  - layout-check `mobileMenu`: at 360, the desktop link list (`.js-desktop-links`) is not visible and `#mobile-menu` is absent; click `.js-menu` → `#mobile-menu` visible with 6 links; click the "Projects" link → menu hidden, `document.body.style.overflow` not `hidden`, `scrollY > 0`.
- [ ] **Step 2: Run** both scripts → FAIL on the new checks only.
- [ ] **Step 3: Implement** `ThemeToggle` and `Navbar` (fixed, `top-[env(safe-area-inset-top)]`, gutters as App, inner `max-w-[1160px]`; transparent → `bg-paper/85 backdrop-blur border-b border-line` after `scrollY > 50`).
- [ ] **Step 4: Run all checks** (render-audit, build + preview, layout-check, contrast, constants diff) → PASS.
- [ ] **Step 5: Commit**: `git add src/components/ui/ThemeToggle.jsx src/components/Navbar/Navbar.jsx scripts/audit/render-audit.mjs scripts/audit/layout-check.mjs` → `feat(navbar): blueprint navbar with theme toggle, active section and mobile menu`

---

### Task 5: About hero: title block, dimension line, typewriter, photo frame

**Files:**
- Modify: `src/components/About/About.jsx` (full rewrite)
- Modify: `scripts/audit/render-audit.mjs`

**Interfaces:**
- Consumes: `getCounts`, `revLetter` (Task 3), `DRAWING_NO`, `RESUME_URL`; constants `experiences`, `education`.
- `ROLE_WORDS` module-level array (the four existing words, same order). Typewriter state starts at `text = ROLE_WORDS[0]`, `isDeleting = false`, and waits 1000ms before deleting. Speeds stay as today (150ms type / 50ms delete / 1000ms hold). Under reduced motion the effect never starts.
- Title block cells (label → value): TITLE → `SOFTWARE ENGINEER`; CURRENT ASSIGNMENT → `experiences[0].company`; DRAWN BY → `T. SHARMA`; DWG NO. → `TS-066`; CERT. → `B.Tech CSE · ${education[0].grade}`; SCALE → `1 : 1`; REV / SHEET → `${revLetter(0, experiences.length)} · 1 OF 1`.

- [ ] **Step 1: Append failing checks**: `GENERAL ARRANGEMENT`; `Full-Stack Developer` present in rendered HTML (first word typed); dimension text `4 ROLES · 7 PROJECTS · 36 SKILLS`; `Talendy Holdings (Tech Japan Labs)` inside the element with `aria-label="Title block"`; `B.Tech CSE · 8.4 CPI`; `D · 1 OF 1`; `FRONT ELEVATION`; exactly one `<h1`; `alt="Tushar Sharma"`; `Download CV`.
- [ ] **Step 2: Run** render-audit → FAIL on the new checks.
- [ ] **Step 3: Implement** per spec 6.3. Layout `grid gap-9 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] p-5 sm:p-8`. Name `font-display font-bold uppercase leading-[.88] text-[clamp(56px,10vw,124px)]`. Photo frame: square, `max-w-[320px]` centred on mobile, 1.5px `border-line`, `bg-panel`, 4 corner tick marks + centre crosshair lines (absolutely positioned spans, `aria-hidden`), label `FRONT ELEVATION · SCALE 1:1`. Image `object-cover`, `fetchpriority="high"`. Buttons: `.bp-btn` → resume (new tab), `.bp-btn-ghost` → `#contact`.
- [ ] **Step 4: Run all checks** → PASS (including no overflow at 320px with the 124px name clamp).
- [ ] **Step 5: Commit**: `git add src/components/About/About.jsx scripts/audit/render-audit.mjs` → `feat(about): blueprint hero with title block, dimension line and photo elevation`

---

### Task 6: Skills as a parts list

**Files:**
- Modify: `src/components/Skills/Skills.jsx` (full rewrite)
- Modify: `scripts/audit/render-audit.mjs`

**Interfaces:**
- Consumes: `SectionHeader` (Task 3); constants `SkillsInfo`.
- Header: tag `SECTION B–B`, title `SKILLS`, note `bill of materials by assembly`, intro = existing sentence (`A collection of my technical skills and expertise honed through various projects and experiences`).
- Table rows: `ITEM` = 2-digit index, `ASSEMBLY` = title uppercase, `COMPONENTS` = chips (logo 20px with `alt="{name} logo"`, `loading="lazy"`, plus the name), `QTY` = `skills.length`. Desktop grid `grid-cols-[64px_170px_minmax(0,1fr)_60px]`; below `md`, `grid-cols-[52px_minmax(0,1fr)]` with components and QTY spanning full width.

- [ ] **Step 1: Append failing checks**: `SECTION B–B`, `bill of materials by assembly`, the intro sentence, `ASSEMBLY` header, each `alt="{name} logo"` (36 skill entries), QTY values `12`, `8`, `7`, `9` inside elements with `data-qty`.
- [ ] **Step 2: Run** → FAIL on the new checks.
- [ ] **Step 3: Implement**; drop `react-parallax-tilt` usage.
- [ ] **Step 4: Run all checks** → PASS.
- [ ] **Step 5: Commit**: `git add src/components/Skills/Skills.jsx scripts/audit/render-audit.mjs` → `feat(skills): render skills as a blueprint parts list`

---

### Task 7: Experience as a revision history

**Files:**
- Modify: `src/components/Experience/Experience.jsx` (full rewrite)
- Modify: `scripts/audit/render-audit.mjs`

**Interfaces:**
- Consumes: `SectionHeader`, `revLetter`; constants `experiences`.
- Header: tag `REV. HISTORY`, title `EXPERIENCE`, note `latest revision first`, intro = existing sentence.
- Row: `.bp-tri` with `revLetter(i, experiences.length)`; date; description cell = logo (40px white tile, `alt={company}`, lazy) + role (h3) + company + desc + `SPEC:` label and one `.bp-chip` per `skills` entry (key = index; each chip has `data-spec`).

- [ ] **Step 1: Append failing checks**: `REV. HISTORY`; rev letters appear in order `D`,`C`,`B`,`A` (regex over `data-rev="X"` attributes); count of `data-spec` attributes = sum of `experiences[i].skills.length` (duplicates included); intro sentence.
- [ ] **Step 2: Run** → FAIL on the new checks.
- [ ] **Step 3: Implement** per spec 6.5 (desktop `grid-cols-[64px_170px_minmax(0,1fr)]`; below `md` REV + date share a row).
- [ ] **Step 4: Run all checks** → PASS.
- [ ] **Step 5: Commit**: `git add src/components/Experience/Experience.jsx scripts/audit/render-audit.mjs` → `feat(experience): render experience as a drawing revision history`

---

### Task 8: Projects as detail views with an accessible modal

**Files:**
- Modify: `src/components/Work/Work.jsx` (full rewrite)
- Modify: `scripts/audit/render-audit.mjs`, `scripts/audit/layout-check.mjs`

**Interfaces:**
- Consumes: `SectionHeader`, `detailLetter`; constants `projects`.
- Header: tag `DETAIL VIEWS`, title `PROJECTS`, note `scale 2 : 1`, intro = existing sentence.
- Card: `<article>` with `role="button"`, `tabIndex={0}`, `aria-haspopup="dialog"`, class `js-project-card`; opens on click or Enter/Space. Callout `DETAIL {letter}`; image `aspect-video object-cover`, lazy; title (display font); description `line-clamp-3`; tag chips; links `Source ↗` (github) / `Live ↗` (webapp) with `onClick={e => e.stopPropagation()}`.
- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, class `js-project-modal`. Body `overflow:hidden` while open (restored on close). Focus goes to the close button (`aria-label="Close project details"`) on open and back to the opening card on close. Closes on Escape, backdrop click and ×. Full screen below `sm`, `max-w-3xl max-h-[90vh]` above; content scrolls inside. Buttons `View Code` / `View Live`.

- [ ] **Step 1: Append failing checks**
  - render-audit: `DETAIL VIEWS`; `DETAIL A` … `DETAIL G`; `Source ↗` count 7; intro sentence.
  - layout-check `projectModal` at 360 and 1440: focus first `.js-project-card`, press Enter → `.js-project-modal` exists, `document.body.style.overflow==='hidden'`, `document.activeElement.getAttribute('aria-label')==='Close project details'`; press Escape → modal gone, overflow restored, `document.activeElement.classList.contains('js-project-card')`. Click a card, then click the backdrop (CDP mouse event at viewport (5,5) on desktop) → modal gone.
- [ ] **Step 2: Run** → FAIL on the new checks.
- [ ] **Step 3: Implement** per spec 6.6 (grid `md:grid-cols-2 xl:grid-cols-3 gap-5`).
- [ ] **Step 4: Run all checks** → PASS.
- [ ] **Step 5: Commit**: `git add src/components/Work/Work.jsx scripts/audit/render-audit.mjs scripts/audit/layout-check.mjs` → `feat(projects): blueprint detail views with keyboard-accessible modal`

---

### Task 9: Education as a certification record

**Files:**
- Modify: `src/components/Education/Education.jsx` (full rewrite)
- Modify: `scripts/audit/render-audit.mjs`

**Interfaces:**
- Consumes: `SectionHeader`; constants `education`.
- Header: tag `CERT. RECORD`, title `EDUCATION`, note `qualifications on file`, intro = existing sentence.
- Columns `NO. | QUALIFICATION | PERIOD | GRADE` (`grid-cols-[52px_minmax(0,1fr)_170px_100px]`); the qualification cell holds logo + degree (h3) + school + desc. Below `md`: NO. + period on one row, the qualification cell, then grade with a `GRADE` label.

- [ ] **Step 1: Append failing checks**: `CERT. RECORD`, `QUALIFICATION`, intro sentence, each grade inside `data-grade`.
- [ ] **Step 2: Run** → FAIL on the new checks.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run all checks** → PASS.
- [ ] **Step 5: Commit**: `git add src/components/Education/Education.jsx scripts/audit/render-audit.mjs` → `feat(education): render education as a certification record`

---

### Task 10: Contact as a transmittal form

**Files:**
- Modify: `src/components/Contact/Contact.jsx` (restyle; EmailJS logic kept)
- Modify: `scripts/audit/render-audit.mjs`

**Interfaces:**
- Consumes: `SectionHeader`, `profiles`; constants none.
- Header: tag `TRANSMITTAL`, title `CONTACT`, intro = existing sentence (`I’d love to hear from you—reach out for any opportunities or questions!`).
- Layout `lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-8`. Left: the note "Send a transmittal and I'll reply by email." plus the profile list (icon + platform + handle). Right: form panel (`bg-panel border-[1.5px] border-line`) with a header row `TRANSMITTAL NO. TS-066-T` and `<label for>`-linked fields: `FROM` (`type="email" name="user_email"`), `NAME` (`user_name`), `SUBJECT` (`subject`), `MESSAGE` (`textarea name="message" rows=5`). All `required`, square, `border-line`, `bg-paper`, accent focus ring. Every input has a stable `id`.
- State: replace `isSent` with `const [sending, setSending] = useState(false)`. The button shows `SENDING…` and is disabled while sending, otherwise `SEND TRANSMITTAL`. Toast messages unchanged; toast `theme` = `document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'` read at call time. Keep `<ToastContainer />`.

- [ ] **Step 1: Append failing checks**: `TRANSMITTAL NO. TS-066-T`, `SEND TRANSMITTAL`, `for="contact-email"`-style label/input pairs for all four fields, intro sentence.
- [ ] **Step 2: Run** → FAIL on the new checks.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run all checks** + `npm run lint` → **0 errors, 0 warnings** (the old `isSent` error and About hook warning are gone).
- [ ] **Step 5: Commit**: `git add src/components/Contact/Contact.jsx scripts/audit/render-audit.mjs` → `feat(contact): restyle contact form as a blueprint transmittal`

---

### Task 11: Full verification pass and polish

**Files:**
- Modify: only files where a defect is found (commit as `fix(scope): …`)

- [ ] **Step 1:** `git diff --exit-code -- src/constants.js` → no output; `git log --oneline` shows no change to it.
- [ ] **Step 2:** `npm run lint` → 0 problems; `npm run build` → succeeds.
- [ ] **Step 3:** `node scripts/audit/render-audit.mjs` and `node scripts/audit/contrast.mjs` → PASS.
- [ ] **Step 4:** Start preview; `SHOT_DIR=<scratchpad>/shots node scripts/audit/layout-check.mjs` → all checks PASS; 10 screenshots written.
- [ ] **Step 5:** Review every screenshot for: clipped text, misaligned table columns, lone orphan cards in grids, unreadable text in either theme, sheet frame touching the screen edge, navbar covering section headings. Fix each defect, re-run Steps 2–4, then commit fixes individually.
- [ ] **Step 6:** Reduced motion: layout-check run with `Emulation.setEmulatedMedia({ features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })` at 1024 → hero text equals `Full-Stack Developer` after 3s (typewriter idle).
- [ ] **Step 7:** Hand over to Tushar: summary of commits (`git log --oneline <spec-commit>..HEAD`), the screenshots path, and `npm run dev` for his own review. **Do not push.**
