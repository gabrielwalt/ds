import CATEGORY_ICONS from './icons.js';

/*
 * cards-category: a grid of bordered link tiles (icon + label) used by the
 * Shop page for "Shop top categories" and "Shop top brands". Unlike the
 * per-card blocks, ALL tiles are authored into one cards-category block as
 * separate rows: each row is [ label-link ].
 *
 * The source category tiles show a dental glyph left of the label from the DS
 * icon sprite (<use href="#EndodonticsRegular">), which is stripped at import.
 * We restore it here by matching the tile label to CATEGORY_ICONS and injecting
 * the extracted inline <svg>. Brand tiles have no icon in the source, so a tile
 * whose label doesn't match simply renders as a clean bordered label.
 */
function buildIconEl(icon) {
  const wrap = document.createElement('span');
  wrap.className = 'cards-category-icon';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', icon.viewBox || '0 0 60 60');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = icon.inner;
  wrap.append(svg);
  return wrap;
}

export default function decorate(block) {
  const grid = document.createElement('ul');
  grid.className = 'cards-category-grid';

  [...block.children].forEach((row) => {
    // Each row's last non-empty cell holds the tile's link/label.
    const link = row.querySelector('a');
    const li = document.createElement('li');
    li.className = 'cards-category-tile';

    let target;
    if (link) {
      link.classList.remove('button', 'primary', 'secondary', 'accent');
      link.classList.add('cards-category-link');
      target = link;
    } else {
      // No anchor — render the label text as a static tile.
      const span = document.createElement('span');
      span.className = 'cards-category-link';
      span.textContent = row.textContent.replace(/\s+/g, ' ').trim();
      if (!span.textContent) return;
      target = span;
    }

    // Restore the category glyph when the label matches a known category.
    const label = target.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
    const icon = CATEGORY_ICONS[label];
    if (icon) {
      // Wrap the label text so the icon sits inline before it.
      const textSpan = document.createElement('span');
      textSpan.className = 'cards-category-label';
      textSpan.textContent = target.textContent;
      target.textContent = '';
      target.append(buildIconEl(icon), textSpan);
    }

    li.append(target);
    grid.append(li);
  });

  block.textContent = '';
  block.append(grid);
}
