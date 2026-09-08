/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHomeParser from './parsers/hero-home.js';
import carouselPromoParser from './parsers/carousel-promo.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsOverlayParser from './parsers/cards-overlay.js';

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
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Dentsply Sirona Swiss (de-ch) homepage: hero, promo carousel, feature/goal/contact card grids, photo-overlay navigational cards, and on-demand course carousel.',
  urls: [
    'https://www.dentsplysirona.com/de-ch',
  ],
  blocks: [
    {
      name: 'hero-home',
      instances: ['.hero.cmp-hero__banner-center--large', '.hero'],
    },
    {
      name: 'carousel-promo',
      instances: ['.slider-container', '.course-card-slider.contentfragmentlist'],
    },
    {
      name: 'cards-feature',
      instances: ['.teaser.basemarketingproperties', '.iconcard'],
    },
    {
      name: 'cards-overlay',
      instances: ['.imagetile'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero and promo carousel',
      selector: 'body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid.cmp__container--minus-mt-58',
      style: null,
      blocks: ['hero-home', 'carousel-promo'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Workflow features',
      selector: 'body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(2)',
      style: null,
      blocks: ['cards-feature'],
      defaultContent: ['.title'],
    },
    {
      id: 'section-3',
      name: 'Toolkit photo cards',
      selector: 'body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(3)',
      style: null,
      blocks: ['cards-overlay'],
      defaultContent: ['.title'],
    },
    {
      id: 'section-4',
      name: 'Goal-oriented tools (dark)',
      selector: 'body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(4)',
      style: 'dark',
      blocks: ['cards-feature'],
      defaultContent: ['.title'],
    },
    {
      id: 'section-5',
      name: 'On-demand courses carousel',
      selector: 'body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(5)',
      style: null,
      blocks: ['carousel-promo'],
      defaultContent: ['.title'],
    },
    {
      id: 'section-6',
      name: 'Dentsply Sirona advantage (blue)',
      selector: 'body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(6)',
      style: 'blue',
      blocks: ['cards-feature'],
      defaultContent: ['.title', '.text'],
    },
    {
      id: 'section-7',
      name: 'Single feature story',
      selector: 'body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(7)',
      style: null,
      blocks: [],
      defaultContent: ['.title', '.teaser'],
    },
    {
      id: 'section-8',
      name: 'Support and contact',
      selector: 'body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(8)',
      style: null,
      blocks: ['cards-feature'],
      defaultContent: ['.title'],
    },
  ],
};

// TRANSFORMER REGISTRY
// Order: cleanup (removes chrome) → dm-images (rewrites DM imgs to anchors,
// afterTransform, after parsers build their cells) → sections (adds <hr>
// breaks + section metadata, afterTransform). Section transformer only runs
// when the template has 2+ sections.
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
        // Guard against the same element matching multiple selectors of the
        // same block definition (e.g. `.hero` also matching a more specific
        // `.hero.cmp-hero__...`).
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
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

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

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Output path. This homepage is imported to `/index` per the migration
    //    request (source URL /de-ch maps to the site homepage index.html).
    const path = WebImporter.FileUtils.sanitizePath('/index');

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
