/**
 * Hero (Gradient) block — UE outputs class "hero-gradient" (not "hero").
 * One row per model field; CTA style comes from cta_linkType rows and/or strong/em wrappers.
 */

function normalizeText(text) {
  return (text ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Lead copy is usually a full sentence; highlight phrases are short labels. */
function isLeadCopy(text, headingText = '') {
  const t = normalizeText(text);
  const heading = normalizeText(headingText);
  if (!t || t.length < 25 || t.length >= 500) return false;
  if (t === heading || heading.includes(t)) return false;
  if (t.length >= 40) return true;
  return /[。.!?]/.test(t);
}

const HIGHLIGHT_MAX_LEN = 40;

function wrapHighlightInHeading(heading, highlightText) {
  const full = normalizeText(heading.textContent);
  const phrase = normalizeText(highlightText);
  const start = full.indexOf(phrase);
  if (start < 0) return false;

  const before = full.slice(0, start);
  const after = full.slice(start + phrase.length);
  heading.textContent = '';
  if (before) heading.append(document.createTextNode(before));
  const em = document.createElement('em');
  em.textContent = phrase;
  heading.append(em);
  if (after) heading.append(document.createTextNode(after));
  return true;
}

/** Headline field without the highlight phrase; highlight is a separate UE row. */
function insertHighlightIntoHeading(heading, highlightText) {
  const text = normalizeText(heading.textContent);
  const phrase = normalizeText(highlightText);
  heading.textContent = '';

  const em = document.createElement('em');
  em.textContent = phrase;

  const trimmed = text.replace(phrase, '').trim();
  if (trimmed) {
    heading.append(document.createTextNode(trimmed));
    heading.append(document.createTextNode(' '));
  }
  heading.append(em);
}

/** Remove orphan highlight <p> and merge into h1 after consolidate (safety net). */
function finalizeHeadlineHighlight(block) {
  const h1 = block.querySelector('h1, h2');
  const content = block.querySelector('.hero-content') || block;
  if (!h1 || !content) return;

  const orphans = [...content.querySelectorAll('p')].filter((p) => !p.classList.contains('hero-eyebrow')
    && !p.classList.contains('hero-lead')
    && !p.closest('.hero-ctas')
    && normalizeText(p.textContent).length > 0
    && normalizeText(p.textContent).length <= HIGHLIGHT_MAX_LEN
    && !isLeadCopy(p.textContent, h1.textContent));

  const orphan = orphans[0];
  if (!orphan) return;

  const phrase = normalizeText(orphan.textContent);
  const headingText = normalizeText(h1.textContent);

  if (!h1.querySelector('em')) {
    if (headingText.includes(phrase)) {
      wrapHighlightInHeading(h1, phrase);
    } else {
      insertHighlightIntoHeading(h1, phrase);
    }
  }
  orphan.remove();
}

function getRows(block) {
  return [...block.children].filter((row) => row.tagName === 'DIV');
}

function getCell(row) {
  return row?.firstElementChild;
}

function rowHasImage(row) {
  const cell = getCell(row);
  return Boolean(cell?.querySelector('picture, img'));
}

function blockHasImage(block) {
  return getRows(block).some((row) => rowHasImage(row))
    || Boolean(block.querySelector(':scope > div > .hero-media picture, :scope > div > .hero-media img'));
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

  const outer = rows[0];
  const mediaEl = outer.querySelector(':scope > .hero-media');
  const content = outer.querySelector(':scope > .hero-content') || getCell(outer);
  if (!content?.querySelector('h1, h2, .hero-eyebrow, .hero-ctas')) return;

  const newRows = [];

  if (mediaEl?.firstElementChild) {
    const imageRow = document.createElement('div');
    const imageCell = document.createElement('div');
    imageCell.append(mediaEl.firstElementChild);
    imageRow.append(imageCell);
    newRows.push(imageRow);
  }

  [...content.children].forEach((item) => {
    if (item.classList?.contains('hero-ctas')) {
      item.querySelectorAll('a').forEach((link, index) => {
        const row = document.createElement('div');
        const inner = document.createElement('div');
        const isPrimary = link.classList.contains('primary')
          || (!link.classList.contains('secondary') && index === 0);
        const wrap = document.createElement(isPrimary ? 'strong' : 'em');
        wrap.append(link);
        inner.append(wrap);
        row.append(inner);
        newRows.push(row);
      });
      return;
    }

    const row = document.createElement('div');
    const inner = document.createElement('div');
    inner.append(item);
    row.append(inner);
    newRows.push(row);
  });

  block.replaceChildren(...newRows);
}

/** UE emits one block row per field; collapse into a single inner cell for layout/CSS.
 *  When `keepImage` is true, the first picture/img is preserved as a sibling of the text cell. */
function consolidateContent(block, keepImage) {
  const wrapper = document.createElement('div');
  const cell = document.createElement('div');
  cell.className = 'hero-content';
  const ordered = [];
  let picture = null;

  [...block.children].forEach((child) => {
    if (child.tagName === 'P' && child.classList.contains('hero-eyebrow')) {
      ordered.push(child);
      return;
    }
    if (child.tagName !== 'DIV') return;

    const rowCell = getCell(child);
    if (!rowCell) return;

    const pic = rowCell.querySelector('picture, img');
    if (pic) {
      if (keepImage && !picture) picture = pic.tagName === 'PICTURE' ? pic : pic.closest('picture') || pic;
      return;
    }

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
  if (keepImage && picture) {
    const mediaCell = document.createElement('div');
    mediaCell.className = 'hero-media';
    mediaCell.append(picture);
    wrapper.append(mediaCell);
  }
  block.replaceChildren(wrapper);
}

export default function decorate(block) {
  block.classList.add('hero', 'gradient');
  prepareForDecorate(block);

  const hasImage = blockHasImage(block);
  if (hasImage) block.classList.add('with-image');

  const rows = getRows(block);
  const h1 = block.querySelector('h1, h2');
  if (!h1) return;

  const h1RowIndex = rows.findIndex((row) => row.contains(h1));

  // Eyebrow: first short text row before h1 (skip empty image / alt rows)
  const eyebrowRow = rows.find((row, i) => {
    if (i >= h1RowIndex || row.contains(h1)) return false;
    const cell = getCell(row);
    if (!cell || cell.querySelector('a, h1, h2, picture, img')) return false;
    const text = cell.textContent.trim();
    return text && text.length <= 40;
  });
  if (eyebrowRow) {
    const text = getCell(eyebrowRow).textContent.trim();
    const p = document.createElement('p');
    p.className = 'hero-eyebrow';
    p.textContent = text;
    eyebrowRow.replaceWith(p);
  }

  const headingText = normalizeText(h1.textContent);

  // Mark lead rows before highlight pass (product page lead is often ~45 chars)
  getRows(block).forEach((row, i) => {
    if (i <= h1RowIndex || row.contains(h1)) return;
    if (row.querySelector('a, picture, img, h1, h2')) return;
    const text = normalizeText(row.textContent);
    if (isLeadCopy(text, headingText)) row.dataset.heroLead = 'true';
  });
  const leadRow = getRows(block).find((row) => row.dataset.heroLead === 'true');

  // Headline highlight + UE metadata rows after h1 (titleType, etc.)
  const skipHighlightValues = new Set(['h1', 'h2', 'h3', 'h4', 'primary', 'secondary']);

  getRows(block).forEach((row, i) => {
    if (i <= h1RowIndex || row.dataset.heroLead === 'true' || row.contains(h1) || row.querySelector('a, picture, img')) {
      return;
    }

    const highlightCell = getCell(row);
    const highlightText = normalizeText(highlightCell?.textContent);
    if (!highlightText || highlightText.length >= 80) return;

    if (row.dataset.heroLead === 'true' || isLeadCopy(highlightText, headingText)) {
      return;
    }

    if (skipHighlightValues.has(highlightText.toLowerCase())) {
      row.remove();
      return;
    }

    const existingEm = normalizeText(h1.querySelector('em')?.textContent);
    if (existingEm === highlightText) {
      row.remove();
      return;
    }

    if (highlightText === headingText) {
      const em = document.createElement('em');
      em.textContent = headingText;
      h1.textContent = '';
      h1.append(em);
      row.remove();
    } else if (headingText.includes(highlightText)) {
      if (!wrapHighlightInHeading(h1, highlightText)) {
        insertHighlightIntoHeading(h1, highlightText);
      }
      row.remove();
    } else if (highlightText.length <= HIGHLIGHT_MAX_LEN) {
      insertHighlightIntoHeading(h1, highlightText);
      row.remove();
    } else {
      row.remove();
    }
  });

  if (leadRow) {
    const cell = getCell(leadRow);
    if (cell) {
      let lead = cell.querySelector('p.hero-lead, p:not(.button-container)');
      if (!lead) {
        lead = document.createElement('p');
        lead.className = 'hero-lead';
        lead.textContent = cell.textContent.trim();
        cell.textContent = '';
        cell.append(lead);
      } else {
        lead.classList.add('hero-lead');
      }
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

  consolidateContent(block, hasImage);
  finalizeHeadlineHighlight(block);

  if (hasImage) {
    const content = block.querySelector('.hero-content');
    const highlight = normalizeText(h1.querySelector('em')?.textContent);
    if (content && highlight) {
      content.querySelectorAll('p').forEach((p) => {
        if (p.classList.contains('hero-eyebrow')
          || p.classList.contains('hero-lead')
          || p.closest('.hero-ctas')) return;
        if (normalizeText(p.textContent) === highlight) p.remove();
      });
    }
  }
}
