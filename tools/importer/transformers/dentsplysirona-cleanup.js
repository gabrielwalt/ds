/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: dentsplysirona site-wide cleanup.
 * Removes non-authorable site chrome (header, footer, alert/promo experience
 * fragments, cookie consent) and decorative inline-SVG UI icons so the import
 * contains only page-authorable content.
 * All selectors verified in migration-work/cleaned.html (source: dentsplysirona.com/en-us).
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // OneTrust cookie consent banner + dark overlay filter block the page.
    // The global legal / age-gate popup ("intended only for healthcare
    // professionals… must be 18 years old…") is a non-authorable consent
    // dialog, not page content — strip it so its text does not land in the
    // imported page.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.onetrust-pc-dark-filter',
      '.legal-popup',
      '.global-legal-popup',
    ]);

    // Orphan "Browse by category/goal/topic:" titles. On the top-level pages
    // (Explore/Learn/Why DS) these label an interactive category-browser widget
    // that is client-side hydrated and never imports — leaving just the bare
    // heading. Drop the heading so no empty labelled section is emitted.
    element.querySelectorAll('.cmp-title__text, h1, h2, h3, h4, h5, h6').forEach((h) => {
      if (/^browse by\b.*:?\s*$/i.test(h.textContent.trim())) {
        const wrapper = h.closest('.title') || h;
        wrapper.remove();
      }
    });

    // Shop page: remove the HIDDEN signed-in hero variant and any personalized
    // greeting placeholders. The Shop hero ships two variants — an anonymous
    // one (visible) and a signed-in one (`.cmp-shophero__signin`, carrying the
    // `hidden` class) that holds dynamic "Welcome, $Firstname!" text swapped in
    // client-side after auth. That placeholder is not authorable content, so it
    // must not land in the imported page. Drop the hidden signin hero outright,
    // then remove any leftover greeting paragraphs.
    element.querySelectorAll('.cmp-shophero__signin, .hero.hidden').forEach((el) => el.remove());
    element.querySelectorAll('p, span, div').forEach((el) => {
      const t = el.textContent.trim();
      if (/^welcome,?\s*\$?\{?firstname\}?!?$/i.test(t) || /^welcome!$/i.test(t)) {
        el.remove();
      }
    });

    // Remove decorative inline-SVG UI icons (arrows, icon-card glyphs, sprite
    // sheets). The source embeds ~150 of these as huge `data:image/svg+xml;
    // base64,...` <img> and inline <svg> elements. When a block parser captures
    // one into a table cell, the massive data-URI string overflows GFM pipe-
    // table serialization and forces html2md into pandoc grid-table mode, which
    // md2da cannot convert back to HTML — the whole .plain.html then lands as
    // raw markdown text. These icons are decoration, not content, so stripping
    // them before parsing both fixes serialization and avoids junk cells.
    element.querySelectorAll('img[src^="data:image/svg"]').forEach((img) => img.remove());
    element.querySelectorAll('svg').forEach((svg) => svg.remove());
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable experience-fragment chrome. The real global header/nav is
    // the .cmp-sticky-header <div>. NOTE: the bare `header` selector and
    // `.cmp-experiencefragment--lets-connect-banner` are intentionally NOT
    // removed — section 9 ("Didn't find what you need? Let's connect", with the
    // Connect with us / Download center / Help topics / Newsletter iconcards) is
    // genuine page content that the source wraps in a <header class=
    // "experiencefragment"> / lets-connect-banner. Removing them stripped
    // section 9 entirely (content-loss bug). The sticky header and the
    // header/footer/alert experience fragments below are the true chrome.
    WebImporter.DOMUtils.remove(element, [
      '.cmp-sticky-header',
      '.cmp-experiencefragment--header',
      '.cmp-experiencefragment--footer',
      '.cmp-experiencefragment--alert-on-top',
      '.cmp-experiencefragment--add-practice-alert',
      'footer',
      'nav',
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
