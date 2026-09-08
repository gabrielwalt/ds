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
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.onetrust-pc-dark-filter',
    ]);

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
