/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-quote
 * Base block: cards (no images)
 * Source: https://www.dentsplysirona.com/en-us
 * Instances: .quotecard
 * Generated: 2026-09-08
 *
 * Section 8: dark, text-only case-study cards (.quotecard.quotecard--dark).
 * Each card has a title, a descriptive paragraph, and a CTA link — no icon,
 * no photo. This maps to the `cards (no images)` variant, whose table has
 * 1 column and one row per card:
 *   row 1: block name (added by createBlock)
 *   each subsequent row: single content cell — heading, description, CTA.
 * Each matched .quotecard is a single card, so this parser emits a one-card
 * cards block (one content row). Selectors validated against
 * migration-work/block-context/cards-quote/source.html.
 */
export default function parse(element, { document }) {
  // Heading (validated: <h5 class="cmp-title__text"> inside .content .title).
  const heading = element.querySelector(
    '.content .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6',
  );

  // Description paragraph(s) (validated: .content .text .cmp-text > p).
  const description = element.querySelector(
    '.content .cmp-text, .cmp-text, .text',
  );

  // Optional call-to-action link(s) (validated: .button a.cmp-button).
  const ctaLinks = Array.from(
    element.querySelectorAll('.content a.cmp-button, a.cmp-button'),
  );

  // Empty-block guard: bail if there is no usable content.
  if (!heading && !description && !ctaLinks.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single-column (no images) card row: all content in one cell.
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);

  const cells = [];
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-quote',
    cells,
  });
  element.replaceWith(block);
}
