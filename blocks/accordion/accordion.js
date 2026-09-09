/*
 * accordion — FAQ / expandable list (source: dentsplysirona.com .cmp-accordion).
 * Authored as an EDS block whose rows are [ title , body ] pairs. Each row
 * becomes a native <details> so it is accessible and keyboard-operable with no
 * extra JS. Single-expansion (source behaviour: opening one closes the others)
 * is handled with a lightweight toggle listener.
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  rows.forEach((row) => {
    const cells = [...row.children];
    const titleCell = cells[0];
    const bodyCell = cells[1];
    if (!titleCell) return;

    const details = document.createElement('details');
    details.className = 'accordion-item';

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-title';
    // move the title content (text/inline markup) into the summary
    while (titleCell.firstChild) summary.append(titleCell.firstChild);

    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    if (bodyCell) {
      while (bodyCell.firstChild) body.append(bodyCell.firstChild);
    }

    details.append(summary, body);
    block.append(details);
  });

  // Single-expansion: opening one item closes any other open item (matches the
  // source's data-cmp-single-expansion behaviour).
  block.addEventListener('toggle', (e) => {
    const opened = e.target;
    if (opened.tagName !== 'DETAILS' || !opened.open) return;
    block.querySelectorAll('details.accordion-item[open]').forEach((d) => {
      if (d !== opened) d.open = false;
    });
  }, true);
}
