/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: carousel-promo
 * Base block: carousel
 * Source: https://www.dentsplysirona.com/en-us
 * Instances: .slider-container, .course-card-slider.contentfragmentlist
 * Re-validated against en-us DOM: 2026-09-08
 * Generated: 2026-09-08
 *
 * The `carousel` block table has 2 columns and one row per slide:
 *   [ image , text-content (label, title heading, description, CTAs) ].
 * Each matched element is a slider containing multiple slides, so this
 * parser iterates the slides and emits one row per slide.
 * Selectors validated against
 * migration-work/block-context/carousel-promo/source.html (promocards);
 * fallbacks added for the .course-card-slider.contentfragmentlist variant.
 */
export default function parse(element, { document }) {
  // Slides: swiper slides (promocards instance), AEM Core carousel items
  // (.cmp-carousel__item — category/learn/product-topic pages), or course-card
  // items (contentfragmentlist instance). Fall back to promocards/course cards
  // directly if there is no slide wrapper. De-duplicate the .cmp-carousel case
  // where the same slide is cloned for the infinite-loop track.
  let slides = Array.from(element.querySelectorAll(':scope .swiper-slide'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll(':scope .cmp-carousel__item'));
  }
  if (!slides.length) {
    slides = Array.from(
      element.querySelectorAll('.promocards, .course-card, .cmp-teaser'),
    );
  }

  const cells = [];

  slides.forEach((slide) => {
    // Image (mandatory first cell).
    const image = slide.querySelector(
      '.cmp-promocard__card-image img, .cmp-image__image, img',
    );

    // Label / category tag (e.g. "DIGITALE ZAHNHEILKUNDE" on promo cards,
    // "Connected Dentistry" / "ENDODONTICS" on course cards) shown above the
    // title. Course cards render two `.cmp-label__text` nodes per slide — the
    // first is a whitespace-only icon label, the second carries the real tag —
    // so pick the FIRST one with actual text rather than the first in the DOM.
    const label = Array.from(
      slide.querySelectorAll(
        '.cmp-promocard__card-label .cmp-label__text, .cmp-label__text',
      ),
    ).find((el) => el.textContent.trim());

    // Title, styled as a heading.
    const heading = slide.querySelector(
      '.cmp-promocard__card-title .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6',
    );

    // Description paragraph(s) if present (course-card variant).
    const description = slide.querySelector(
      '.cmp-promocard__card-text, .cmp-teaser__text, .cmp-text',
    );

    // CTA links: button1 and button2 (promocards), teaser buttons (course
    // cards), plus generic anchors. Only keep anchors with a usable href —
    // the course-card variant renders a decorative button1 <a> with no href
    // alongside the real button2 link, which would otherwise produce an
    // empty-href CTA.
    const ctaLinks = Array.from(
      slide.querySelectorAll(
        '.cmp-promocard__card-button1 a, .cmp-promocard__card-button2 a, .cmp-teaser__button a, a.cmp-button, .cmp-teaser__action-link',
      ),
    ).filter((a) => {
      const href = a.getAttribute('href');
      return href && href.trim() && !href.trim().startsWith('#');
    });

    const contentCell = [];
    if (label && label.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = label.textContent.trim();
      contentCell.push(p);
    }
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);

    // Skip empty slides (e.g. swiper duplicate/blank slides).
    if (!image && !contentCell.length) return;

    // Two-column slide row: image cell + text-content cell.
    cells.push([image || '', contentCell]);
  });

  // Empty-block guard: bail if no slides produced content.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'carousel-promo',
    cells,
  });
  element.replaceWith(block);
}
