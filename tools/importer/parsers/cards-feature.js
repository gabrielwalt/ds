/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-feature
 * Base block: cards
 * Source: https://www.dentsplysirona.com/en-us
 * Instances: .teaser.basemarketingproperties, .iconcard
 * Re-validated against en-us DOM: 2026-09-08
 * Generated: 2026-09-08
 *
 * The `cards` block table has 2 columns per card row:
 *   [ image/icon , text-content (heading, description, optional CTA) ].
 * Each matched element is a single card (teaser or iconcard), so this
 * parser emits a one-card cards block. Selectors validated against
 * migration-work/block-context/cards-feature/source.html.
 */
export default function parse(element, { document }) {
  // Image / icon (mandatory first cell). Teaser uses .cmp-teaser__image img;
  // iconcard variants may expose the icon/image differently.
  const image = element.querySelector(
    '.cmp-teaser__image img, .cmp-image__image, img',
  );

  // Heading (validated: <h5 class="cmp-title__text"> inside .cmp-teaser__title).
  const heading = element.querySelector(
    '.cmp-teaser__title .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6',
  );

  // Description paragraphs (validated: .cmp-teaser__text .cmp-text > p).
  const description = element.querySelector(
    '.cmp-teaser__text .cmp-text, .cmp-teaser__text, .cmp-text',
  );

  // Optional call-to-action link(s). Skip CTAs inside a hidden (`.d-none`
  // bootstrap utility → display:none) container: some teasers ship a second,
  // author-hidden secondary action (e.g. Explore's Primescan banner hides a
  // "Learn more" → one-ds.html), which the source never renders. Capturing it
  // produced a duplicate visible "Learn more" link in the imported card.
  const ctaLinks = Array.from(
    element.querySelectorAll(
      '.cmp-teaser__action-link, .cmp-teaser__cta a, .cmp-button, a.cmp-teaser__action-link',
    ),
  ).filter((a) => !a.closest('.d-none'));

  // Empty-block guard: bail if there is no usable content.
  if (!heading && !description && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);

  const cells = [];
  // Two-column card row: image cell + text-content cell.
  // Pad the image cell with '' when no image so the row keeps 2 columns.
  cells.push([image || '', contentCell]);

  // Shop teaser variants. The Shop page reuses this block for two distinct
  // source teaser styles that must NOT render as the default centered feature
  // card:
  //   • .cmp-shop-teaser--banner    → wide horizontal banner, image on the
  //     RIGHT, left-aligned title/description + filled CTA button ("Build your
  //     EV implant treatment", "The more you buy, the more you earn!").
  //   • .cmp-shop-teaser--promotion → compact promo card with small,
  //     LEFT-aligned text (the "Buy N packs…" offers).
  // Emit a variant so CSS can target it; leave every other cards-feature use
  // (homepage/other pages) on the default style.
  let name = 'cards-feature';
  if (/cmp-shop-teaser--banner/.test(element.className)) name = 'cards-feature (banner)';
  else if (/cmp-shop-teaser--promotion/.test(element.className)) name = 'cards-feature (promotion)';

  const block = WebImporter.Blocks.createBlock(document, {
    name,
    cells,
  });
  element.replaceWith(block);
}
