# AGENTS.md

Edge Delivery Services. Read a block first. Omissions are in the repo or known.

## Avoid
- `scripts/aem.js` is vendored. Never edit.
- Markup comes from the backend. `curl localhost:3000/x.plain.html` first.
- `buildAutoBlocks` rewrites content before your block runs.
- Authors omit and add cells. Decorate defensively.
- No build step; devDependencies only.
- Scope CSS to `.blockname`; `-wrapper`/`-container` are section classes.
- `fragment/fragment.js` is the only cross-block import. Otherwise use `/scripts/`.

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

## Outdated
- `fstab.yaml`, `helix-query.yaml`, `paths.json` are retired. Config lives at tools.aem.live.

## Remember
- `npx -y @adobe/aem-cli up`: local code, previewed content.
- Merging `main` ships code; content publishes separately.
- A PR without a `{branch}--{repo}--{owner}.aem.page/{path}` link is rejected.
- All committed files are served. Use `.hlxignore`.
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

### Required generation rules
- **R1. Move authored elements; never rebuild them.** `append()` the authored
  `<p>`/`<h*>`/`<picture>` into the generated layout. Don't re-create from
  `textContent`, don't clone-and-discard, don't retag (an authored `<h2>` stays
  an `<h2>`), don't trim/normalize displayed text.
- **R2. Layout classes go on generated wrapper elements, never on the authored
  element** — the editor swap (`replaceWith`) destroys anything set on the
  authored element mid-session.
  ```js
  // WRONG — class and identity die in the editor swap / rebuild
  const t = document.createElement('p');
  t.className = 'card-title';
  t.textContent = cell.textContent.trim();
  // RIGHT — wrapper carries layout; authored element moves in whole
  const t = document.createElement('div');
  t.className = 'card-title';
  t.append(...[...cell.children].filter((n) => n.textContent.trim()));
  ```
- **R3. Style through inheritance with explicit resets.** Typography on the
  wrapper; the inner authored element (or the editor that replaces it) gets
  `margin: 0; font-size: inherit; line-height: inherit; font-weight: inherit;
  color: inherit;`. `color: inherit` is load-bearing — global element rules
  (`h1..h6 { color }`) beat inherited values in both published and edit mode.
- **R4. CTAs: move the paragraph, not the anchor.** The prose index is on the
  `<p>`: `action.append(a.closest('p') || a)`. Button classes on the anchor die
  during editing — give the edit-mode look once, globally, derived from the
  authored `strong`/`em` convention and gated by `body.quick-edit` (set by the
  bootstrap; zero effect on published pages).
- **R5. Card-as-link: unwrap the authored inner anchor in the live DOM**
  (`a.replaceWith(...a.childNodes)`) after capturing its href — the indexed
  paragraph survives, nested anchors are avoided, the link mark stays in source.
  Editor-rendered anchors in such cards need `color: inherit; text-decoration:
  none` where the global link ink clashes.
- **R6. Text-as-metadata is exempt.** Authored text never displayed (glyph
  keys, label|value row labels, variant selectors) needs no inline editability —
  it's edited in the workspace Content view. Derived UI text (tab labels
  mirroring panel titles) is edited through its source.
- **R7. Adopted/nested content must also move.** A block assembling sibling
  sections (tabs, accordions) moves the decorated blocks whole so their
  instrumentation carries over by identity; re-running assembly after a body
  swap must be idempotent (the workspace re-decorates on structural edits).

### Acceptance criteria (per generated block)
Open the block's branch in Experience Workspace
(`https://da.live/canvas?ref=<branch>#/<org>/<repo>/<path>`); after
instrumentation:
- [ ] every visible authored text in the block sits inside a
  `div.prosemirror-editor` (count editors vs. authored text elements);
- [ ] typing in each editor updates the source doc (`getInstrumentedHTML`
  contains the typed text) and the layout doesn't collapse while editing;
- [ ] computed color / font-size / font-weight of each text is identical in
  published and edit mode;
- [ ] the published page (no `quick-edit`) renders byte-equivalent to the
  pre-change block: no nested anchors, hrefs intact, no color drift.

Automation note: instrumentation only arrives on ProseMirror doc transactions —
trigger it deterministically by calling
`updateDocument(ewEditorDoc._controllerCtx)` from
`https://da.live/blocks/canvas/editor-utils/editor-utils.js` in the canvas page
context.

Reference: `keepthebyte/aem-marriott` PR #1 converts 8 block types (hero,
join-band, offer-band, benefits-card, explore-cards, carousel, tier-tabs,
brand-strip) to this contract, 23 → 108 editable texts; full contract + test
recipe in its `docs/quick-edit.md`.
