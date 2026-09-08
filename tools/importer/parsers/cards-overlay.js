/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-overlay
 * Base block: cards
 * Source: https://www.dentsplysirona.com/en-us
 * Instances: .imagetile
 * Re-validated against en-us DOM: 2026-09-08
 * Generated: 2026-09-08
 *
 * The `cards` block table has 2 columns per card row:
 *   [ image , text-content (title heading, optional description, CTA) ].
 * Each matched .imagetile is a single photo-overlay card. Selectors
 * validated against migration-work/block-context/cards-overlay/source.html.
 */
export default function parse(element, { document }) {
  // Image (mandatory first cell).
  const image = element.querySelector(
    '.cmp-imagetile__image-wrapper img, .cmp-image__image, img',
  );

  // Title, styled as a heading (validated: <h5 class="cmp-title__text">).
  const heading = element.querySelector(
    '.cmp-imagetile__content-wrapper .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6',
  );

  // Optional description text.
  const description = element.querySelector(
    '.cmp-imagetile__content-wrapper .cmp-text, .cmp-text',
  );

  // Call-to-action link(s).
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-imagetile__content-wrapper a.cmp-button, a.cmp-button'),
  );

  // Empty-block guard.
  if (!image && !heading && !description) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);

  const cells = [];
  // Two-column card row: image cell + text-content cell.
  cells.push([image || '', contentCell]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-overlay',
    cells,
  });
  element.replaceWith(block);
}
