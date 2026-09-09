/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: course-teaser
 * Base block: cards (emits a cards-feature block)
 * Source: https://www.dentsplysirona.com/en-us/learn
 * Instances: .pagebreaker-wrapper
 *
 * The Learn page's "Find an in-person course" banner is authored as a
 * `.pagebreaker-wrapper` rather than a `.cmp-teaser`, so the shared
 * cards-feature parser (which keys off `.cmp-teaser__*`) does not pick it up
 * and the section was lost at import. The pagebreaker exposes:
 *   - title:       .page-break-title .cmp-title__text  (h3)
 *   - description: .page-break-subheading .cmp-title__text.sub-heading1
 *   - image:       an <img> (banner background)
 *   - CTA:         .page-break-button-container a
 * Emit a single-card cards-feature block: [ image , (heading, description, CTA) ].
 */
export default function parse(element, { document }) {
  const image = element.querySelector('img, .cmp-image__image');

  const heading = element.querySelector(
    '.page-break-title .cmp-title__text, .page-break-title h1, .page-break-title h2, .page-break-title h3',
  );

  // Description lives in a sub-heading title cell (not a .cmp-text). Convert it
  // to a real paragraph so the card renders it as body copy.
  const subEl = element.querySelector('.page-break-subheading .cmp-title__text');
  let description = null;
  if (subEl && subEl.textContent.trim()) {
    description = document.createElement('p');
    description.textContent = subEl.textContent.replace(/\s+/g, ' ').trim();
  }

  const ctaLinks = Array.from(
    element.querySelectorAll('.page-break-button-container a, a.cmp-button'),
  ).filter((a) => {
    const href = a.getAttribute('href');
    return href && href.trim() && !href.trim().startsWith('#');
  });

  // Empty-block guard.
  if (!heading && !description && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);

  // Two-column card row: image cell + text-content cell (cards-feature shape).
  const cells = [[image || '', contentCell]];

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-feature',
    cells,
  });
  element.replaceWith(block);
}
