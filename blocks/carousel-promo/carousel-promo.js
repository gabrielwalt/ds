/**
 * Normalise a Scene7 product-tile URL to its natural (authored) rendition.
 *
 * The DM auto-block renders promo images with a `wid=2000` (+ `fmt`/`dpr`)
 * override. Combined with the source's `$transparent-image$` preset — which
 * caps height at 300px — Scene7 returns a 2000x300 strip. `object-fit:contain`
 * then shrinks that strip to ~56px tall inside the 374x298 image box, so the
 * product renders tiny. The source uses the bare URL (`?ts=…&$transparent-
 * image$&dpr=off`) which returns the natural ~300x300 square. Dropping the
 * `wid`/`hei`/`fmt`/`dpr` params restores that square. Keeps other params.
 */
function toNaturalTileUrl(src) {
  try {
    const u = new URL(src, window.location.href);
    ['wid', 'hei', 'fmt', 'dpr'].forEach((param) => u.searchParams.delete(param));
    return u.toString();
  } catch (e) {
    return src;
  }
}

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-promo');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-promo-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-promo-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

// Hide the prev arrow at the far-left of the track and the next arrow at the
// far-right, matching the source (which shows only the forward arrow at the
// start). Driven by the track's scroll position so it is correct regardless of
// how many slides are in view (1 mobile / 2 tablet / 3 desktop).
function updateArrows(block) {
  const track = block.querySelector('.carousel-promo-slides');
  const prev = block.querySelector('.slide-prev');
  const next = block.querySelector('.slide-next');
  if (!track) return;
  const maxScroll = track.scrollWidth - track.clientWidth;
  if (prev) prev.hidden = track.scrollLeft <= 1;
  if (next) next.hidden = track.scrollLeft >= maxScroll - 1;
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-promo-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-promo-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-promo-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-promo-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });

  // Prev/next arrow visibility tracks the track's scroll position.
  const track = block.querySelector('.carousel-promo-slides');
  if (track) {
    track.addEventListener('scroll', () => updateArrows(block), { passive: true });
    window.addEventListener('resize', () => updateArrows(block));
    // Recompute once layout has settled (slide widths depend on lazy images);
    // a bare initial call can run while scrollWidth still equals clientWidth.
    requestAnimationFrame(() => updateArrows(block));
    window.addEventListener('load', () => updateArrows(block));
    // Re-measure when the track itself resizes (images arriving, font swap).
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => updateArrows(block)).observe(track);
    }
  }
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-promo-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-promo-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-promo-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  // Classify CTAs and, for promo cards, reorder to match the source layout
  // (eyebrow -> title -> tertiary CTA -> image -> filled pill at the bottom).
  const content = slide.querySelector('.carousel-promo-slide-content');
  const image = slide.querySelector('.carousel-promo-slide-image');
  if (content) {
    const ctas = [...content.querySelectorAll(':scope > p')].filter((p) => p.querySelector('a'));
    const headingFirst = content.firstElementChild
      && /^H[1-6]$/.test(content.firstElementChild.tagName);
    ctas.forEach((p) => p.classList.add('carousel-promo-cta'));

    // Promo card = eyebrow-led with two CTAs: the last CTA is a filled pill that
    // sits below the image; the course card is heading-led with a single tertiary
    // text link and keeps its image on top.
    if (!headingFirst && ctas.length >= 2) {
      slide.classList.add('carousel-promo-slide-promo');
      const primary = ctas[ctas.length - 1];
      primary.classList.add('carousel-promo-cta-primary');
      if (image) {
        // Point the transparent product tile at its natural ~300x300 rendition
        // instead of the wid=2000 (2000x300) strip, so it fills the card image
        // box instead of shrinking to a thin sliver. Drop the wide <source>
        // renditions so the browser can't re-select the 2000px strip.
        const original = image.querySelector('img');
        if (original) {
          original.src = toNaturalTileUrl(original.src);
          if (original.srcset) original.srcset = toNaturalTileUrl(original.srcset);
          image.querySelectorAll('source').forEach((s) => s.remove());
        }
        slide.append(image); // move image below the text content
      }
      slide.append(primary); // move the filled pill to the bottom of the card
    }

    ctas.forEach((p) => {
      if (!p.classList.contains('carousel-promo-cta-primary')) {
        p.classList.add('carousel-promo-cta-tertiary');
      }
    });
  }

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-promo-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  // This project's aem.js does not export fetchPlaceholders; rely on the
  // hardcoded fallback strings below (placeholders lookups all use `|| '...'`).
  const placeholders = {};

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-promo-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-promo-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-promo-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-promo-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-promo-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
