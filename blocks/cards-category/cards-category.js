/*
 * cards-category: a grid of bordered link tiles (icon + label) used by the
 * Shop page for "Shop top categories" and "Shop top brands". Unlike the
 * per-card blocks, ALL tiles are authored into one cards-category block as
 * separate rows: each row is [ label-link ] (categories also carry an icon
 * cell, but the source's dental sprite glyphs are stripped at import, so a
 * tile renders as a clean bordered label — matching the brand tiles exactly).
 */
export default function decorate(block) {
  const grid = document.createElement('ul');
  grid.className = 'cards-category-grid';

  [...block.children].forEach((row) => {
    // Each row's last non-empty cell holds the tile's link/label.
    const link = row.querySelector('a');
    const li = document.createElement('li');
    li.className = 'cards-category-tile';

    if (link) {
      link.classList.remove('button', 'primary', 'secondary', 'accent');
      link.classList.add('cards-category-link');
      li.append(link);
    } else {
      // No anchor — render the label text as a static tile.
      const span = document.createElement('span');
      span.className = 'cards-category-link';
      span.textContent = row.textContent.replace(/\s+/g, ' ').trim();
      if (!span.textContent) return;
      li.append(span);
    }
    grid.append(li);
  });

  block.textContent = '';
  block.append(grid);
}
