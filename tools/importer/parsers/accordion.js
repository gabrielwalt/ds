/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: accordion
 * Base block: accordion
 * Source: https://www.dentsplysirona.com/en-us/support.html
 * Instances: .accordion.panelcontainer (AEM Core Component accordion)
 *
 * The accordion has one `.cmp-accordion__item` per FAQ; each item exposes a
 * title (`.cmp-accordion__title`) and a panel (`.cmp-accordion__panel`). The
 * EDS `accordion` block table is one row per item: [ title , panel-content ].
 */
export default function parse(element, { document }) {
  const items = Array.from(
    element.querySelectorAll('.cmp-accordion__item, [data-cmp-hook-accordion="item"]'),
  );

  const cells = [];
  items.forEach((item) => {
    const title = item.querySelector(
      '.cmp-accordion__title, [data-cmp-hook-accordion="title"]',
    );
    const panel = item.querySelector(
      '.cmp-accordion__panel, [data-cmp-hook-accordion="panel"]',
    );

    const titleText = title ? title.textContent.trim() : '';
    if (!titleText && !panel) return;

    // Title cell: plain text (the source wraps it in a span/button).
    const titleEl = document.createElement('p');
    titleEl.textContent = titleText;

    // Panel cell: move the panel's authored content across.
    const panelEl = document.createElement('div');
    if (panel) {
      Array.from(panel.childNodes).forEach((n) => panelEl.appendChild(n.cloneNode(true)));
    }

    cells.push([titleEl, panelEl]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'accordion',
    cells,
  });
  element.replaceWith(block);
}
