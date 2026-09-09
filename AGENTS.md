# AGENTS.md

Edge Delivery Services. Read a block first. Omissions are in the repo or known.

## Avoid
- `scripts/aem.js` is vendored. Never edit.
- Markup comes from the backend. `curl localhost:3000/x.plain.html` first.
- Never hand-edit `content/*.plain.html` — regenerate through the import
  pipeline. The only exceptions are the `nav.plain.html` / `footer.plain.html`
  fragments, which are authored directly.
- `buildAutoBlocks` rewrites content before your block runs.
- Authors omit and add cells. Decorate defensively.
- No build step; devDependencies only.
- Scope CSS to `.blockname`; `-wrapper`/`-container` are section classes.
- `fragment/fragment.js` is the only cross-block import. Otherwise use `/scripts/`.
- **Reuse blocks before building new ones** (a standing mantra for this repo).
  When importing a page, map its sections to existing blocks/variants first;
  create a new block only where none fits. Most pages here are ~80% existing
  blocks. A shared behavior two pages need (e.g. cards overlapping a teaser)
  belongs in a shared variant/section style, not duplicated per page.

## CSS selectors — keep them short, structural, low-specificity
- Prefer a class tied to block structure or a meaningful variant. If layout
  needs to target an element the markup doesn't name (e.g. "the CTA paragraph"),
  add a generated wrapper class in `decorate()` (moving the authored element in
  whole — see the Experience Workspace rules) and style that. Don't reach for a
  clever selector to avoid a one-line JS change.
- Avoid `:last-child` / `:first-child`, `:has()`, `:not(...)`, `nth-*`, and
  attribute matches for **layout**, and avoid section-background combinations
  (`.section.dark:not(.blue) …`) as layout hooks. They break when authors add,
  remove, reorder, or re-style content. Use them only with a strong structural
  reason, and say why in a comment.
- Model spacing as **default + variant override**: define the generic value on
  the block (or a design-system token like `--card-cta-gap`); a variant sets its
  own value only when it genuinely differs, on the same class — not via a longer
  descendant chain. A `margin-top: auto` bottom-pin is a no-op when content fills
  the box, so prefer it over per-section `:has()`/`:not()` gymnastics.
- Keep specificity flat: `.block .part`, not
  `main .section.x-container:not(.a,.b) .block > ul > li:last-child:has(> a)`.
  If you need `stylelint-disable no-descending-specificity`, treat it as a smell
  and reconsider the structure first.

## Content stays in the container by default
- `main > .section > div` is the shared content container
  (`max-width: var(--content-max-width)`, auto margins, gutter padding).
  Authored content lives inside it and lines up with every other section —
  automatically, with no per-block or per-section opt-in.
- Only two things may span the viewport: a **section background**, or a block
  explicitly designed as full-width/breakout. A breakout block opts *out*
  deliberately (section carries
  `padding-inline: max(gutter, calc((100% - var(--content-max-width)) / 2))`,
  wrappers `max-width: none`), never the other way around.
- Never make correct alignment depend on the author remembering a section style
  or variant. If a block escapes the container, fix the shared section/container
  styling structurally — don't patch the one page.
- Don't replace the container's gutter with a `max()` formula on the inner div;
  that double-insets. The full-bleed `max()` belongs on the *section*, not the
  content container.

## Reusable-block design system
- `styles/brand.css` is the single source of truth for spacing, typography, and
  color. Reach for an existing token (`--card-cta-gap`, `--card-title-gap`,
  `--grid-gap`, heading sizes, …) before hardcoding; add a token when a value is
  shared across blocks. Set the generic value once; a variant overrides only the
  value it truly differs on, on the same class.
- **Card surface default:** reusable card blocks default to a subtle grey border
  (`--card-border-light`) and **no shadow** (`--shadow-card: none`) so they read
  consistently on flat section backgrounds. A block that genuinely needs
  elevation sets its own `box-shadow` locally. Normalize at the
  shared-block/token level, never per page.
- **Card rows — equal height, aligned CTAs:** cards in a row should be equal
  height with their CTAs on one baseline. Make the card body a flex column
  (`flex: 1 1 auto`) and bottom-pin the CTA wrapper with `margin-top: auto` — a
  no-op when content fills the box, so it needs no `:has()`/`:not()` guard.
  Grid-cell layouts (e.g. a banner variant) don't get the pin; give them a fixed
  gap override on the same wrapper class.
