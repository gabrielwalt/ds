import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { iconSvg } from './icons.js';

// The canonical host for on-site pages. Any footer link pointing elsewhere
// (investor.*, coresupport.*, dentsplysironawelcome.us, …) is treated as an
// external link and gets an external-link glyph.
const PRIMARY_HOST = 'www.dentsplysirona.com';

// Social links, keyed by the hostname fragment in their href, mapped to the
// brand glyph + accessible label the source uses.
const SOCIAL = [
  { match: 'facebook', name: 'Facebook' },
  { match: 'instagram', name: 'Instagram' },
  { match: 'linkedin', name: 'LinkedIn' },
];

/**
 * Decorate the footer links: mark accent (orange) links, add external-link and
 * phone glyphs, turn the region label + social links into icons.
 * @param {Element} footer decorated footer root
 */
function decorateLinks(footer) {
  // The three fragment blocks (link columns, locale+social, legal) are the
  // top-level children — decorateMain tags them `.section`, but fall back to
  // the raw children so this works before/after section decoration.
  const blocks = footer.querySelectorAll(':scope > .section');
  const localeSection = blocks[1] || footer.children[1];

  footer.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href') || '';

    // Accent links are flagged in the fragment with <em> (portable across DA):
    // unwrap the emphasis and colour the whole link via a class instead.
    const em = a.querySelector('em');
    if (em) {
      a.classList.add('footer-link-accent');
      em.replaceWith(...em.childNodes);
    }

    // Social links → white brand glyph (keep the text as an aria-label).
    const social = SOCIAL.find((s) => href.includes(s.match));
    if (social && a.closest('.footer-social, p')) {
      const label = a.textContent.trim();
      a.classList.add('footer-social-link');
      a.setAttribute('aria-label', label);
      a.innerHTML = iconSvg(social.name, 20);
      return;
    }

    // Contact us → leading phone glyph.
    if (/contact-support/.test(href)) {
      a.classList.add('footer-link-icon', 'footer-link-phone');
      a.insertAdjacentHTML('afterbegin', iconSvg('Phone', 16));
      return;
    }

    // External links → trailing external-link glyph.
    try {
      const { hostname } = new URL(href, 'https://www.dentsplysirona.com');
      if (hostname && hostname !== PRIMARY_HOST) {
        a.classList.add('footer-link-icon', 'footer-link-external');
        a.insertAdjacentHTML('beforeend', iconSvg('ExternalLink', 14));
      }
    } catch (e) {
      /* relative or malformed href — leave as-is */
    }
  });

  // Region label (first paragraph of the locale row) → leading globe glyph.
  if (localeSection) {
    const regionP = localeSection.querySelector('p');
    if (regionP && !regionP.querySelector('a')) {
      regionP.classList.add('footer-region');
      regionP.insertAdjacentHTML('afterbegin', iconSvg('Globe', 20));
    }
    // The social row is the paragraph that holds the social links.
    const socialP = [...localeSection.querySelectorAll('p')]
      .find((p) => p.querySelector('.footer-social-link'));
    if (socialP) socialP.classList.add('footer-social');
  }
}

// Below this width the single-column footer collapses each link column into an
// accordion; at/above it the multi-column grid shows every column expanded.
// Kept in sync with footer.css `@media (width < 600px)`.
const isFooterDesktop = window.matchMedia('(min-width: 600px)');

/**
 * On mobile, turn each link-column heading into an accordion toggle: tapping it
 * expands/collapses that column's link list. Columns with more than one link
 * get a chevron; a single-link column (e.g. Contact) stays a plain heading.
 * Desktop keeps every column open (no toggling).
 * @param {Element} footer decorated footer root
 */
function decorateAccordions(footer) {
  const linkSection = footer.querySelector(':scope > .section:first-child')
    || footer.firstElementChild;
  if (!linkSection) return;

  linkSection.querySelectorAll(':scope > div').forEach((col) => {
    const heading = col.querySelector('h3');
    const list = col.querySelector('ul');
    if (!heading || !list) return;
    // Single-link columns (Contact) aren't collapsible.
    if (list.querySelectorAll('li').length <= 1) return;

    col.classList.add('footer-col-accordion');
    heading.setAttribute('role', 'button');
    heading.setAttribute('tabindex', '0');

    const setOpen = (open) => {
      col.setAttribute('aria-expanded', open ? 'true' : 'false');
      heading.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    // Start collapsed on mobile, open on desktop.
    setOpen(isFooterDesktop.matches);

    const toggle = () => {
      if (isFooterDesktop.matches) return; // desktop: always open
      setOpen(col.getAttribute('aria-expanded') !== 'true');
    };
    heading.addEventListener('click', toggle);
    heading.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        toggle();
      }
    });

    // Keep columns open on desktop and reset to collapsed on mobile when the
    // viewport crosses the breakpoint.
    isFooterDesktop.addEventListener('change', () => setOpen(isFooterDesktop.matches));
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment. Prefer explicit `footer` metadata; otherwise try
  // the local content fragment (/content/footer — served on localhost) first,
  // then the site-root /footer that DA/EDS publishes to. loadFragment returns
  // null on a non-OK fetch, so the || chain falls through to the first hit.
  const footerMeta = getMetadata('footer');
  let fragment = null;
  if (footerMeta) {
    fragment = await loadFragment(new URL(footerMeta, window.location).pathname);
  } else {
    fragment = await loadFragment('/content/footer') || await loadFragment('/footer');
  }

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  decorateLinks(footer);
  decorateAccordions(footer);

  block.append(footer);
}
