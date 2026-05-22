/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

function isUniversalEditorCanvas() {
  return Boolean(document.querySelector('[data-aue-resource]'));
}

function restoreRows(block) {
  const table = block.querySelector(':scope > table');
  if (!table) return;

  [...table.querySelectorAll('tr')].forEach((tr) => {
    const row = document.createElement('div');
    [...tr.children].forEach((cell) => {
      const col = document.createElement('div');
      col.innerHTML = cell.innerHTML;
      row.append(col);
    });
    block.append(row);
  });
  table.remove();
}

function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

function decorateForPublish(block) {
  restoreRows(block);

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

  [...block.children].forEach((child, i) => {
    if (child.tagName !== 'DIV') return;
    const row = document.createElement('tr');
    if (header && i === 0) thead.append(row);
    else tbody.append(row);
    [...child.children].forEach((col) => {
      const cell = buildCell(header ? i : i + 1);
      const align = col.getAttribute('data-align');
      const valign = col.getAttribute('data-valign');
      if (align) cell.style.textAlign = align;
      if (valign) cell.style.verticalAlign = valign;
      cell.innerHTML = col.innerHTML;
      row.append(cell);
    });
  });
  block.replaceChildren(table);
}

/** UE: keep block/item rows so column fields stay editable in the properties rail. */
function decorateForEditor(block) {
  restoreRows(block);
  block.classList.add('table-ue');
}

export default async function decorate(block) {
  if (isUniversalEditorCanvas()) {
    decorateForEditor(block);
    return;
  }
  decorateForPublish(block);
}