- **One vertical rhythm across all sections.** Every content section shares the
  same top/bottom padding (`--section-padding-block`), the same heading→content
  gap (`--section-heading-gap`), and the same inter-card gap (`--grid-gap`) — set
  once globally so sections line up regardless of background. A section overrides
  only when it genuinely must. Sections carry **no vertical margin**: adjacent
  backgrounds touch edge-to-edge with no white gap. Exception: the first
  section's top touches the sticky nav (no top padding).

## Match the source exactly — don't eyeball
- Read the real computed value off the original element before setting one.
  "Looks white" is often `#fafafa`; "grey" is a specific token (`#eee` vs
  `#e5e5e5`). Sample colors, sizes, spacing, aspect ratios, and image display
  sizes from the source rather than approximating.
- Reuse the source's own assets where possible: extract the actual arrow/caret
  SVG glyph and drive it with `currentColor` (see `--icon-arrow-right`), download
  the real logo into the repo, etc. — don't substitute look-alikes.

## Verify before claiming done
- Check the rendered preview, not just the source. Verify against the original
  design and across **desktop, tablet, and mobile** breakpoints — spacing and
  alignment regressions usually show at one breakpoint only.
- For visual-fidelity work: capture comparative views, critique the remaining
  gaps explicitly, fix, then re-verify. Prefer text-based DOM / computed-style
  inspection over screenshots.

## Outdated
- `fstab.yaml`, `helix-query.yaml`, `paths.json` are retired. Config lives at tools.aem.live.

## Remember
- `npx -y @adobe/aem-cli up`: local code, previewed content.
- Merging `main` ships code; content publishes separately.
- A PR without a `{branch}--{repo}--{owner}.aem.page/{path}` link is rejected.
- All committed files are served. Use `.hlxignore`.
- **Local preview ≠ EDS runtime.** Nav/footer can look right under `aem up` yet
  break once uploaded to `{branch}--{repo}--{owner}.aem.page`. Verify on the
  actual EDS preview, and fix root causes (content paths, asset refs,
  environment assumptions) rather than adding visual workarounds. Fragment fetch
  must fall back correctly: try `/content/…​.plain.html`, then `/….plain.html`
  (production serves the fragment at site root) — don't derive the path from
  `getMetadata`.
- **DA/EDS asset limits.** Inline SVG in a `.plain.html` fragment must be < 40KB
  or the DA preview 409s — keep large SVGs (logos, glyphs) in the repo and inject
  via JS. Imported raster images over the EDS size limit fail upload — the
  importer should downsize oversized source images automatically.
- **Moving a page's served path is a routing change, not just a file move.**
  When a page's path changes (e.g. homepage `/index` → `/en-us/index`, serving
  `/` → `/en-us/`), reconcile its routing config in the AEM Config Service
  (`admin.da.live/config/{org}/{repo}`) as part of the same task — not as a
  "follow-up outside the repo". Without it the old/root path keeps resolving and
  the new path 404s at its bare forms. For a locale-rooted homepage that means a
  root redirect `/` → `/{locale}/` and a bare-locale normalization
  `/{locale}` → `/{locale}/`. Config is retired from repo files (no
  `fstab.yaml`/`paths.json`), so it lives only in the Config Service.
- Skills: `/plugin marketplace add adobe/skills`, then `aem-edge-delivery-services` (24 skills, incl. `docs-search`).

## Never break Experience Workspace inline editing

Blocks that **rebuild** authored content during `decorate()` become invisible to
Experience Workspace (da.live) inline editing. On one generated page only 23 of
108 texts were editable — the rest were dead because `decorate()` discarded the
elements the editor addresses. This is a hard constraint from how the workspace
works, not a styling bug or a feature flag.

### Why (mechanism, verified against da.live sources)
The workspace never parses the rendered DOM — it rents the project's own render
pipeline:
1. The preview host injects a bootstrap into `scripts.js` handing the quick-edit
   plugin the page's own `loadPage()`.
2. The workspace serializes its ProseMirror doc to HTML, stamping **document
   positions** as attributes — `data-prose-index` on every paragraph-level
   element, `data-image-index` on images, `data-block-index` on blocks — swaps
   it into `document.body`, and re-runs `loadPage()`, so every `decorate()` runs
   over instrumented markup.
3. Every element still carrying `data-prose-index` **after decoration** is
   replaced in place by a live ProseMirror editor. Elements that lost the
   attribute are permanently uneditable — only `data-block-index` is repaired
   afterwards (by class-name matching), never `data-prose-index`.
4. Edits post the node back; cursor math uses the element's exact `textContent`
   length, so displayed text must be the authored text verbatim.

