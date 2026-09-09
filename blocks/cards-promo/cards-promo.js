import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * cards-promo: the eyebrow-labelled promo cards that sit over the Shop hero
 * (Featured Promotion / Featured Product / Loyalty Program). Each block
 * instance is ONE card; sibling instances form a responsive row (see CSS).
 *
 * Follows the `cards` convention: a 2-column row —
 *   [ image , text-content (eyebrow label paragraph, title heading, CTA link) ].
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];

  const imageCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
  const contentCell = cells.find((c) => c !== imageCell) || cells[1];

  const card = document.createElement('div');
  card.className = 'cards-promo-card';

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'cards-promo-body';

  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-promo-image';
  const pic = imageCell && (imageCell.querySelector('picture') || imageCell.querySelector('img'));
  if (pic) imageDiv.append(pic);

  if (contentCell) {
    // First paragraph = eyebrow label; heading = title; anchor = CTA pill.
    const label = contentCell.querySelector('p');
    if (label) {
      label.className = 'cards-promo-label';
      bodyDiv.append(label);
    }
    const heading = contentCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) bodyDiv.append(heading);

    const link = contentCell.querySelector('a');
    if (link) {
      link.classList.remove('button', 'primary', 'secondary', 'accent');
      link.classList.add('cards-promo-cta');
      const container = link.closest('.button-container');
      if (container) container.classList.remove('button-container');
      // Image sits between the title block and the CTA.
      if (imageDiv.childElementCount) bodyDiv.append(imageDiv);
      const ctaWrap = document.createElement('div');
      ctaWrap.className = 'cards-promo-cta-wrap';
      ctaWrap.append(link);
      bodyDiv.append(ctaWrap);
    } else if (imageDiv.childElementCount) {
      bodyDiv.append(imageDiv);
    }
  }

  // Optimise the promo image (Scene7 rendition, keep native aspect ratio).
  const img = imageDiv.querySelector('img');
  if (img) {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    const newImg = optimized.querySelector('img');
    if (newImg && newImg.src.includes('scene7.com') && !newImg.src.includes('fit=')) {
      newImg.src = `${newImg.src}&fit=constrain`;
    }
    optimized.querySelectorAll('source').forEach((s) => {
      if (s.srcset && s.srcset.includes('scene7.com') && !s.srcset.includes('fit=')) {
        s.srcset = s.srcset.replace(/(scene7\.com\/[^\s,]*)/g, '$1&fit=constrain');
      }
    });
    img.closest('picture').replaceWith(optimized);
  }

  card.append(bodyDiv);
  block.textContent = '';
  block.append(card);
}
