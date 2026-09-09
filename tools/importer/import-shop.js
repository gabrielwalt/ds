/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHomeParser from './parsers/hero-home.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsPromoParser from './parsers/cards-promo.js';
import cardsCategoryParser from './parsers/cards-category.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/dentsplysirona-cleanup.js';
import dmImagesTransformer from './transformers/dentsplysirona-dm-images.js';
import sectionsTransformer from './transformers/dentsplysirona-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-home': heroHomeParser,
  'cards-feature': cardsFeatureParser,
  'cards-promo': cardsPromoParser,
  'cards-category': cardsCategoryParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "shop",
  "description": "Dentsply Sirona en-us Shop landing page. Reuses hero-home and cards-feature (banner + promotion teasers); adds cards-promo (eyebrow promo cards) and cards-category (icon-label tiles for top categories + top brands). The 'Shop featured products' React commerce carousel is client-hydrated and does not import.",
  "urls": [
    "https://www.dentsplysirona.com/en-us/shop.html"
  ],
  "blocks": [
    {
      "name": "hero-home",
      "instances": [
        ".hero.cmp-shophero__anonymous"
      ]
    },
    {
      "name": "cards-promo",
      "instances": [
        ".promocards.cmp-shop--promocards"
      ]
    },
    {
      "name": "cards-category",
      "instances": [
        ".bootstrap-grid:has(.cmp-iconcard__wrapper-anchor):not(:has(.bootstrap-grid .cmp-iconcard__wrapper-anchor))"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        ".teaser.basemarketingproperties"
      ]
    }
  ]
};

