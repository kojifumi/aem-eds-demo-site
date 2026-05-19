/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

function restoreRows(block) {
  [...block.querySelectorAll(':scope > details.accordion-item')].forEach((details) => {
    const row = document.createElement('div');
    const labelCell = document.createElement('div');
    const bodyCell = document.createElement('div');
    const summary = details.querySelector('.accordion-item-label');
    const body = details.querySelector('.accordion-item-body');
    if (summary) labelCell.append(...summary.childNodes);
    if (body) bodyCell.append(...body.childNodes);
    row.append(labelCell, bodyCell);
    details.replaceWith(row);
  });
}

export default function decorate(block) {
  restoreRows(block);

  if (block.closest('.section.faq')) {
    block.classList.add('faq-accordion');
  }

  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
