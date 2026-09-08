/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: dentsplysirona site-wide cleanup.
 * Removes non-authorable site chrome (header, footer, alert/promo experience
 * fragments, cookie consent) so the import contains only page-authorable content.
 * All selectors verified in migration-work/cleaned.html (source: dentsplysirona.com/de-ch).
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // OneTrust cookie consent banner + dark overlay filter block the page.
    // Found in cleaned.html: id="onetrust-consent-sdk", class="onetrust-pc-dark-filter ...".
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.onetrust-pc-dark-filter',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable experience-fragment chrome. Found in cleaned.html:
    // .cmp-sticky-header is the real global header/nav (a <div>, not a <header>),
    // plus cmp-experiencefragment--{header,footer,alert-on-top,add-practice-alert}.
    // NOTE: the bare `header` selector and .cmp-experiencefragment--lets-connect-banner
    // are intentionally NOT removed. The only <header> element in cleaned.html
    // (line 3970) wraps the "Sprechen Sie uns an" lets-connect-banner, which page
    // analysis classified as genuine section-8 page content (iconcards + heading +
    // "Support besuchen" CTA). Removing them stripped section 8 (content-loss bug).
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
