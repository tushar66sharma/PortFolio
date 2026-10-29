# Blueprint Redesign — Design

**Date:** 2026-10-27
**Status:** Approved direction (Blueprint, mock "A" + references row), awaiting plan approval

## 1. Intent

Replace the current dark-navy "glow" theme with a technical, scientific look:
the portfolio presented as an **engineering drawing**. Drafting grid, a sheet
frame with zone markers, a title block, a parts list for skills, a revision
history for experience, detail views for projects. It must look good and work
well at every screen size, in both light and dark themes.

This is phase 1 of 2. Phase 2 (separate spec) adds the AI chatbot ("RFI desk")
that answers questions about Tushar from the same portfolio data.

## 2. Goals

1. Re-skin every section in the Blueprint language shown in the approved mock.
2. Light theme ("drafting film") and dark theme ("cyanotype blueprint"), with a
   toggle. First visit follows the OS setting; an explicit choice is remembered.
   No flash of the wrong theme on load.
3. Fully responsive from 320px phones to wide desktops, with no horizontal page scroll.
4. Profile links (GitHub, LinkedIn, LeetCode, Codeforces, CodeChef) shown at the
   top of the page as the **REFERENCES** row under the zone markers.
5. Keep every piece of existing content.

## 3. Hard constraints (from Tushar)

- **`src/constants.js` is not modified at all**: no edits to text, order, arrays,
  imports or structure. Components render its data exactly as given (including
  duplicates such as `"Python"` appearing twice in a skills list, the
  `"August 2022 - Present"` date, and array order).
- Content that currently lives inside components is preserved verbatim:
  About paragraph, typed role words, "Download CV" resume link, profile URLs,
  Instagram link, EmailJS service/template/public key and form fields,
  section intro sentences.
- **Nothing is pushed to GitHub.** Work is committed locally only; Tushar pushes.
- Every commit gets a clear conventional-commit message (repo already uses
  `feat:` style).

## 4. Non-goals

- The chatbot, its API route, and the data refactor it needs (phase 2).
  Phase 1 ships **no** chat UI, because a non-working chat on the live site is worse
  than none. *(My call.)*
- Changing, compressing or replacing images (profile5.png is 2.3 MB, Football_analysis.png
  is 5.8 MB). Flagged as a later optimisation; this phase only adds lazy loading.
- Adding/removing npm dependencies. `react-parallax-tilt`, `react-simple-typewriter`,
  `react-router-dom` and `toastify` become or already are unused. They stay installed
  and can be removed in a separate cleanup. *(My call: keeps package files out of this change.)*
- `tailwind.config.js` is a v3-style file that Tailwind v4 does not load; left untouched.
- A test framework. Verification is build + lint + screenshot review (section 10).

## 5. Visual language

### 5.1 Tokens

Defined once as CSS custom properties in `src/index.css`, exposed to Tailwind v4
through `@theme inline`, so components use utilities like `bg-paper text-ink border-line`.

| Token | Light (drafting film) | Dark (cyanotype) | Use |
|---|---|---|---|
| `paper` | `#edf2f8` | `#0a2a55` | page background |
| `panel` | `#f7faff` | `#0c3166` | cards, title block, table heads |
| `ink` | `#0f2b55` | `#eef5ff` | primary text |
| `muted` | `#4b6690` | `#9fbce4` | secondary text, labels |
| `line` | `#1d4f9c` | `#cfe1ff` | all drawing lines, borders, primary buttons |
| `accent` | `#c2410c` | `#ffb35c` | "red pencil": dimension lines, rev triangles, callouts, hover |
| `grid` / `grid-major` | blue @ 7% / 15% | pale blue @ 5.5% / 12% | drafting grid |

The theme is applied as `data-theme="light|dark"` on `<html>`. Tailwind's `dark:`
variant is remapped to that attribute.

### 5.2 Type

- Display: **Barlow Condensed** 500/700, uppercase. Used for the name, section titles and card titles.
- Everything else: **IBM Plex Mono** 400/500/600.
- Loaded from Google Fonts via `<link>` in `index.html`, with preconnect and real fallbacks
  (`"Arial Narrow", sans-serif` / `ui-monospace, Consolas, monospace`). Poppins is removed.
- Uppercase micro-labels use 0.12–0.16em letter-spacing.

### 5.3 Drawing devices (each encodes real content)

- **Sheet frame**: double border (2px + 1px outline offset), wrapping all sections.
- **Zone row** A–F across the top of the sheet.
- **REFERENCES row** under the zone row with the five profile links (section 6.2).
- **Dimension line** in accent: `◂ 4 ROLES · 7 PROJECTS · 36 SKILLS ▸`, with counts computed
  from `experiences.length`, `projects.length` and the sum of `SkillsInfo[].skills.length`.
