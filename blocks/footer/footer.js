import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

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

  block.append(footer);
}
