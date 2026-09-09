/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: video
 * Base block: video
 * Source: https://www.dentsplysirona.com/en-us/learn.html "Watch, learn, improve"
 * Instances: .videoslider (carousel of `.cmp-videocard` thumbnails)
 *
 * Each video card contributes one row: [ thumbnail image , title (+link) ].
 * Cards without a thumbnail or title are skipped (the source lazy-hydrates the
 * swiper, so some placeholder shells may be present).
 */
export default function parse(element, { document }) {
  let cards = Array.from(
    element.querySelectorAll('.cmp-videocard, [class*="videocard"]'),
  );
  // Fallback: swiper slides directly under the slider.
  if (!cards.length) {
    cards = Array.from(element.querySelectorAll('.swiper-slide'));
  }

  const cells = [];
  cards.forEach((card) => {
    const image = card.querySelector('img');
    const heading = card.querySelector(
      '.cmp-title__text, .cmp-videocard__title, h1, h2, h3, h4, h5, h6',
    );
    const link = card.querySelector('a[href]');

    if (!image && !heading) return; // skip empty placeholder shells

    const textCell = [];
    if (heading) {
      if (link) {
        const a = document.createElement('a');
        a.setAttribute('href', link.getAttribute('href'));
        a.textContent = heading.textContent.trim();
        textCell.push(a);
      } else {
        textCell.push(heading);
      }
    } else if (link) {
      textCell.push(link);
    }

    cells.push([image || '', textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'video',
    cells,
  });
  element.replaceWith(block);
}
