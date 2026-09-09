/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-promo
 * Base block: cards
 * Source: https://www.dentsplysirona.com/en-us/shop
 * Instances: .promocards.cmp-shop--promocards
 *
 * Each matched .promocards element is a single eyebrow-labelled promo card
 * (Featured Promotion / Featured Product / Loyalty Program). Follows the
 * `cards` convention: a 2-column row per card —
 *   [ image , text-content (eyebrow label, title heading, CTA) ].
 */
export default function parse(element, { document }) {
  // Eyebrow label (e.g. "Featured Promotion").
  const label = element.querySelector('.cmp-label__text');

  // Title heading.
  const heading = element.querySelector(
    '.cmp-promocard__card-title .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6',
  );

  // Card image.
  const image = element.querySelector('.cmp-promocard__card-image img, .cmp-image__image, img');

  // CTA: keep the button link that has visible text and a usable href
  // (the source ships a duplicate icon-only anchor with no text).
  const ctaLinks = Array.from(
    element.querySelectorAll(
      '.cmp-promocard__card-button1 a, .cmp-promocard__card-button2 a, a.cmp-button, a',
    ),
  ).filter((a) => {
    const href = a.getAttribute('href');
    return href && href.trim() && !href.trim().startsWith('#');
  });
  // Prefer the anchor that carries visible label text; fall back to the first.
  const cta = ctaLinks.find((a) => a.textContent.trim()) || ctaLinks[0];

  // Empty-block guard.
  if (!heading && !image && !label) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Text-content cell: eyebrow label (as a paragraph), title, then CTA.
  const contentCell = [];
  if (label && label.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = label.textContent.trim();
    contentCell.push(p);
  }
  if (heading) contentCell.push(heading);
  if (cta) contentCell.push(cta);

  // Two-column card row: image cell + text-content cell.
  const cells = [[image || '', contentCell]];

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-promo',
    cells,
  });
  element.replaceWith(block);
}
