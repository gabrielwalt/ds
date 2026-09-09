import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  // Desktop only: collapse an open mega panel when focus leaves the nav. On
  // mobile the menu is a full-screen overlay dismissed via the hamburger X /
  // back bar / outside click — NOT on focusout (tapping a menu item shifts
  // focus and would otherwise close the whole overlay before the drill-in).
  if (!isDesktop.matches) return;
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  // Always collapse every section when the hamburger toggles, so the mobile
  // menu opens at level 1 (the list of top items) rather than dumping every
  // mega menu open at once. Drilling into a section is a separate interaction.
  toggleAllNavSections(navSections, 'false');
  if (navSections) navSections.classList.remove('nav-drilled');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment. Prefer an explicit `nav` metadata path; otherwise try
  // the local content fragment (/content/nav — where the imported fragment
  // lives and is served on localhost) first, then the site-root /nav that DA/EDS
  // publishes to. loadFragment returns null on a non-OK fetch, so the ?? chain
  // falls through to the first path that resolves.
  const navMeta = getMetadata('nav');
  let fragment = null;
  if (navMeta) {
    fragment = await loadFragment(new URL(navMeta, window.location).pathname);
  } else {
    fragment = await loadFragment('/content/nav') || await loadFragment('/nav');
  }

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button') || navBrand.querySelector('a');
  if (brandLink) {
    brandLink.className = '';
    const container = brandLink.closest('.button-container');
    if (container) container.className = '';
    // Inject the DS logo from the code repo. The SVG (~55KB) is NOT embedded in
    // the nav fragment because DA rejects fragment images over 40KB; the
    // fragment carries only the accessible brand text, which we swap for the
    // logo <img> here. Alt text comes from the link's original text.
    const alt = brandLink.textContent.trim() || 'Dentsply Sirona';
    brandLink.textContent = '';
    const logo = document.createElement('img');
    logo.src = '/icons/ds-logo.svg';
    logo.alt = alt;
    logo.className = 'nav-brand-logo';
    logo.loading = 'eager';
    brandLink.append(logo);
  }

  // Search bar (like the source): a rounded pill with a leading magnifying-
  // glass glyph, placed in the tools area to the left of the Log In button.
  // Submitting routes to the site search results page with the query.
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const search = document.createElement('form');
    search.className = 'nav-search';
    search.action = 'https://www.dentsplysirona.com/en-us/search.html';
    search.method = 'get';
    search.setAttribute('role', 'search');
    search.innerHTML = `
      <button type="submit" class="nav-search-icon" aria-label="Search">
        <svg viewBox="0 0 256 256" aria-hidden="true" focusable="false">
          <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" fill="currentColor"></path>
        </svg>
      </button>
      <input type="search" name="q" class="nav-search-input" placeholder="Search" aria-label="Search" />`;
    navTools.prepend(search);
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    // Mobile drill-in: a shared "back" bar shown at the top of a drilled
    // section panel. Tapping it collapses the open section and returns to the
    // level-1 list. It lives once at the top of .nav-sections and is only
    // visible (via CSS) while .nav-drilled is set.
    const backBar = document.createElement('button');
    backBar.type = 'button';
    backBar.className = 'nav-back';
    backBar.setAttribute('aria-label', 'Back to main menu');
    backBar.innerHTML = '<span class="nav-back-icon" aria-hidden="true"></span><span>Back</span>';
    backBar.addEventListener('click', () => {
      toggleAllNavSections(navSections);
      navSections.classList.remove('nav-drilled');
    });
    navSections.prepend(backBar);

    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      // A top-level item is a mega-menu trigger when it wraps a panel <div>
      // (the mega content). Mark it .nav-drop and tag the panel .nav-megamenu.
      const panel = navSection.querySelector(':scope > div');
      if (panel) {
        navSection.classList.add('nav-drop');
        panel.classList.add('nav-megamenu');
        // Each direct child of the panel is a column/article; the Featured
        // article (heading text "Featured") gets a dedicated class for styling.
        panel.querySelectorAll(':scope > div').forEach((col) => {
          col.classList.add('nav-mega-col');
          const h = col.querySelector('h3');
          const heading = h ? h.textContent.trim() : '';
          // Featured article. The source styles its background per menu:
          //   "Featured"       → dark slate (Explore, Learn)
          //   "Featured Blue"  → brand-blue box (Why DS sustainability)
          //   "Featured Grey"  → light-grey box (Support)
          //   "Featured Plain" → no box, plain text (Why DS scholarship)
          // The variant is carried as a suffix on the fragment heading (portable
          // through DA); map it to a modifier class and restore the visible
          // "Featured" label.
          const featured = /^featured\b/i.exec(heading);
          if (featured) {
            col.classList.add('nav-mega-featured');
            const variant = heading.slice('Featured'.length).trim().toLowerCase();
            if (variant) col.classList.add(`nav-mega-featured-${variant}`);
            if (h && heading !== 'Featured') h.textContent = 'Featured';
          }
          // "Quick links" column (Explore menu): tag it + flag the panel so the
          // CSS can lay the 6 category columns on one row and drop the quick
          // links + featured box onto a second row (matching the source).
          if (/^quick links$/i.test(heading)) {
            col.classList.add('nav-mega-quicklinks');
            panel.classList.add('nav-megamenu-wide');
          }
        });
      }
      // Desktop: a mega-menu trigger (has a panel) TOGGLES its panel on click
      // (not hover) so the pointer can travel down into the panel without it
      // closing. Its <a> carries a real href, so preventDefault to toggle
      // instead of navigating. Plain links (no panel) navigate normally. The
      // blue hover underline stays CSS-driven (:hover + [aria-expanded='true']),
      // so it also persists while the panel is open.
      navSection.addEventListener('click', (e) => {
        if (!panel) return; // plain link — let it navigate
        if (isDesktop.matches) {
          // Desktop: toggle the mega panel open/closed on click.
          e.preventDefault();
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        } else {
          // Mobile/tablet: DRILL IN. Only a tap on the top-level label anchor
          // (not on content inside the mega panel) opens the section.
          const labelLink = navSection.querySelector(':scope > a');
          const inPanel = e.target.closest('.nav-megamenu');
          const onLabel = labelLink && labelLink.contains(e.target);
          if (inPanel || !onLabel) return;
          e.preventDefault();
          toggleAllNavSections(navSections); // collapse siblings
          navSection.setAttribute('aria-expanded', 'true');
          navSections.classList.add('nav-drilled');
        }
      });

      // Mobile category accordion (level 3): each mega column heading toggles
      // its own content open/closed inside the drilled section panel.
      if (panel) {
        panel.querySelectorAll(':scope > .nav-mega-col:not(.nav-mega-featured):not(.nav-mega-quicklinks) > h3').forEach((h3) => {
          h3.addEventListener('click', (e) => {
            if (isDesktop.matches) return;
            e.stopPropagation();
            const col = h3.closest('.nav-mega-col');
            const open = col.getAttribute('aria-expanded') === 'true';
            col.setAttribute('aria-expanded', open ? 'false' : 'true');
          });
        });
      }
    });

    // Click outside the open mega menu closes it (desktop).
    document.addEventListener('click', (e) => {
      if (!isDesktop.matches) return;
      if (!navSections.contains(e.target)) toggleAllNavSections(navSections);
    });
    // Escape closes the open mega menu and returns focus to its trigger.
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && isDesktop.matches) {
        const open = navSections.querySelector('[aria-expanded="true"]');
        toggleAllNavSections(navSections);
        if (open) open.querySelector(':scope > a')?.focus();
      }
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
