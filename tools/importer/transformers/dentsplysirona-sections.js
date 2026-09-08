/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: dentsplysirona section breaks + section metadata.
 * Inserts an <hr> before each non-first section and a Section Metadata block
 * for each styled section (section-4 "dark", section-6 "blue").
 * Section selectors come from page-templates.json (DOM-verified during analysis).
 *
 * Uses both hooks by design: block parsers run between beforeTransform and
 * afterTransform and call element.replaceWith(block) on section elements, so
 * breaks are inserted in beforeTransform (while section elements still exist)
 * with a temporary marker attribute, and metadata blocks are anchored to that
 * marker in afterTransform.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Resolve each section element via its (position-sensitive) selector NOW,
    // while the DOM still matches page-templates.json, and tag the element
    // itself with a stable marker attribute. We must resolve every section
    // BEFORE inserting any <hr>, because inserting breaks shifts the
    // :nth-of-type() positions the selectors depend on — resolving lazily in a
    // loop that also mutates the DOM would break later selectors (this was the
    // en-us bug: after the first <hr>, section-4..8's nth-of-type selectors no
    // longer matched). So: first pass resolves + tags, second pass inserts hrs.
    const resolved = sections.map((section) => ({
      section,
      el: element.querySelector(section.selector),
    }));
    resolved.forEach(({ section, el }) => {
      if (el) el.setAttribute(SECTION_MARKER_ATTR, section.id);
    });
    for (let i = resolved.length - 1; i >= 0; i -= 1) {
      const { section, el } = resolved[i];
      if (i === 0) continue; // first section: no leading break
      if (!el) continue; // selector didn't match — skip, never guess
      el.before(document.createElement('hr'));
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run (they replace block instances *inside* the section
    // grids, e.g. .iconcard/.imagetile — the tagged grid container survives).
    // Locate each styled section by its stable marker attribute (NOT the
    // nth-of-type selector, which is now invalid because beforeTransform
    // inserted <hr> siblings) and append its Section Metadata block as the LAST
    // child *inside* the section element, so it unambiguously belongs to that
    // section after the docx -> markdown -> plain.html section split.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);

      if (section.style && sectionEl) {
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.append(metadataBlock);
      }

      // Clean up the temporary marker attribute.
      if (sectionEl) sectionEl.removeAttribute(SECTION_MARKER_ATTR);
    }
  }
}