So `textContent = x`, innerHTML rebuilds, `cloneNode`+discard, and `.trim()` of
displayed text all silently destroy editability. The attribute is on the
`<p>`/`<h*>`, not on inline children like `<a>`.

### The one rule: node-slot, never value-slot
**Node-slot (correct):** move the authored element into an empty generated
wrapper by role — it keeps its tag, attributes, and identity; the wrapper carries
the layout class. **Value-slot (banned):** copy authored *text* into template
nodes (`slot.textContent = cell.textContent`, `` innerHTML `${text}` `` templates).
Value-slotting renders pixel-perfect and is 100% uneditable.

```js
// WRONG — value-slot: identity and index die
const t = document.createElement('p'); t.className = 'card-title';
t.textContent = cell.textContent.trim();
// RIGHT — node-slot: wrapper carries layout, authored element moves in whole
const t = document.createElement('div'); t.className = 'card-title';
t.append(...[...cell.children].filter((n) => n.textContent.trim()));
```

### Editability contract (EW1–EW10)
- **EW1 — Move, never rebuild.** `append`/`prepend` authored `h1–h6/p/ul/ol/pre/
  blockquote/picture/img`; never re-create from `textContent`/`innerHTML`, never
  `cloneNode`+discard, never retag, never trim displayed text.
- **EW2 — Wrappers carry classes; style authored elements as wrapper
  descendants** (`.headline :is(h2,h3)`) — no class on the authored element, no
  child combinator or positional pseudo between wrapper and authored element.
- **EW3 — CTAs move as their paragraph.** Index is on the `<p>`, not the `<a>`:
  `actions.append(a.closest('p') || a)`.
- **EW4 — Presentational clones strip instrumentation.** Carousel loop slides,
  marquee/sticky copies: `stripInstrumentation(clone)` so indices aren't dupes.
- **EW5 — Exempt text is declared, not dropped.** Any never-editable text gets an
  `@ew-exempt` JSDoc tag in one of three categories: `metadata` (glyph keys,
  `label | value` keys, variant selectors), `derived` (e.g. ISO date re-rendered
  as spans), or `index-driven` (authored rows are the no-JS fallback).
- **EW6 — Card-as-link: unwrap the inner anchor** in the live DOM after reading
  its `href`; the indexed paragraph survives inside the card `<a>`. Editor-
  rendered anchors need `color: inherit; text-decoration: none` where global link
  ink clashes.
- **EW7 — Interactive containers can't host the editor.** A `<button>`/`<summary>`
  swallows focus; move an accordion title into a sibling `div`, not the button.
- **EW8 — Reabsorbed section heads MOVE children** (`head.append(...wrapper
  .childNodes)`) — they're already inline-editable as default content.
- **EW9 — Re-entrancy.** Blocks adopting sibling sections move those decorated
  blocks whole and must not depend on module-level state from a previous run
  (the workspace re-decorates on structural edits).
- **EW10 — Default content follows the same selector rules.** Section-on-prose
  selectors (`… .default-content-wrapper > p:first-child`, `p:has(picture) + p`)
  drift in edit mode; use descendant selectors.

**Edit-mode CSS drift (EW2/EW10):** a utility on an authored element or a
`.wrap a` descendant out-ranks `a:any-link` and flips its colour when the editor
swaps in a fresh element. Mirror each such utility as a `:where()` wrapper variant
so specificity doesn't move: `.affordance, .affordance-wrap :where(a) { … }`.
Also reset the authored element / editor replacement with `margin: 0; font-size:
inherit; line-height: inherit; font-weight: inherit; color: inherit;` —
`color: inherit` is load-bearing (global `h1..h6 { color }` beats inheritance).

### Verify
Authoritative gate is the probe from the `adobe/skills` deploy skill
(`ew-editability-probe.mjs`, run via `block-roundtrip.mjs --ew`): exit 0 = every
non-exempt authored text editable, no duplicate indices; non-zero = dead or
duplicated text. Manual check: open the block in Experience Workspace
(`https://da.live/canvas?ref=<branch>#/<org>/<repo>/<path>`), confirm every
visible authored text becomes a `div.prosemirror-editor`, typing updates the
source doc, and computed colour/size/weight match published mode. Trigger
instrumentation deterministically by calling
`updateDocument(ewEditorDoc._controllerCtx)` from da.live's
`editor-utils/editor-utils.js` in the canvas page context.

Full contract: `adobe/skills` PR #329 (EW1–EW10, default-on gate). Earlier
reference: `keepthebyte/aem-marriott` PR #1, 8 block types, 23 → 108 editable
texts, recipe in its `docs/quick-edit.md`.
