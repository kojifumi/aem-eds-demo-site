/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

function isUniversalEditorCanvas() {
  return Boolean(document.querySelector('[data-aue-resource]'));
}

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

function applyFaqClass(block) {
  const section = block.closest('.section');
  if (section?.classList.contains('faq')) {
    block.classList.add('faq-accordion');
  }
}

/** UE: keep block/item rows so Label and Body fields stay editable in the properties rail. */
function decorateForEditor(block) {
  restoreRows(block);
  applyFaqClass(block);
  block.classList.add('accordion-ue');
}

function decorateForPublish(block) {
  restoreRows(block);
  applyFaqClass(block);

  [...block.children].forEach((row) => {
    if (row.tagName !== 'DIV') return;

    const label = row.children[0];
    const body = row.children[1];
    if (!label || !body) return;

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);

    body.className = 'accordion-item-body';

    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}

export default function decorate(block) {
  if (isUniversalEditorCanvas()) {
    decorateForEditor(block);
    return;
  }
  decorateForPublish(block);
}
