/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHomeParser from './parsers/hero-home.js';
import carouselPromoParser from './parsers/carousel-promo.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsOverlayParser from './parsers/cards-overlay.js';
import cardsQuoteParser from './parsers/cards-quote.js';

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
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Dentsply Sirona (en-us) homepage: hero, promo carousel, icon feature card grids, photo-overlay toolkit tiles, course carousel, and text case-study cards.',
  urls: [
    'https://www.dentsplysirona.com/en-us',
  ],
  blocks: [
    {
      name: 'hero-home',
      instances: ['.hero.cmp-hero__banner-center--large', '.hero'],
    },
    {
      name: 'carousel-promo',
      instances: ['.slider-container'],
    },
    {
      name: 'cards-feature',
      instances: ['.teaser.basemarketingproperties', '.iconcard'],
    },
    {
      name: 'cards-overlay',
      instances: ['.imagetile'],
    },
    {
      name: 'cards-quote',
      instances: ['.quotecard'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero',
      selector: 'body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.hero.cmp-hero__banner-center--large.cmp-hero__white-title-style:nth-of-type(1)',
      style: null,
      blocks: ['hero-home'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Promo carousel',
      selector: 'body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid.cmp__container--minus-mt-58:nth-of-type(2)',
      style: null,
      blocks: ['carousel-promo'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Workflow features',
      selector: 'body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(3)',
      style: 'grey-soft',
      blocks: ['cards-feature'],
      defaultContent: ['.title'],
    },
    {
      id: 'section-4',
      name: 'Toolkit photo tiles',
      selector: 'body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(4)',
      style: 'grey',
      blocks: ['cards-overlay'],
      defaultContent: ['.title'],
    },
    {
      id: 'section-5',
      name: 'Goal tools (dark)',
      selector: 'body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(5)',
      style: 'dark',
      blocks: ['cards-feature'],
      defaultContent: ['.title'],
    },
    {
      id: 'section-6',
      name: 'Course carousel',
      selector: 'body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(6)',
      style: null,
      blocks: ['carousel-promo'],
      defaultContent: ['.title'],
    },
    {
      id: 'section-7',
      name: 'Advantage (blue)',
      selector: 'body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(7)',
      style: 'blue',
      blocks: ['cards-feature'],
      defaultContent: ['.title', '.text'],
    },
    {
      id: 'section-8',
      name: 'Case-study cards (dark)',
      selector: 'body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(8)',
      style: 'dark',
      blocks: ['cards-quote'],
      defaultContent: ['.title'],
    },
    {
      id: 'section-9',
      name: 'Contact features',
      selector: 'body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(9)',
      style: null,
      blocks: ['cards-feature'],
      defaultContent: ['.title'],
    },
  ],
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
    // Section CTA buttons: match by known href + visible label, scoped to their
    // section grids so we don't catch nav/footer/other buttons.
    const SECTION_CTAS = [
      { heading: 'Dentsply Sirona Advantage', label: 'Learn more', href: 'https://www.dentsplysirona.com/en-us/why-ds.html' },
      { heading: "find what you need", label: 'Visit support', href: 'https://www.dentsplysirona.com/en-us/support.html' },
      { heading: 'Training to meet you where you are', label: 'Explore Academy', href: 'https://www.dentsplysirona.com/en-us/learn.html' },
    ];
    SECTION_CTAS.forEach(({ heading, label, href }) => {
      const h = [...main.querySelectorAll('h1, h2, h3, h4')].find((el) => el.textContent.includes(heading));
      if (!h) return;
      const section = h.closest('div.bootstrap-grid') || h.parentElement;
      if (!section) return;
      // Avoid duplicating if a matching button paragraph is already present.
      if ([...section.querySelectorAll('a')].some((a) => a.textContent.trim() === label && a.closest('p'))) return;
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      strong.append(a);
      p.append(strong);
      section.append(p);
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
    main.textContent = '';
    main.append(rebuilt);

    // 6. Output path. The source homepage is www.dentsplysirona.com/en-us, so
    //    it belongs at `/en-us` — the folder index of the en-us locale, making
    //    it a true SIBLING of /en-us/explore, /en-us/learn, /en-us/shop, etc.
    //    EDS serves `en-us/index` at the `/en-us/` path.
    const path = WebImporter.FileUtils.sanitizePath('/en-us/index');

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
