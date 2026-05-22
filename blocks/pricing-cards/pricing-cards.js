import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Pricing Cards block.
 *
 * UE row layout (1 row = 1 plan):
 *   name | price | period | description | features | featured | cta link | cta label
 *
 * UE may omit empty leading columns (e.g. when Plan name is blank), so we detect
 * price in the first cell and shift indices. Period values like "/月" must not
 * use a leading slash — Franklin turns "/…" into links.
 */

const FEATURED_VALUES = new Set(['yes', 'true', 'featured', '1']);

function textOf(cell) {
  return cell?.textContent.trim() ?? '';
}

function looksLikePrice(text) {
  if (!text) return false;
  return /^custom$/i.test(text) || /^[$¥€£]/.test(text) || /^\d[\d,.]*$/.test(text);
}

function looksLikePlanName(text) {
  if (!text) return false;
  return /^[A-Za-z][A-Za-z0-9\s-]{0,30}$/.test(text) && !looksLikePrice(text);
}

function isPeriodLink(anchor) {
  if (!anchor) return false;
  const text = anchor.textContent.trim();
  const href = (anchor.getAttribute('href') || '').trim();
  if (/^\/(\s*mo|\s*yr)/i.test(text)) return true;
  if (/月|\/\s*mo|\/\s*yr|per month/i.test(text)) return true;
  if (href.startsWith('/') && text.length <= 8 && !/(signup|contact|products|pricing)/i.test(href)) {
    return /月|mo|yr|年/i.test(text);
  }
  return false;
}

function cellPlainText(cell) {
  if (!cell) return '';
  const anchor = cell.querySelector(':scope a[href]');
  if (anchor && isPeriodLink(anchor)) return anchor.textContent.trim();
  return textOf(cell);
}

function isFeatured(cell) {
  return FEATURED_VALUES.has(cellPlainText(cell).toLowerCase());
}

function rowHasContent(cells) {
  return cells.some((cell) => cellPlainText(cell) || cell.querySelector('ul, ol'));
}

function resolveFieldIndices(cells) {
  const firstText = cellPlainText(cells[0]);
  const nameMissing = cells.length > 0
    && !looksLikePlanName(firstText)
    && looksLikePrice(firstText);
  const offset = nameMissing ? -1 : 0;

  return {
    name: offset >= 0 ? 0 : -1,
    price: 1 + offset,
    period: 2 + offset,
    description: 3 + offset,
    features: 4 + offset,
    featured: 5 + offset,
  };
}

function getCell(cells, index) {
  return index >= 0 && index < cells.length ? cells[index] : null;
}

function findCta(cells) {
  const ctaCell = cells.find((cell) => {
    const anchor = cell.querySelector(':scope a[href]');
    return anchor && !isPeriodLink(anchor);
  });
  if (!ctaCell) return null;

  const anchor = ctaCell.querySelector(':scope a[href]');
  const ctaIndex = cells.indexOf(ctaCell);
  const labelCell = cells[ctaIndex + 1];
  const labelFromNext = labelCell && !labelCell.querySelector('a[href]') ? textOf(labelCell) : '';
  return {
    anchor,
    label: labelFromNext || anchor.textContent.trim(),
  };
}

function buildPlan(row) {
  const cells = [...row.children].filter((child) => child.tagName === 'DIV');
  if (!rowHasContent(cells)) return null;

  const idx = resolveFieldIndices(cells);
  const nameCell = getCell(cells, idx.name);
  const priceCell = getCell(cells, idx.price);
  const periodCell = getCell(cells, idx.period);
  const descCell = getCell(cells, idx.description);
  const featuresCell = getCell(cells, idx.features);
  const featuredCell = getCell(cells, idx.featured);
  const cta = findCta(cells);

  const li = document.createElement('li');
  li.className = 'pricing-card';
  moveInstrumentation(row, li);
  if (featuredCell && isFeatured(featuredCell)) li.classList.add('pricing-card-featured');

  const name = cellPlainText(nameCell);
  if (name) {
    const tag = document.createElement('p');
    tag.className = 'pricing-card-tag';
    tag.textContent = name;
    li.append(tag);
  }

  const priceText = cellPlainText(priceCell);
  const periodText = cellPlainText(periodCell);
  if (priceText || periodText) {
    const price = document.createElement('p');
    price.className = 'pricing-card-price';
    if (priceText) {
      const strong = document.createElement('strong');
      strong.textContent = priceText;
      price.append(strong);
    }
    if (periodText) {
      const span = document.createElement('span');
      span.textContent = periodText.startsWith(' ') ? periodText : ` ${periodText}`;
      price.append(span);
    }
    li.append(price);
  }

  const desc = cellPlainText(descCell);
  if (desc) {
    const p = document.createElement('p');
    p.className = 'pricing-card-desc';
    p.textContent = desc;
    li.append(p);
  }

  if (featuresCell) {
    const list = featuresCell.querySelector('ul, ol');
    if (list) {
      list.classList.add('pricing-card-features');
      li.append(list);
    } else {
      const text = cellPlainText(featuresCell);
      if (text) {
        const ul = document.createElement('ul');
        ul.className = 'pricing-card-features';
        text.split(/\n|·|・|\s+\/\s+/).map((s) => s.trim()).filter(Boolean).forEach((item) => {
          const liItem = document.createElement('li');
          liItem.textContent = item;
          ul.append(liItem);
        });
        if (ul.children.length) li.append(ul);
      }
    }
  }

  if (cta?.anchor) {
    const a = cta.anchor.cloneNode(true);
    if (cta.label) a.textContent = cta.label;
    a.classList.add('button');
    a.classList.add(li.classList.contains('pricing-card-featured') ? 'primary' : 'secondary');
    const wrap = document.createElement('p');
    wrap.className = 'button-container pricing-card-cta';
    wrap.append(a);
    li.append(wrap);
  }

  return li;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'pricing-cards-list';

  [...block.children].forEach((row) => {
    if (row.tagName !== 'DIV') return;
    const plan = buildPlan(row);
    if (plan) ul.append(plan);
  });

  block.replaceChildren(ul);
}