- **Title block**: bordered grid of label/value cells.
- **Section tags**: small accent-bordered labels (`SECTION B–B`, `REV. HISTORY`,
  `DETAIL VIEWS`, `CERT. RECORD`, `TRANSMITTAL`).
- **Revision triangles** (accent) holding letters for experience rows.
- **Detail callout circles** (accent) holding letters for projects.
- Footer strip: `© 2026 TUSHAR SHARMA · links · DO NOT SCALE DRAWING`.

### 5.4 Motion

Kept minimal: the typewriter in the hero, hover transitions, and a short fade/slide
for the modal and mobile menu. Everything is static under `prefers-reduced-motion`.
No tilt and no blur blobs.

## 6. Page structure and sections

Order: Navbar (fixed) → Sheet [zone row, references, About/hero, Skills,
Experience, Projects, Education, Contact, footer strip].

### 6.1 Navbar (`Navbar.jsx`, rewritten)
- Fixed top. Transparent at top; after 50px of scroll it becomes `paper` at ~85% opacity
  with a backdrop blur and a 1px `line` bottom border. Sits within the safe-area inset.
- Left: brand `TS-066 ⌖`, plus `TUSHAR SHARMA` from `sm` up.
- Centre (md+): About, Skills, Experience, Projects, Education, Contact. Uppercase mono 12px;
  the active section is highlighted in accent. Active section is tracked with an IntersectionObserver.
- Right: theme toggle (circle button, sun/moon icon, `aria-label`, `aria-pressed`) and,
  below md, a menu button that opens a full-width dropdown panel (sheet-styled) with the same
  links. Closes on link click, Escape or outside click.
- Profile icons move out of the navbar into the REFERENCES row.

### 6.2 References row (new `References.jsx`)
- Grid: label cell `REFERENCES` + 5 link cells. Each cell has a react-icons logo
  (`FaGithub`, `FaLinkedin`, `SiLeetcode`, `SiCodeforces`, `SiCodechef`), a code
  (`GH/IN/LC/CF/CC`), `REF-0n · PLATFORM` and the handle, e.g. `tushar66sharma ↗`.
- Responsive: 5 columns from `lg`. Below `lg` the label sits on its own row and the links
  form 2 columns, with the 5th spanning both. Text truncates with an ellipsis and never overflows.
- URLs come from a new `src/profiles.js` (same URLs as today's Navbar/Footer, plus
  Instagram for the footer), so the navbar menu, references row and footer share one list.

### 6.3 About / hero (`About.jsx`, rewritten)
- Two columns from `lg` (≈1.5fr / 1fr); stacked below.
- Left: eyebrow `GENERAL ARRANGEMENT · ` + **typewriter** cycling the existing four role
  words; dimension line; name `TUSHAR / SHARMA` in display type (clamp ~56–124px);
  the existing About paragraph verbatim; buttons: **Download CV ↗** (existing Drive link)
  and **Contact** (scrolls to contact).
- Right: **profile photo** (`profile5.png`) in a "FRONT ELEVATION" view frame with
  corner ticks and centre-line marks, then the **title block**:
  TITLE: Software Engineer · CURRENT: `experiences[0].company` · DRAWN BY: T. SHARMA ·
  DWG NO.: TS-066 · CERT.: `education[0].degree` short + `education[0].grade` ·
  SCALE: 1:1 · REV: latest rev letter · SHEET 1 OF 1. Values come from constants where they exist.
- Fixes the existing `words` hook warning by moving the array to module scope.

### 6.4 Skills (`Skills.jsx`, rewritten) — "Parts list"
- Header: tag `SECTION B–B`, title `SKILLS`, note "bill of materials by assembly", with the existing
  intro sentence below.
- Table with columns ITEM | ASSEMBLY | COMPONENTS | QTY. One row per `SkillsInfo` category.
  Components are chips containing logo (20px) and name; QTY = `skills.length`.
- Below `md` each row stacks: item and assembly on one line, chips below, QTY inline.

### 6.5 Experience (`Experience.jsx`, rewritten) — "Revision history"
- Columns REV | DATE | DESCRIPTION. Revision letters run from oldest = A to newest, by array
  position (first array item gets the highest letter; array order is unchanged).
- Description cell: company logo (40px, white tile so JPG logos look clean), role, company,
  `desc`, then `SPEC:` chips for every entry in `skills`.
- Below `md`: REV + DATE on one line, description below.

### 6.6 Projects (`Work.jsx`, rewritten) — "Detail views"
- Grid: 1 col → 2 cols (`md`) → 3 cols (`xl`).
- Card: callout circle + `DETAIL A · …`, project image in a framed viewport
  (`aspect-video`, `object-cover`, lazy), title, description clamped to 3 lines, tags,
  and two links: **Source ↗** (`github`) and **Live ↗** (`webapp`). Links stop propagation.
