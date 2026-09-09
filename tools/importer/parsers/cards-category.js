/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-category
 * Base block: cards (no images)
 * Source: https://www.dentsplysirona.com/en-us/shop
 * Instances: the "Shop top categories" / "Shop top brands" iconcard grids.
 *
 * Each matched element is the grid CONTAINER holding N icon-label link tiles
 * (.cmp-iconcard__wrapper-anchor). The source category glyphs are DS sprite
 * icons that are stripped at import, so each tile carries only its label link.
 * Follows the `cards (no images)` convention: one column, one row per tile,
 * each row's single cell holding the tile's link.
 */
export default function parse(element, { document }) {
  // The grid container also holds the section TITLE ("Shop top categories" /
  // "Shop top brands") and a trailing "All categories" / "All brands" link.
  // Capture the title heading BEFORE we replace the grid, so it survives as a
  // section heading (otherwise replaceWith destroys it and the section loses
  // its title).
  const titleEl = element.querySelector(
    '.title .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6',
  );
  const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';

  // Trailing "All X" section link (a tertiary button, not a tile).
  const allLink = Array.from(element.querySelectorAll('a.cmp-button')).find((a) => {
    const href = a.getAttribute('href');
    return href && href.trim() && a.textContent.trim();
  });

  // Tiles are the anchor-wrapped iconcards inside the grid.
  const tiles = Array.from(
    element.querySelectorAll('.cmp-iconcard__wrapper-anchor'),
  );

  const cells = [];
  tiles.forEach((tile) => {
    const href = tile.getAttribute('href');
    const labelEl = tile.querySelector(
      '.iconcard__title .cmp-title__text, .cmp-title__text, .cmp-label__text',
    );
    const text = (labelEl ? labelEl.textContent : tile.textContent)
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) return;

    const a = document.createElement('a');
    a.textContent = text;
    if (href) a.setAttribute('href', href);
    // One-column row: single cell holding the tile link.
    cells.push([a]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-category',
    cells,
  });

  // Emit the section title and the trailing "All X" link ADJACENT (title then
  // link), then the tile block. Keeping the heading + "see all" link together
  // lets the block CSS lay them out as one header row — the title left-aligned
  // and the link right-aligned on the same baseline — with the tile grid
  // filling the full width below.
  const frag = document.createDocumentFragment();
  if (titleText) {
    const h2 = document.createElement('h2');
    h2.textContent = titleText;
    frag.append(h2);
  }
  if (allLink) {
    const p = document.createElement('p');
    p.className = 'cards-category-all';
    const a = document.createElement('a');
    a.textContent = allLink.textContent.replace(/\s+/g, ' ').trim();
    a.setAttribute('href', allLink.getAttribute('href'));
    p.append(a);
    frag.append(p);
  }
  frag.append(block);
  element.replaceWith(frag);
}
