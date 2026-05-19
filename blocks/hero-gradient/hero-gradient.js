/**
 * Hero (Gradient) block — UE outputs class "hero-gradient" (not "hero").
 * Fields are one row per property; text is often in <motion> cells, CTAs as strong/em links.
 */

function wrapHighlightInHeading(heading, highlightText) {
  const full = heading.textContent;
  const start = full.indexOf(highlightText);
  if (start < 0) return false;

  const before = full.slice(0, start);
  const after = full.slice(start + highlightText.length);
  heading.textContent = '';
  if (before) heading.append(document.createTextNode(before));
  const em = document.createElement('em');
  em.textContent = highlightText;
  heading.append(em);
  if (after) heading.append(document.createTextNode(after));
  return true;
}

function getRows(block) {
  return [...block.children].filter((row) => row.tagName === 'DIV');
}

function getCell(row) {
  return row?.firstElementChild;
}

export default function decorate(block) {
  block.classList.add('hero', 'gradient');

  const rows = getRows(block);
  const h1 = block.querySelector('h1, h2');
  if (!h1) return;

  const h1RowIndex = rows.findIndex((row) => row.contains(h1));

  // Eyebrow: row immediately before headline row
  if (h1RowIndex > 0) {
    const eyebrowCell = getCell(rows[h1RowIndex - 1]);
    if (eyebrowCell && !eyebrowCell.querySelector('a, h1, h2, picture')) {
      const text = eyebrowCell.textContent.trim();
      if (text) {
        const p = document.createElement('p');
        p.className = 'hero-eyebrow';
        p.textContent = text;
        rows[h1RowIndex - 1].replaceWith(p);
      }
    }
  }

  // Headline highlight: row after h1 with short duplicate text
  const highlightRowIndex = rows.findIndex(
    (row, i) => i > h1RowIndex && !row.contains(h1) && !row.querySelector('a'),
  );
  if (highlightRowIndex > -1) {
    const highlightCell = getCell(rows[highlightRowIndex]);
    const highlightText = highlightCell?.textContent.trim();
    const headingText = h1.textContent.trim();
    if (
      highlightText
      && highlightText.length < 80
      && highlightText !== headingText
      && headingText.includes(highlightText)
    ) {
      wrapHighlightInHeading(h1, highlightText);
      rows[highlightRowIndex].remove();
    }
  }

  // Lead: wrap long text cell after headline in <p>
  const leadRow = [...block.children].find(
    (row) => row.tagName === 'DIV'
      && !row.querySelector('h1, h2, a, picture')
      && row.textContent.trim().length > 40,
  );
  if (leadRow) {
    const cell = getCell(leadRow);
    if (cell && !cell.querySelector('p')) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      cell.textContent = '';
      cell.append(p);
    }
  }

  // CTAs: UE outputs <strong><a> and <em><a> in separate rows (not .button-container)
  const ctaWrapper = document.createElement('div');
  ctaWrapper.className = 'hero-ctas';

  getRows(block).forEach((row) => {
    const cell = getCell(row);
    const link = cell?.querySelector('a');
    if (!link) return;

    const p = document.createElement('p');
    p.className = 'button-container';
    link.classList.add('button');
    if (cell.querySelector('strong')) link.classList.add('primary');
    if (cell.querySelector('em')) link.classList.add('secondary');
    p.append(link);
    ctaWrapper.append(p);
    row.remove();
  });

  if (ctaWrapper.children.length) {
    const row = document.createElement('div');
    const cell = document.createElement('div');
    cell.append(ctaWrapper);
    row.append(cell);
    block.append(row);
  }
}
