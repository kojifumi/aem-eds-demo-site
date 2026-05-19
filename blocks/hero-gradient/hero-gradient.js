/**
 * Hero (Gradient) block — UE outputs class "hero-gradient" (not "hero").
 * One row per model field; CTA style comes from cta_linkType rows and/or strong/em wrappers.
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

const CTA_LINK_TYPES = new Set(['primary', 'secondary']);

function parseLinkType(text) {
  const value = text?.trim().toLowerCase();
  return CTA_LINK_TYPES.has(value) ? value : null;
}

/** UE may emit linkType as its own row (text "primary" / "secondary"), not as strong/em. */
function readLinkTypeFromCell(cell) {
  if (!cell || cell.querySelector('a')) return null;
  return parseLinkType(cell.textContent);
}

function inferLinkTypeFromCell(cell) {
  if (cell?.querySelector('strong')) return 'primary';
  if (cell?.querySelector('em')) return 'secondary';
  return null;
}

function applyCtaButtonClasses(link, linkType) {
  link.className = 'button';
  if (linkType === 'primary') link.classList.add('primary');
  else if (linkType === 'secondary') link.classList.add('secondary');
}

function resolveLinkType(cell, pendingType, ctaIndex) {
  return pendingType
    || inferLinkTypeFromCell(cell)
    || (ctaIndex === 0 ? 'primary' : 'secondary');
}

/**
 * Collect CTA links and styles from UE rows (one field per row).
 * cta_linkType / cta2_linkType often appear as a text-only row after the link.
 */
function collectCtas(block) {
  const rows = getRows(block);
  const ctas = [];
  let pendingType = null;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const cell = getCell(row);
    if (cell) {
      const link = cell.querySelector('a');
      const typeOnly = !link && readLinkTypeFromCell(cell);

      if (typeOnly) {
        pendingType = typeOnly;
        row.remove();
      } else if (link) {
        let linkType = pendingType;
        pendingType = null;

        if (!linkType) {
          const nextCell = getCell(rows[i + 1]);
          const nextType = readLinkTypeFromCell(nextCell);
          if (nextType) {
            linkType = nextType;
            rows[i + 1]?.remove();
          }
        }

        ctas.push({
          link,
          linkType: resolveLinkType(cell, linkType, ctas.length),
          row,
        });
      }
    }
  }

  return ctas;
}

/** Undo consolidated layout so decoration can run again after UE patches. */
function prepareForDecorate(block) {
  const rows = getRows(block);
  if (rows.length !== 1) return;

  const cell = getCell(rows[0]);
  if (!cell?.querySelector('h1, h2, .hero-eyebrow, .hero-ctas')) return;

  const items = [...cell.children];
  block.textContent = '';

  items.forEach((item) => {
    if (item.classList?.contains('hero-ctas')) {
      item.querySelectorAll('a').forEach((link, index) => {
        const row = document.createElement('div');
        const inner = document.createElement('div');
        const isPrimary = link.classList.contains('primary')
          || (!link.classList.contains('secondary') && index === 0);
        const wrap = document.createElement(isPrimary ? 'strong' : 'em');
        wrap.append(link.cloneNode(true));
        inner.append(wrap);
        row.append(inner);
        block.append(row);
      });
      return;
    }

    const row = document.createElement('div');
    const inner = document.createElement('div');
    inner.append(item);
    row.append(inner);
    block.append(row);
  });
}

/** UE emits one block row per field; collapse into a single inner cell for layout/CSS. */
function consolidateContent(block) {
  const wrapper = document.createElement('div');
  const cell = document.createElement('div');
  const ordered = [];

  [...block.children].forEach((child) => {
    if (child.tagName === 'P' && child.classList.contains('hero-eyebrow')) {
      ordered.push(child);
      return;
    }
    if (child.tagName !== 'DIV') return;

    const rowCell = getCell(child);
    if (!rowCell) return;

    if (rowCell.querySelector('picture, img')) return;

    const ctas = rowCell.querySelector('.hero-ctas');
    if (ctas) {
      ordered.push(ctas);
      return;
    }

    [...rowCell.childNodes].forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        ordered.push(node);
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = node.textContent.trim();
        ordered.push(p);
      }
    });
  });

  ordered.forEach((el) => cell.append(el));
  wrapper.append(cell);
  block.replaceChildren(wrapper);
}

export default function decorate(block) {
  block.classList.add('hero', 'gradient');
  prepareForDecorate(block);

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

  // CTAs: style from cta_linkType / cta2_linkType rows and/or strong/em wrappers
  const ctaWrapper = document.createElement('div');
  ctaWrapper.className = 'hero-ctas';

  collectCtas(block).forEach(({ link, linkType, row }) => {
    const p = document.createElement('p');
    p.className = 'button-container';
    applyCtaButtonClasses(link, linkType);
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

  consolidateContent(block);
}
