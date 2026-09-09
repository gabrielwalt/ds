/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHomeParser from './parsers/hero-home.js';
import carouselPromoParser from './parsers/carousel-promo.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsOverlayParser from './parsers/cards-overlay.js';
import cardsQuoteParser from './parsers/cards-quote.js';
import accordionParser from './parsers/accordion.js';
import videoParser from './parsers/video.js';
import courseTeaserParser from './parsers/course-teaser.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/dentsplysirona-cleanup.js';
import dmImagesTransformer from './transformers/dentsplysirona-dm-images.js';
import sectionsTransformer from './transformers/dentsplysirona-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-home': heroHomeParser,
  'carousel-promo': carouselPromoParser,
  'cards-feature': cardsFeatureParser,
  'cards-overlay': cardsOverlayParser,
  'cards-quote': cardsQuoteParser,
  'accordion': accordionParser,
  'video': videoParser,
  'course-teaser': courseTeaserParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "toplevel",
  "description": "Dentsply Sirona en-us top-level pages (Explore, Learn, Why DS, Support). Reuses homepage blocks (hero, cards-overlay, cards-feature, carousel-promo) plus accordion (Support FAQ) and video (Learn) blocks.",
  "urls": [
    "https://www.dentsplysirona.com/en-us/explore.html",
    "https://www.dentsplysirona.com/en-us/learn.html",
    "https://www.dentsplysirona.com/en-us/why-ds.html",
    "https://www.dentsplysirona.com/en-us/support.html"
  ],
  "blocks": [
    {
      "name": "hero-home",
      "instances": [
        ".hero.cmp-hero__banner-center--large",
        ".hero"
      ]
    },
    {
      "name": "cards-overlay",
      "instances": [
        ".imagetile"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        ".iconcard",
        ".teaser.basemarketingproperties"
      ]
    },
    {
      "name": "carousel-promo",
      "instances": [
        ".slider-container",
        ".course-card-slider.contentfragmentlist"
      ]
    },
    {
      "name": "cards-quote",
      "instances": [
        ".quotecard"
      ]
    },
    {
      "name": "accordion",
      "instances": [
        ".accordion.panelcontainer",
        ".cmp-accordion"
      ]
    },
    {
      "name": "video",
      "instances": [
        ".videoslider"
      ]
    },
    {
      "name": "course-teaser",
      "instances": [
        ".pagebreaker-wrapper"
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

    // DETECT SECTION BACKGROUNDS while getComputedStyle is available (onLoad runs
    // in the live page). The top-level pages give some sections a coloured band
    // (e.g. Support: "Access hardware…" light-grey, "Our Policies" / "Let's
    // connect" dark). Those colours come from a wrapper class, not inline style,
    // so they can only be read from the rendered page — not the static markup or
    // the flattened output. For each section heading, walk up to the nearest
    // full-width ancestor with a non-transparent background, map the colour to a
    // style name, and stamp the heading with data-excat-section-style. The
    // flatten step (transform) then emits a Section Metadata block per styled
    // section. Best-effort and wrapped so it never aborts the import.
    try {
      const win = document.defaultView || window;
      // Map a computed rgb(...) colour to a brand section style name. Matches
      // the tokens in styles/brand.css: dark rgb(51 63 76), grey rgb(229 229
      // 229). Anything close to white/transparent → no style (default light).
      const colourToStyle = (rgb) => {
        const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(rgb || '');
        if (!m) return null;
        const r = +m[1]; const g = +m[2]; const bl = +m[3];
        const a = m[4] === undefined ? 1 : parseFloat(m[4]);
        if (a === 0) return null; // transparent
        const avg = (r + g + bl) / 3;
        if (avg < 110) return 'dark'; // dark slate band rgb(51 63 76)
        // Two distinct light-grey bands exist in the design (brand.css):
        //   grey       = rgb(229 229 229) ≈ avg 229  (§4 toolkit tiles, "Access
        //                hardware", first Why-DS band)
        //   grey-soft  = rgb(238 238 238) ≈ avg 238  ("Get to know us" band)
        // Match only within a tight window around those two tokens (≤242), so a
        // near-white section zone (e.g. rgb(246 246 246) ≈ 246, or the #fafafa
        // page background ≈ 250) is treated as the DEFAULT light section — not a
        // false grey band. Match to whichever token is nearer.
        if (avg >= 200 && avg <= 242) {
          return Math.abs(avg - 238) <= Math.abs(avg - 229) ? 'grey-soft' : 'grey';
        }
        return null; // white / near-white / off-white → default section
      };
      const headings = [...document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6, .cmp-container h1, .cmp-container h2, .cmp-container h3')];
      const seen = new Set();
      headings.forEach((h) => {
        if (!h.textContent.trim()) return;
        let el = h;
        for (let i = 0; i < 12 && el; i += 1) {
          const cs = win.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          if (rect.width >= 1000) {
            const style = colourToStyle(cs.backgroundColor);
            if (style) {
              // Only stamp the FIRST heading of the section (avoid tagging every
              // sub-heading inside the same coloured band).
              const key = `${el.className}|${Math.round(rect.top)}`;
              if (!seen.has(key)) {
                seen.add(key);
                h.setAttribute('data-excat-section-style', style);
              }
              break;
            }
          }
          el = el.parentElement;
        }
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('onLoad section-style detection failed:', e && e.message);
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

    // 1c. Normalise headings whose text is wrapped in href-less anchors. Some
    //     source titles author the text inside empty <a> tags, e.g. Learn's
    //     "Explore our learning paths": <h3><p><a></a><a>Explore our learning
    //     paths</a></p></h3>. Serialization turns the inner <a> into an empty-
    //     href link and drops the <h3>, so the section title renders as a broken
    //     link instead of a heading. Unwrap any href-less anchor inside a heading
    //     (replace it with its text) and drop empty anchors, so the heading text
    //     survives as a proper heading.
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      h.querySelectorAll('a').forEach((a) => {
        const href = a.getAttribute('href');
        if (!href || !href.trim()) {
          if (a.textContent.trim()) {
            a.replaceWith(document.createTextNode(a.textContent));
          } else {
            a.remove();
          }
        }
      });
      // Collapse a lone wrapping <p> left inside the heading so the text sits
      // directly in the heading element.
      h.querySelectorAll('p').forEach((pEl) => {
        if (!pEl.textContent.trim()) pEl.remove();
        else pEl.replaceWith(...pEl.childNodes);
      });
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
    // Capture each heading's detected section style (stamped in onLoad) BEFORE
    // rebuilding, keyed by the heading node, so we can emit a Section Metadata
    // block at the end of that heading's section.
    const contentNodes = [...main.querySelectorAll(CONTENT_SELECTOR)].filter(isContentNode);
    const rebuilt = document.createElement('div');
    let placed = 0;
    let pendingStyle = null; // style for the section currently being built
    const flushSectionMetadata = () => {
      if (!pendingStyle) return;
      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: pendingStyle },
      });
      rebuilt.append(metadataBlock);
      pendingStyle = null;
    };
    contentNodes.forEach((n) => {
      const isHeading = /^H[1-6]$/.test(n.tagName);
      const isPageMeta = n.tagName === 'TABLE' && /^metadata$/i.test((n.querySelector('th') ? n.querySelector('th').textContent.trim() : ''));
      // Start a new section before a heading, and before the trailing page
      // Metadata block, but never before the very first placed node.
      if (placed > 0 && (isHeading || isPageMeta)) {
        // Close the previous section with its Section Metadata (if styled)
        // BEFORE the section break, so the metadata belongs to that section.
        flushSectionMetadata();
        rebuilt.append(document.createElement('hr'));
      }
      // A heading that was stamped with a detected background opens a styled
      // section; remember the style so we can emit its Section Metadata when the
      // section closes.
      if (isHeading && n.getAttribute('data-excat-section-style')) {
        pendingStyle = n.getAttribute('data-excat-section-style');
        n.removeAttribute('data-excat-section-style');
      }
      rebuilt.append(n);
      placed += 1;
    });
    // Close the final section's metadata (before the trailing page Metadata is
    // appended by createMetadata — which already ran, so append at the very end).
    flushSectionMetadata();

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