// TRANSFORMER REGISTRY
// Order: cleanup (removes chrome) -> dm-images (rewrites DM imgs to anchors,
// afterTransform, after parsers build their cells) -> sections (adds section
// metadata, afterTransform). Section transformer only runs when 2+ sections.
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  /**
   * Force lazy-loaded images to resolve BEFORE the transform reads the DOM.
   * The AEM Core image component ships each `.imagetile` / `.cmp-image` <img>
   * with a 1x1 base64 GIF placeholder in `src` and swaps in the real Scene7
   * URL only when the element scrolls into view (IntersectionObserver via
   * `data-cmp-hook-image`). The importer never scrolls to the deep toolkit
   * section, so those 6 cards were captured with placeholder/blob src and
   * rendered broken. onLoad runs in the live page context before transform:
   * scroll the whole page to trigger every observer, dispatch scroll/resize so
   * lazy libs that listen for them also fire, then wait for the real `src`
   * values to land. Best-effort — wrapped so a failure never aborts the import.
   */
  onLoad: async ({ document }) => {
    try {
      const win = document.defaultView || window;
      const sleep = (ms) => new Promise((r) => { win.setTimeout(r, ms); });
      const step = Math.max(400, Math.floor(win.innerHeight * 0.8));
      const maxScroll = () => Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      );
      for (let y = 0; y <= maxScroll(); y += step) {
        win.scrollTo(0, y);
        win.dispatchEvent(new win.Event('scroll'));
        // eslint-disable-next-line no-await-in-loop
        await sleep(250);
      }
      win.scrollTo(0, maxScroll());
      win.dispatchEvent(new win.Event('scroll'));
      win.dispatchEvent(new win.Event('resize'));
      // Nudge any element still flagged as loading into view explicitly.
      document.querySelectorAll('img.cmp-image__image--is-loading, .imagetile img, .cmp-image img').forEach((img) => {
        try { img.scrollIntoView(); } catch (e) { /* ignore */ }
      });
      // Wait until placeholder/blob srcs are replaced by real URLs (or time out).
      const isPlaceholder = (s) => !s || s.startsWith('data:') || s.startsWith('blob:');
      for (let i = 0; i < 20; i += 1) {
        const pending = [...document.querySelectorAll('.imagetile img, .cmp-image img')]
          .filter((img) => isPlaceholder(img.getAttribute('src')));
        if (pending.length === 0) break;
        win.scrollBy(0, 100);
        win.dispatchEvent(new win.Event('scroll'));
        // eslint-disable-next-line no-await-in-loop
        await sleep(300);
      }
      win.scrollTo(0, 0);
    } catch (e) {
      // Best-effort lazy-load trigger; never block the import.
      // eslint-disable-next-line no-console
      console.warn('onLoad lazy-load scroll failed:', e && e.message);
    }
  },

  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 1b. Preserve source-specific default-content styling cues that would
    // otherwise be flattened away:
    //  (a) Heading highlight — the source wraps an accent phrase in headings in
    //      <span class="cmp-text--blue"> (e.g. "…for a more efficient practice",
    //      "…Let's connect."). Convert those spans to <strong> so the emphasis
    //      survives html2md's markdown round-trip; the blocks/global CSS renders
    //      heading <strong> in brand blue.
    //  (b) Section-level CTA buttons — the Advantage (§7) "Learn more" and the
    //      contact (§9) "Visit support" are standalone <a class="cmp-button">
    //      section CTAs. Re-emit each as <p><strong><a>…</a></strong></p> inside
    //      its section so EDS's decorateButtons() promotes it to a primary button.
    document.querySelectorAll('.cmp-title__text .cmp-text--blue, h1 .cmp-text--blue, h2 .cmp-text--blue, h3 .cmp-text--blue, h4 .cmp-text--blue').forEach((span) => {
      const strong = document.createElement('strong');
      strong.textContent = span.textContent;
      span.replaceWith(strong);
    });

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + DM image rewrite + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5a. Normalise the <title> BEFORE createMetadata reads it. The source
    // <title> ("Dentsply Sirona USA: Dental products and technologies |
    // Dentsply Sirona USA") contains a literal `|` and is long. createMetadata
    // copies it verbatim into the Metadata block's Title cell; in a markdown
    // table that long, pipe-bearing value makes html2md emit the whole Metadata
    // table as a pandoc GRID table (+===+). md2da only understands GFM pipe
    // tables, so it fails on the grid table and passes the ENTIRE document
    // through as raw markdown text (every block then renders as literal +---+
    // instead of HTML). Trimming the title to the part before the ` | ` brand
    // suffix keeps the metadata a compact pipe table. Update <title> and any
    // og:title / twitter:title metas so createMetadata picks up the short form.
    const titleEl = document.querySelector('title');
    if (titleEl && titleEl.textContent.indexOf('|') !== -1) {
      const shortTitle = titleEl.textContent.split('|')[0].trim();
      titleEl.textContent = shortTitle;
      document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach((m) => {
        const c = m.getAttribute('content') || '';
        if (c.indexOf('|') !== -1) m.setAttribute('content', c.split('|')[0].trim());
      });
    }
    // Normalise meta description/og:description values. createMetadata copies
    // these into Metadata cells; the pipeline's markdown table serializer emits
    // a pandoc GRID table (which md2da CANNOT parse — it then dumps the whole
    // page as raw markdown text) whenever a Metadata cell value is long enough
    // to WRAP onto a second line. The en-us <meta name="description"> is one
    // long sentence that wraps; de-ch's was short and stayed on one line, which
    // is why de-ch imported cleanly and en-us did not. Collapse whitespace,
    // replace literal pipes, and clamp to a single ~140-char line so the
    // Metadata table stays a GFM pipe table. (Full text remains on the live
    // source; the imported Description is a concise SEO summary.)
    document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach((m) => {
      let c = (m.getAttribute('content') || '').replace(/\s*\|\s*/g, ' — ').replace(/\s+/g, ' ').trim();
      if (c.length > 140) {
        c = c.slice(0, 140).replace(/\s+\S*$/, '').trim();
      }
      if (c) m.setAttribute('content', c);
    });

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5d. Flatten the content into top-level SECTION GROUPS separated by `---`.
    // WHY: the source nests each block table many levels deep inside bootstrap-
    // grid / cmp-container wrappers. On this page html2md fails to emit `---`
    // section separators for such deeply-wrapped siblings, so consecutive block
    // grid-tables run together in the markdown; md2da then can't parse them and
    // dumps the ENTIRE document as raw markdown text (every block renders as
    // literal +---+ instead of HTML). Rebuilding `main` so each PAGE_TEMPLATE
    // section becomes a flat run of its content nodes (heading, block tables,
    // section-metadata), with a single <hr> BETWEEN sections, gives html2md the
    // top-level structure it needs: md2da then converts each block to HTML and
    // each `---` starts a new EDS section (so section-metadata style=dark/grey
    // correctly wraps its whole section, not an empty slice). Verified: consecutive
    // block tables inside one section serialize fine; only inter-section `---`
    // is required.
    //
    // Collect every content node in DOCUMENT ORDER: block tables (incl. the
    // Section Metadata and page Metadata tables), headings, and non-empty
    // paragraphs. Skip nodes nested inside a block table cell (they belong to
    // the block). Then rebuild `main` as a flat list, inserting an <hr> only at
    // SECTION BOUNDARIES — i.e. before each heading (a heading starts a new
    // visible section) — so a section's heading + its block tables + its
    // section-metadata stay in one `---`-delimited EDS section. This both
    // satisfies md2da (each section is cleanly delimited) and preserves the
    // section grouping needed for section-metadata (dark/grey) to wrap its
    // whole section rather than an empty slice.
    const isContentNode = (n) => {
      if (n.tagName !== 'TABLE' && n.closest('table')) return false;
      if (n.tagName === 'P' && !n.textContent.trim() && !n.querySelector('img, a, picture')) return false;
      return true;
    };
    const CONTENT_SELECTOR = 'table, h1, h2, h3, h4, h5, h6, p';
    const contentNodes = [...main.querySelectorAll(CONTENT_SELECTOR)].filter(isContentNode);
    const rebuilt = document.createElement('div');
    let placed = 0;
    contentNodes.forEach((n) => {
      const isHeading = /^H[1-6]$/.test(n.tagName);
      const isPageMeta = n.tagName === 'TABLE' && /^metadata$/i.test((n.querySelector('th') ? n.querySelector('th').textContent.trim() : ''));
      // Start a new section before a heading, and before the trailing page
      // Metadata block, but never before the very first placed node.
      if (placed > 0 && (isHeading || isPageMeta)) {
        rebuilt.append(document.createElement('hr'));
      }
      rebuilt.append(n);
      placed += 1;
    });

    // Drop ORPHAN headings — a heading with no content between it and the next
    // section break (<hr>) or the end. On the top-level pages a few section
    // titles ("Find an in-person course", "Download our latest Sustainability
    // Report") label interactive widgets that are client-side hydrated and do
    // not import, leaving just a floating heading with an empty section. Remove
    // those so no empty labelled section is emitted. Headings that DO own
    // content (a following block/paragraph before the next <hr>) are kept.
    [...rebuilt.querySelectorAll('h1, h2, h3, h4, h5, h6')].forEach((h) => {
      let sib = h.nextElementSibling;
      // skip the <hr> that immediately follows a heading only if it's the
      // section separator BEFORE the next heading; here we look for real content
      let hasContent = false;
      while (sib && sib.tagName !== 'HR') {
        if (!/^H[1-6]$/.test(sib.tagName)) { hasContent = true; break; }
        sib = sib.nextElementSibling;
      }
      if (!hasContent) {
        // remove the orphan heading and a trailing separator it introduced
        const next = h.nextElementSibling;
        if (next && next.tagName === 'HR') next.remove();
        h.remove();
      }
    });

    main.textContent = '';
    main.append(rebuilt);

    // 6. Output path derived from the source URL pathname (strip domain,
    //    trailing slash, and .html extension). e.g. /en-us/support.html ->
    //    /en-us/support.
    const rawPath = new URL(params.originalURL || url).pathname
      .replace(/\.html?$/, '')
      .replace(/\/$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath || '/index');

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
