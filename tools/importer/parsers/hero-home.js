/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero-home
 * Base block: hero
 * Source: https://www.dentsplysirona.com/en-us
 * Instances: .hero.cmp-hero__banner-center--large, .hero
 * Re-validated against en-us DOM: 2026-09-08
 * Generated: 2026-09-08
 *
 * The `hero` block table has 1 column and up to 3 rows:
 *   row 1: block name (added by createBlock)
 *   row 2: background image (optional)
 *   row 3: content cell — title (heading), subheading, optional CTAs.
 * Selectors validated against
 * migration-work/block-context/hero-home/source.html.
 */
export default function parse(element, { document }) {
  // Background image (optional row).
  const bgImage = element.querySelector(
    '.cmp-hero__bannerimg-div img, .cmp-hero__img-div img, .cmp-image__image, img',
  );

  // Title, styled as a heading (validated: <h1 class="cmp-maintitle__text">).
  const heading = element.querySelector(
    '.cmp-hero__title .cmp-maintitle__text, .cmp-maintitle__text, .cmp-hero__title h1, h1, h2',
  );

  // Normalise the heading to a plain-text heading. The `.hero_slide` /
  // `.hero_ad` hero variant (category, learn-education, support/download-center
  // pages) authors the title as `<h1 class="cmp-maintitle__text"><span>Text
  // </span></h1>`. That inner <span> broke the markdown table-cell
  // serialization, so the whole hero content cell came out EMPTY (lost the
  // title). Replacing the heading's contents with its plain text collapses the
  // span so the title round-trips reliably, matching the working heroes.
  if (heading) {
    const text = heading.textContent.replace(/\s+/g, ' ').trim();
    if (text) heading.textContent = text;
  }

  // Subheading / additional text (validated: .cmp-hero__subheading .cmp-text > p).
  const subheading = element.querySelector(
    '.cmp-hero__subheading .cmp-text, .cmp-hero__subheading, .cmp-text',
  );

  // Optional call-to-action link(s).
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-hero__btn-container a.cmp-button, a.cmp-button'),
  );

  // Empty-block guard.
  if (!heading && !subheading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Shop-hero variant: the Shop landing hero uses a left-aligned, shorter
  // banner (source .cmp-shophero* / .cmp-hero__banner-left--small) with the
  // photo on the right and a solid blue PILL button ("Log in to order") rather
  // than the tall, centered, text-link homepage hero. Emit a `hero-home (shop)`
  // block so the CSS can style this variant distinctly, and wrap its CTA in
  // <strong> so EDS decorateButtons() promotes it to a primary (filled) button.
  const isShopHero = /cmp-shophero|cmp-hero__banner-left/.test(element.className);
  // The CTA elements pushed into the content cell. For the shop hero, wrap each
  // link in <strong> (EDS decorateButtons() promotes <strong><a> to a filled
  // primary button) and push the WRAPPER, not the bare anchor.
  const ctaCells = ctaLinks.map((a) => {
    if (!isShopHero) return a;
    const strong = document.createElement('strong');
    strong.append(a.cloneNode(true));
    return strong;
  });

  const cells = [];

  // Row 2: background image. ALWAYS emit this row — with an empty cell when the
  // hero has no image — so the block table keeps a consistent 2-row shape. A
  // hero with only a single (content) row round-trips through md2da as an empty
  // block: the category / learn-education / support heroes that ship no banner
  // image were losing their title entirely. The empty image cell fixes that and
  // is harmless (hero-home.js / CSS treat a missing picture as the no-image
  // variant).
  cells.push([bgImage || '']);

  // Row 3: single content cell holding all text elements.
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaCells);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: isShopHero ? 'hero-home (shop)' : 'hero-home',
    cells,
  });
  element.replaceWith(block);
}