- Clicking or pressing Enter on a card opens the **modal**: a sheet-styled dialog with the
  full image, title, full description, all tags, and View Code / View Live buttons.
  Closes with ×, Escape or a backdrop click. Body scroll is locked, focus moves into the
  dialog and returns to the card on close. Modal is full-screen on phones.

### 6.7 Education (`Education.jsx`, rewritten) — "Certification record"
- Not in the mock; same table language. Columns NO. | QUALIFICATION | PERIOD | GRADE.
- Qualification cell: school logo, `degree`, `school`, and `desc` (full text).
- Below `md`: stacked like Experience.

### 6.8 Contact (`Contact.jsx`, restyled) — "Transmittal"
- Header with the existing title and intro sentence.
- Two columns from `lg`: left is a short note plus profile links; right is the existing
  EmailJS form styled as a transmittal sheet (labelled fields: FROM (email), NAME, SUBJECT,
  MESSAGE; square inputs with `line` borders; accent focus; **SEND TRANSMITTAL** button).
- EmailJS IDs, field `name`s and behaviour unchanged. Adds a sending state (button
  disabled, "SENDING…"), which also removes the unused `isSent` lint error. Toasts follow the
  current theme.
- Phase 2 adds the RFI chat next to this form.

### 6.9 Footer (`Footer.jsx`, rewritten)
- Footer strip inside the sheet: brand, section links (fixes the existing bug where
  "Projects" targets `#projects`; the section id is `work`), profile + Instagram links,
  `© 2026 Tushar Sharma. All rights reserved.`, `DO NOT SCALE DRAWING`.

## 7. Theme mechanics
- `index.html` head runs an inline script before paint: it reads `localStorage.theme`
  (`"light"|"dark"`), falls back to `prefers-color-scheme`, and sets `data-theme` and
  `<meta name="theme-color">`. Wrapped in try/catch.
- `src/hooks/useTheme.js`: returns `{ theme, toggle }`. It syncs `data-theme` and
  localStorage, and follows OS changes until the user picks a theme explicitly.
- Toggle lives in the navbar on all sizes.

## 8. Responsiveness rules
- Mobile-first Tailwind breakpoints (sm 640, md 768, lg 1024, xl 1280). Content max width ≈1160px.
- Side gutter ≥16px (`max(16px, env(safe-area-inset-*))`). The sheet's outline offset shrinks to 3px on phones.
- No fixed widths wider than the viewport. Long strings (company names, handles, tags)
  wrap or truncate inside their cell (`min-w-0`, `break-words`).
- Tap targets ≥40px on touch layouts. Fixed navbar height is accounted for with
  `scroll-margin-top` on sections.
- Check at 360, 768, 1024 and 1440 widths in both themes.

## 9. Accessibility
- Semantic landmarks (`header`, `nav`, `main`, `section` with headings, `footer`), with
  one `h1` (the name).
- Visible focus rings (accent), `aria-label`s on icon-only buttons, and `alt` text on all images.
- Contrast: body text ≥4.5:1 in both themes (tokens chosen for this; verified during implementation).
- `prefers-reduced-motion` disables typing animation (shows the first word), transitions and smooth scroll.

## 10. Verification
- `git diff --exit-code src/constants.js` must pass at every commit.
- `npm run build` succeeds; `npm run lint` reports 0 errors (and no new warnings).
- Content audit: every field of every constants entry and every preserved component string
  is rendered (checklist in the plan).
- Headless-browser screenshots (Edge, already on this machine) at 360/768/1440 in light and
  dark, reviewed for overflow, clipping and contrast. Tushar does the final visual review
  with `npm run dev`.

## 11. Files

| File | Change |
|---|---|
| `index.html` | fonts, pre-paint theme script, meta description, theme-color |
| `src/index.css` | tokens, Tailwind v4 theme mapping, dark variant, base + drawing utilities |
| `src/hooks/useTheme.js` | new |
| `src/profiles.js` | new: profile links |
| `src/components/ui/SectionHeader.jsx`, `ThemeToggle.jsx` | new shared pieces |
| `src/components/References/References.jsx` | new |
| `src/App.jsx` | sheet layout, section order |
| `Navbar`, `About`, `Skills`, `Experience`, `Work`, `Education`, `Contact`, `Footer` | rewritten in the new style |
| `src/BlurBlob.jsx` | deleted (no longer used) |
| `src/constants.js` | **unchanged** |

## 12. Calls I made (please check)
1. No chat UI in phase 1 (section 4).
2. Profile photo kept, shown in a "front elevation" frame in the hero (the mock had none).
3. Typewriter roles kept, moved into the hero eyebrow line.
4. Education designed as a "certification record" table (the mock had no Education section).
5. Contact form styled as a "transmittal" sheet; EmailJS logic untouched.
6. Unused dependencies and the v3 `tailwind.config.js` left alone.
7. Navbar gains a Contact link; footer "Projects" link bug fixed.
