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

  const cells = [];

  // Row 2: background image (only if present).
  if (bgImage) cells.push([bgImage]);

  // Row 3: single content cell holding all text elements.
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero-home',
    cells,
  });
  element.replaceWith(block);
}
