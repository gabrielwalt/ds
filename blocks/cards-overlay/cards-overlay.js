/**
 * cards-overlay: navigational photo card with a dark gradient overlay,
 * an overlaid title and a "Mehr anzeigen" CTA. Each block instance renders
 * a single card; multiple sibling instances form a responsive grid (see CSS).
 */

/**
 * Normalise a Scene7 tile image URL to its authored preset crop.
 *
 * The DM auto-block renders these images with a `wid=2000` (and `fmt`/`dpr`)
 * override, which discards the Scene7 `:Small` PRESET crop and returns the raw
 * 2000x500 (4:1) master. object-fit:cover then scales that banner up to fill
 * the tall (~424x504) tile, so only a thin center slice shows (over-zoom).
 * Removing the `wid`/`fmt`/`dpr` params lets Scene7 serve the `:Small` preset
 * (~576x500, ~1.15:1) — the exact rendition the source uses, which cover-fits
 * the tile with only a slight side crop. Keeps every other query param intact.
 */
function toPresetCropUrl(src) {
  try {
    const u = new URL(src, window.location.href);
    ['wid', 'hei', 'fmt', 'dpr'].forEach((param) => u.searchParams.delete(param));
    return u.toString();
  } catch (e) {
    return src;
  }
}
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];

  // Identify the image cell (contains a picture/img) and the content cell.
  const imageCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
  const contentCell = cells.find((c) => c !== imageCell) || cells[1];

  const card = document.createElement('div');
  card.className = 'cards-overlay-card';

  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-overlay-image';
  const pic = imageCell && imageCell.querySelector('picture');
  const img = imageCell && imageCell.querySelector('img');
  if (pic) {
    imageDiv.append(pic);
  } else if (img) {
    imageDiv.append(img);
  }

  const contentDiv = document.createElement('div');
  contentDiv.className = 'cards-overlay-content';
  if (contentCell) {
    while (contentCell.firstElementChild) contentDiv.append(contentCell.firstElementChild);
  }

  // Undo EDS auto button decoration so the CTA renders as a plain overlay link.
  contentDiv.querySelectorAll('a.button').forEach((a) => {
    a.classList.remove('button', 'primary', 'secondary', 'accent');
    a.classList.add('cards-overlay-cta');
    const p = a.closest('.button-container');
    if (p) p.classList.remove('button-container');
  });
  contentDiv.querySelectorAll('a:not(.cards-overlay-cta)').forEach((a) => {
    a.classList.add('cards-overlay-cta');
  });

  card.append(imageDiv, contentDiv);

  // Point the image at its Scene7 preset crop (~576x500) instead of the
  // wid=2000 (4:1) master, so object-fit:cover fills the tile without the
  // heavy over-zoom. Also drop any <source> renditions that carry the wide
  // override so the browser can't pick the 2000px banner back up.
  const original = imageDiv.querySelector('img');
  if (original) {
    original.src = toPresetCropUrl(original.src);
    if (original.srcset) original.srcset = toPresetCropUrl(original.srcset);
    imageDiv.querySelectorAll('source').forEach((s) => s.remove());
  }

  block.textContent = '';
  block.append(card);
}
