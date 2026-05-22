/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 *
 * UE: container rows (col1–col4 per Table Row). Publish: row/cell divs → <table>.
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

function rowHasCells(row) {
  return [...row.children].some((col) => col.textContent.trim());
}

function decorateForPublish(block) {
  restoreRows(block);

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

  let rowIndex = 0;
  [...block.children].forEach((child) => {
    if (child.tagName !== 'DIV' || !rowHasCells(child)) return;
    const row = document.createElement('tr');
    if (header && rowIndex === 0) thead.append(row);
    else tbody.append(row);
    [...child.children].forEach((col) => {
      const cell = buildCell(header ? rowIndex : rowIndex + 1);
      const align = col.getAttribute('data-align');
      const valign = col.getAttribute('data-valign');
      if (align) cell.style.textAlign = align;
      if (valign) cell.style.verticalAlign = valign;
      cell.innerHTML = col.innerHTML;
      row.append(cell);
    });
    rowIndex += 1;
  });

  if (!table.querySelector('tr')) return;
  block.replaceChildren(table);
}

/** UE: keep block/item rows so column fields stay editable in the properties rail. */
function decorateForEditor(block) {
  restoreRows(block);
  block.classList.add('table-ue');

  let maxCols = 0;
  let rowIndex = 0;
  [...block.children].forEach((row) => {
    if (row.tagName !== 'DIV' || !rowHasCells(row)) return;
    row.classList.add('table-ue-row');
    if (rowIndex === 0 && !block.classList.contains('no-header')) {
      row.classList.add('table-ue-header');
    }
    [...row.children].forEach((cell, cellIndex) => {
      cell.classList.add('table-ue-cell');
      if (rowIndex > 0 && cellIndex === 0) cell.classList.add('table-ue-cell-feature');
    });
    maxCols = Math.max(maxCols, row.children.length);
    rowIndex += 1;
  });
  if (maxCols > 0) block.style.setProperty('--table-cols', String(maxCols));
}

export default async function decorate(block) {
  if (isUniversalEditorCanvas()) {
    decorateForEditor(block);
    return;
  }
  decorateForPublish(block);
}
